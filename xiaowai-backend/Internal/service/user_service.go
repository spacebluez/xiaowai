package service

import (
	"context"
	"errors"
	"fmt"
	"io"
	"spaceblue/Internal/dto"
	"spaceblue/Internal/model"
	"spaceblue/Internal/repository"
	"spaceblue/pkg/logger"
	"spaceblue/pkg/oss"
	"spaceblue/pkg/redis"
	"spaceblue/pkg/util"
	"strconv"
	"strings"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type UserService struct {
	userRepo            *repository.UserRepository
	verificationService *VerificationService
	redisClient         *redis.Client
	db                  *gorm.DB
}

func NewUserService(userRepo *repository.UserRepository, verificationService *VerificationService, redisClient *redis.Client, db *gorm.DB) *UserService {
	return &UserService{
		userRepo:            userRepo,
		verificationService: verificationService,
		redisClient:         redisClient,
		db:                  db,
	}
}

func (s *UserService) Register(ctx context.Context, username, emailAddr, phone string, password, code string) error {
	logger.InfoWithTrace(ctx, "开始用户注册流程",
		zap.String("username", username),
		zap.String("email", emailAddr))

	if err := s.verificationService.VerifyCode(ctx, emailAddr, code); err != nil {
		logger.WarnWithTrace(ctx, "验证码验证失败",
			zap.String("email", emailAddr),
			zap.Error(err))
		return err
	}
	if s.userRepo.IsExistByUsername(ctx, username) {
		logger.WarnWithTrace(ctx, "用户名已存在", zap.String("username", username))
		return errors.New("用户名已存在")
	}
	if s.userRepo.IsExistByEmail(ctx, emailAddr) {
		logger.WarnWithTrace(ctx, "邮箱已存在", zap.String("email", emailAddr))
		return errors.New("邮箱已存在")
	}

	hashedPassword, err := util.HashPassword(password)
	if err != nil {
		logger.ErrorWithTrace(ctx, "密码加密失败", zap.Error(err))
		return errors.New("注册失败，请稍后重试")
	}

	user := &model.User{
		UserName: username,
		Email:    emailAddr,
		Phone:    phone,
		Password: hashedPassword,
	}

	profile := &model.UserProfile{
		Experience: 0,
		Gender:     "unknown",
		Avatar:     "default_avatar.png",
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		if err := s.userRepo.CreateUserWithProfile(ctx, tx, user, profile); err != nil {
			if isDuplicateEntryError(err) {
				return errors.New("用户名或邮箱已被占用（并发冲突）")
			}
			return err
		}
		return nil
	})
	if err != nil {
		logger.ErrorWithTrace(ctx, "用户注册事务执行失败", zap.Error(err))
		return err
	}

	logger.InfoWithTrace(ctx, "用户注册成功",
		zap.Uint("user_id", user.ID),
		zap.String("username", username))

	return nil
}

func isDuplicateEntryError(err error) bool {
	return strings.Contains(err.Error(), "1062") || strings.Contains(err.Error(), "Duplicate")
}

func (s *UserService) Login(ctx context.Context, username, password string) (*model.User, error) {
	logger.DebugWithTrace(ctx, "用户登录验证", zap.String("username", username))

	failKey := fmt.Sprintf("login:fail:%s", username)
	failStr, _ := s.redisClient.Get(ctx, failKey)
	failCount, _ := strconv.Atoi(failStr)
	if failCount >= 5 {
		return nil, errors.New("登录失败次数过多，请10分钟后再试")
	}

	user, err := s.userRepo.GetUserByUsername(ctx, username)
	if err != nil {
		_ = s.redisClient.Set(ctx, failKey, strconv.Itoa(failCount+1), 10*time.Minute)
		logger.WarnWithTrace(ctx, "用户不存在", zap.String("username", username))
		return nil, errors.New("用户名不存在")
	}

	if !util.CheckPassword(password, user.Password) {
		_ = s.redisClient.Set(ctx, failKey, strconv.Itoa(failCount+1), 10*time.Minute)
		logger.WarnWithTrace(ctx, "密码错误",
			zap.Uint("user_id", user.ID),
			zap.String("username", username))
		return nil, errors.New("密码错误")
	}

	_, _ = s.redisClient.Del(ctx, failKey)

	logger.InfoWithTrace(ctx, "用户登录验证成功",
		zap.Uint("user_id", user.ID),
		zap.String("username", username))

	return user, nil
}

func (s *UserService) UpdateProfile(ctx context.Context, id uint, req dto.ProfileRequest) (*model.UserProfile, error) {
	logger.DebugWithTrace(ctx, "更新用户信息表", zap.Uint("id", id))
	if ok := s.userRepo.IsExistByID(ctx, id); ok != true {
		logger.DebugWithTrace(ctx, "不存在该用户", zap.Uint("id", id))
		return nil, fmt.Errorf("不存在该id:%d用户", id)
	}

	profile := &model.UserProfile{
		ID:        id,
		NickName:  req.NickName,
		Avatar:    req.Avatar,
		Gender:    req.Gender,
		Hobbies:   req.Hobbies,
		Signature: req.Signature,
	}
	if req.BirthDay != "" {
		t, err := time.Parse("2006-01-02", req.BirthDay)
		if err != nil {
			logger.ErrorWithTrace(ctx, "生日日期格式不正确", zap.Uint("id", id))
			return nil, errors.New("生日日期格式不正确")
		}
		profile.BirthDay = &t
	}
	if err := s.userRepo.UpdateProfile(ctx, profile); err != nil {
		return nil, err
	}

	finalProfile, err := s.userRepo.GetProfileByID(ctx, id)
	if err != nil {
		logger.WarnWithTrace(ctx, "更新后未查到新数据", zap.Uint("id", id))
		return nil, err
	}
	return finalProfile, nil
}

func (s *UserService) GetProfile(ctx context.Context, id uint) (*model.UserProfile, error) {
	logger.DebugWithTrace(ctx, "查询用户资料", zap.Uint("id", id))
	if ok := s.userRepo.IsExistByID(ctx, id); ok != true {
		return nil, fmt.Errorf("不存在该id:%d用户", id)
	}

	profile, err := s.userRepo.GetProfileByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *UserService) UpdateAvatar(ctx context.Context, file io.Reader, id uint) error {
	logger.DebugWithTrace(ctx, "更新用户头像", zap.Uint("id", id))
	if ok := s.userRepo.IsExistByID(ctx, id); ok != true {
		logger.DebugWithTrace(ctx, "不存在该用户", zap.Uint("id", id))
		return fmt.Errorf("不存在该用户")
	}
	filepath := fmt.Sprintf("oss://spaceblue/users/avatar/%d+.jpg", id)
	if err := oss.PutObjectByPath(ctx, filepath, file); err != nil {
		logger.ErrorWithTrace(ctx, "更新用户头像失败", zap.Uint("id", id), zap.Error(err))
		return err
	}
	if err := s.userRepo.UpdateAvatar(ctx, filepath, id); err != nil {
		logger.ErrorWithTrace(ctx, "更新用户头像失败", zap.Uint("id", id), zap.Error(err))
		return err
	}
	logger.InfoWithTrace(ctx, "更新用户头像成功", zap.Uint("id", id))
	return nil
}

func (s *UserService) GetAvatarPreview(ctx context.Context, id uint) (io.ReadCloser, string, error) {
	avatarPath, err := s.userRepo.GetAvatarPathByUserID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, "", errors.New("用户不存在")
		}
		return nil, "", err
	}
	if avatarPath == "" {
		return nil, "", errors.New("头像不存在")
	}
	if !strings.HasPrefix(avatarPath, "oss://") {
		return nil, "", errors.New("头像地址无效")
	}

	object, err := oss.GetObjectByPath(ctx, avatarPath)
	if err != nil {
		return nil, "", err
	}
	if object.Body == nil {
		return nil, "", errors.New("头像读取失败")
	}

	contentType := "image/jpeg"
	if object.ContentType != nil && *object.ContentType != "" {
		contentType = *object.ContentType
	}

	return object.Body, contentType, nil
}
