package controller

import (
	"io"
	"net/http"
	"spaceblue/Internal/dto"
	"spaceblue/Internal/model"
	"spaceblue/Internal/service"
	"spaceblue/pkg/jwt"
	"spaceblue/pkg/logger"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type UserController struct {
	userService *service.UserService
}

func NewUserController(userService *service.UserService) *UserController {
	return &UserController{userService: userService}
}

func (uc *UserController) Register(c *gin.Context) {
	var req dto.RegisterRequest
	ctx := c.Request.Context()

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.WarnWithTrace(ctx, "注册参数验证失败", zap.String("ip", c.ClientIP()), zap.Error(err))
		c.JSON(http.StatusBadRequest, dto.APIResponse{Code: http.StatusBadRequest, Msg: "参数错误", Data: nil})
		return
	}
	if err := uc.userService.Register(ctx, req.UserName, req.Email, req.Phone, req.PassWord, req.Code); err != nil {
		logger.ErrorWithTrace(ctx, "注册失败",
			zap.String("username", req.UserName),
			zap.String("email", req.Email),
			zap.Error(err))

		userMsg := "注册失败，请稍后重试"
		status := http.StatusInternalServerError
		if err.Error() == "用户名已存在" || err.Error() == "邮箱已存在" || err.Error() == "验证码错误" || err.Error() == "验证码已过期" || err.Error() == "验证码不存在或已过期" {
			status = http.StatusUnprocessableEntity
			userMsg = err.Error()
		}

		c.JSON(status, dto.APIResponse{Code: status, Msg: userMsg, Data: nil})
		return
	}

	logger.InfoWithTrace(ctx, "用户注册成功",
		zap.String("username", req.UserName),
		zap.String("email", req.Email))

	c.JSON(http.StatusOK, dto.APIResponse{Code: 0, Msg: "注册成功", Data: nil})
}

func (uc *UserController) Login(c *gin.Context) {
	var req dto.LoginRequest
	ctx := c.Request.Context()

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.WarnWithTrace(ctx, "参数验证失败", zap.Error(err))
		c.JSON(http.StatusBadRequest, dto.APIResponse{Code: http.StatusBadRequest, Msg: "参数错误:" + err.Error(), Data: nil})
		return
	}

	user, err := uc.userService.Login(ctx, req.UserName, req.PassWord)
	if err != nil {
		logger.WarnWithTrace(ctx, "登录失败",
			zap.String("username", req.UserName),
			zap.Error(err))

		if err.Error() == "登录失败次数过多，请10分钟后再试" {
			c.JSON(http.StatusTooManyRequests, dto.APIResponse{Code: http.StatusTooManyRequests, Msg: err.Error(), Data: nil})
			return
		}
		if err.Error() == "用户名不存在" || err.Error() == "密码错误" {
			c.JSON(http.StatusUnauthorized, dto.APIResponse{Code: http.StatusUnauthorized, Msg: "用户名或密码错误", Data: nil})
			return
		}

		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "登录失败，请稍后重试", Data: nil})
		return
	}

	token, err := jwt.GenerateToken(user.ID)
	if err != nil {
		logger.ErrorWithTrace(ctx, "生成Token失败",
			zap.Uint("user_id", user.ID),
			zap.Error(err))
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "系统错误，请稍后重试", Data: nil})
		return
	}

	c.SetCookie("token", token, 604800, "/", "", false, true)

	logger.InfoWithTrace(ctx, "用户登录成功",
		zap.Uint("user_id", user.ID),
		zap.String("username", user.UserName))

	c.JSON(http.StatusOK, dto.APIResponse{
		Code: 0,
		Msg:  "登录成功",
		Data: dto.LoginData{Token: token},
	})
}

func (uc *UserController) Logout(c *gin.Context) {
	c.SetCookie("token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, dto.APIResponse{Code: 0, Msg: "退出成功", Data: nil})
}

func (uc *UserController) UpdateProfile(c *gin.Context) {
	var req dto.ProfileRequest
	ctx := c.Request.Context()

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.WarnWithTrace(ctx, "参数解析失败", zap.Error(err))
		c.JSON(http.StatusBadRequest, dto.APIResponse{Code: http.StatusBadRequest, Msg: "请求参数格式错误: " + err.Error(), Data: nil})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		logger.ErrorWithTrace(ctx, "上下文中未找到用户ID")
		c.JSON(http.StatusUnauthorized, dto.APIResponse{Code: http.StatusUnauthorized, Msg: "未授权，请重新登录", Data: nil})
		return
	}

	updatedProfile, err := uc.userService.UpdateProfile(ctx, userID.(uint), req)
	if err != nil {
		logger.ErrorWithTrace(ctx, "更新用户资料失败", zap.Error(err))
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "更新失败: " + err.Error(), Data: nil})
		return
	}
	logger.InfoWithTrace(ctx, "用户资料更新成功", zap.Uint("user_id", userID.(uint)))
	c.JSON(http.StatusOK, dto.APIResponse{Code: 0, Msg: "更新成功", Data: toUserProfileData(updatedProfile)})
}

func (uc *UserController) GetProfile(c *gin.Context) {
	ctx := c.Request.Context()
	userID, exists := c.Get("userID")
	if !exists {
		logger.ErrorWithTrace(ctx, "上下文中未找到用户ID")
		c.JSON(http.StatusUnauthorized, dto.APIResponse{Code: http.StatusUnauthorized, Msg: "未授权，请重新登录", Data: nil})
		return
	}

	profile, err := uc.userService.GetProfile(ctx, userID.(uint))
	if err != nil {
		logger.ErrorWithTrace(ctx, "获取用户资料失败", zap.Error(err))
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "获取资料失败", Data: nil})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Code: 0, Msg: "ok", Data: toUserProfileData(profile)})
}

func (uc *UserController) UpdateAvatar(c *gin.Context) {
	var req dto.AvatarRequest
	ctx := c.Request.Context()
	userID, exists := c.Get("userID")
	if !exists {
		logger.ErrorWithTrace(ctx, "上下文中未找到用户ID")
		c.JSON(http.StatusUnauthorized, dto.APIResponse{Code: http.StatusUnauthorized, Msg: "未授权，请重新登录", Data: nil})
		return
	}

	if err := c.ShouldBind(&req); err != nil {
		logger.WarnWithTrace(ctx, "用户未上传图片", zap.Uint("id", userID.(uint)), zap.Error(err))
		c.JSON(http.StatusBadRequest, dto.APIResponse{Code: http.StatusBadRequest, Msg: "请上传图片", Data: nil})
		return
	}

	fileHeader := req.Avatar

	if fileHeader.Size > 50*1024*1024 {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Code: http.StatusBadRequest, Msg: "图片大小不能超过 50MB", Data: nil})
		return
	}
	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "读取文件失败", Data: nil})
		return
	}
	defer file.Close()

	if err := uc.userService.UpdateAvatar(ctx, file, userID.(uint)); err != nil {
		logger.ErrorWithTrace(ctx, "更新用户头像失败", zap.Uint("id", userID.(uint)), zap.Error(err))
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "更新失败: " + err.Error(), Data: nil})
		return
	}
	logger.InfoWithTrace(ctx, "用户头像更新成功", zap.Uint("id", userID.(uint)))
	c.JSON(http.StatusOK, dto.APIResponse{Code: 0, Msg: "更新成功", Data: nil})
}

func (uc *UserController) PreviewAvatar(c *gin.Context) {
	ctx := c.Request.Context()
	idParam := c.Param("id")

	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil || id64 == 0 {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Code: http.StatusBadRequest, Msg: "用户ID无效", Data: nil})
		return
	}

	body, contentType, err := uc.userService.GetAvatarPreview(ctx, uint(id64))
	if err != nil {
		if err.Error() == "用户不存在" {
			c.JSON(http.StatusNotFound, dto.APIResponse{Code: http.StatusNotFound, Msg: err.Error(), Data: nil})
			return
		}
		if err.Error() == "头像不存在" || err.Error() == "头像地址无效" {
			c.JSON(http.StatusNotFound, dto.APIResponse{Code: http.StatusNotFound, Msg: err.Error(), Data: nil})
			return
		}
		logger.ErrorWithTrace(ctx, "预览头像失败", zap.Uint("id", uint(id64)), zap.Error(err))
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "头像预览失败", Data: nil})
		return
	}
	defer body.Close()

	c.Header("Content-Type", contentType)
	_, _ = io.Copy(c.Writer, body)
}

func toUserProfileData(profile *model.UserProfile) dto.UserProfileData {
	return dto.UserProfileData{
		ID:         profile.ID,
		NickName:   profile.NickName,
		BirthDay:   profile.BirthDay,
		Avatar:     profile.Avatar,
		Gender:     profile.Gender,
		Hobbies:    profile.Hobbies,
		Signature:  profile.Signature,
		Experience: profile.Experience,
		UpdatedAt:  profile.UpdatedAt,
	}
}
