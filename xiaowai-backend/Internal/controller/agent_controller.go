package controller

import (
	"net/http"
	"spaceblue/Internal/dto"
	"spaceblue/Internal/service"
	"spaceblue/pkg/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type AgentController struct {
	agentService *service.AgentService
}

func NewAgentController(agentService *service.AgentService) *AgentController {
	return &AgentController{agentService: agentService}
}

func (ac *AgentController) ChatAgent(c *gin.Context) {
	var req dto.ChatAgentRequest
	ctx := c.Request.Context()

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.WarnWithTrace(ctx, "参数验证失败", zap.Error(err))
		c.JSON(http.StatusBadRequest, dto.APIResponse{Code: http.StatusBadRequest, Msg: "参数错误:" + err.Error(), Data: nil})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		logger.ErrorWithTrace(ctx, "上下文中未找到用户ID")
		c.JSON(http.StatusUnauthorized, dto.APIResponse{Code: http.StatusUnauthorized, Msg: "未授权，请重新登录", Data: nil})
		return
	}

	output, err := ac.agentService.ChatAgent(ctx, userID.(uint), req.Input)
	if err != nil {
		logger.ErrorWithTrace(ctx, "对话失败", zap.Uint("id", userID.(uint)), zap.Error(err))
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "对话失败，请稍后再试", Data: nil})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Code: 0, Msg: "ok", Data: dto.ChatAgentData{Output: output}})
}
