package repository

import (
	"context"
	"errors"
	"xiaowai-backend/Internal/model"
	"xiaowai-backend/pkg/logger"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) IsExistByID(ctx context.Context, id uint) bool {
	logger.DebugWithTrace(ctx, "检查用户ID是否存在", zap.Uint("id", id))

	var user model.User
	exists := r.db.WithContext(ctx).Where("id = ?", id).First(&user).Error == nil

	logger.DebugWithTrace(ctx, "用户ID存在检查结果",
		zap.Uint("id", id),
		zap.Bool("exists", exists))

	return exists
}

func (r *UserRepository) IsExistByUsername(ctx context.Context, username string) bool {
	logger.DebugWithTrace(ctx, "检查用户名是否存在", zap.String("username", username))

	var user model.User
	exists := r.db.WithContext(ctx).Where("username = ?", username).First(&user).Error == nil

	logger.DebugWithTrace(ctx, "用户名存在检查结果",
		zap.String("username", username),
		zap.Bool("exists", exists))

	return exists
}

func (r *UserRepository) IsExistByEmail(ctx context.Context, email string) bool {
	logger.DebugWithTrace(ctx, "检查邮箱是否存在", zap.String("email", email))

	var user model.User
	exists := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error == nil

	logger.DebugWithTrace(ctx, "邮箱存在检查结果",
		zap.String("email", email),
		zap.Bool("exists", exists))

	return exists
}

func (r *UserRepository) GetUserByUsername(ctx context.Context, username string) (*model.User, error) {
	logger.DebugWithTrace(ctx, "查询用户信息", zap.String("username", username))

	var user model.User
	if err := r.db.WithContext(ctx).Where("username=?", username).First(&user).Error; err != nil {
		logger.ErrorWithTrace(ctx, "查询用户失败",
			zap.String("username", username),
			zap.Error(err))
		return nil, err
	}

	logger.DebugWithTrace(ctx, "查询用户成功",
		zap.Uint("user_id", user.ID),
		zap.String("username", username))

	return &user, nil
}

func (r *UserRepository) CreateUser(ctx context.Context, user *model.User) error {
	logger.InfoWithTrace(ctx, "创建用户",
		zap.String("username", user.UserName),
		zap.String("email", user.Email))

	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		logger.ErrorWithTrace(ctx, "创建用户失败",
			zap.String("username", user.UserName),
			zap.Error(err))
		return err
	}

	logger.InfoWithTrace(ctx, "用户创建成功",
		zap.Uint("user_id", user.ID),
		zap.String("username", user.UserName))

	return nil
}

func (r *UserRepository) CreateUserWithProfile(ctx context.Context, tx *gorm.DB, user *model.User, profile *model.UserProfile) error {
	logger.InfoWithTrace(ctx, "创建用户",
		zap.String("username", user.UserName),
		zap.String("email", user.Email))

	if err := tx.WithContext(ctx).Create(user).Error; err != nil {
		logger.ErrorWithTrace(ctx, "创建用户失败",
			zap.String("username", user.UserName),
			zap.Error(err))
		return err
	}
	logger.InfoWithTrace(ctx, "用户创建成功",
		zap.Uint("user_id", user.ID),
		zap.String("username", user.UserName))

	logger.InfoWithTrace(ctx, "开始创建用户信息表",
		zap.Uint("user_id", user.ID),
		zap.String("username", user.UserName))

	profile.ID = user.ID

	if err := tx.WithContext(ctx).Create(profile).Error; err != nil {
		logger.ErrorWithTrace(ctx, "创建用户信息表失败",
			zap.Uint("user_id", user.ID),
			zap.String("username", user.UserName),
			zap.Error(err))
		return err
	}
	logger.InfoWithTrace(ctx, "用户信息表创建成功",
		zap.Uint("user_id", user.ID),
		zap.String("username", user.UserName))
	return nil
}

func (r *UserRepository) UpdateProfile(ctx context.Context, profile *model.UserProfile) error {
	logger.InfoWithTrace(ctx, "修改用户信息表", zap.Uint("id", profile.ID))
	result := r.db.WithContext(ctx).Model(&model.UserProfile{}).
		Where("id = ?", profile.ID).
		Updates(profile)

	if result.Error != nil {
		logger.ErrorWithTrace(ctx, "更新用户信息失败", zap.Error(result.Error))
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("未找到对应用户或资料未变动")
	}
	logger.InfoWithTrace(ctx, "修改用户表成功", zap.Uint("id", profile.ID))
	return nil
}

func (r *UserRepository) UpdateAvatar(ctx context.Context, path string, id uint) error {
	logger.InfoWithTrace(ctx, "更新用户头像", zap.Uint("id", id))
	result := r.db.WithContext(ctx).Model(&model.UserProfile{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{"avatar": path})
	if result.Error != nil {
		logger.ErrorWithTrace(ctx, "更新用户头像失败", zap.Error(result.Error))
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("未找到对应用户或资料未变动")
	}
	logger.InfoWithTrace(ctx, "修改用户表成功", zap.Uint("id", id))
	return nil
}

func (r *UserRepository) GetProfileByID(ctx context.Context, id uint) (*model.UserProfile, error) {
	var profile model.UserProfile
	if err := r.db.WithContext(ctx).First(&profile, id).Error; err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *UserRepository) GetAvatarPathByUserID(ctx context.Context, id uint) (string, error) {
	var profile model.UserProfile
	if err := r.db.WithContext(ctx).Select("avatar").Where("id = ?", id).First(&profile).Error; err != nil {
		return "", err
	}
	return profile.Avatar, nil
}


