package controller

import (
	"net/http"
	"spaceblue/Internal/dto"
	"spaceblue/Internal/service"

	"github.com/gin-gonic/gin"
)

type VerificationController struct {
	verificationService *service.VerificationService
}

func NewVerificationController(verificationService *service.VerificationService) *VerificationController {
	return &VerificationController{verificationService: verificationService}
}

func (vc *VerificationController) SendCode(c *gin.Context) {
	var req dto.SendCodeRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Code: http.StatusBadRequest, Msg: "参数错误:" + err.Error(), Data: nil})
		return
	}

	if err := vc.verificationService.SendCode(c.Request.Context(), req.Email, c.ClientIP()); err != nil {
		if err.Error() == "验证码获取操作频繁，60s后再试" || err.Error() == "今日验证码发送次数已达上限，请明天再试" || err.Error() == "请求过于频繁，请稍后再试" {
			c.JSON(http.StatusTooManyRequests, dto.APIResponse{Code: http.StatusTooManyRequests, Msg: err.Error(), Data: nil})
			return
		}
		if err.Error() == "邮箱地址不可投递，请检查后重试" {
			c.JSON(http.StatusBadRequest, dto.APIResponse{Code: http.StatusBadRequest, Msg: err.Error(), Data: nil})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "验证码发送失败，请稍后重试", Data: nil})
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{Code: 0, Msg: "验证码已发送，请查收邮件", Data: nil})
}
