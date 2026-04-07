package controller

import (
	"net/http"
	"xiaowai-backend/Internal/dto"
	"xiaowai-backend/Internal/service"
	"xiaowai-backend/pkg/logger"

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

	message, err := ac.agentService.ChatAgent(ctx, userID.(uint), &req)
	if err != nil {
		logger.ErrorWithTrace(ctx, "对话失败", zap.Uint("id", userID.(uint)), zap.Error(err))
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "对话失败，请稍后再试", Data: nil})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Code: 0, Msg: "ok", Data: dto.ChatAgentResponse{
		SessionID: message.SessionID,
		Role:      message.Role,
		Content:   message.Content,
		CreatedAt: message.CreatedAt,
	}})
}

func (ac *AgentController) CreateAgent(c *gin.Context) {
	var req dto.CreateAgentRequest
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

	if err := ac.agentService.CreateAgent(ctx, userID.(uint), &req); err != nil {
		logger.ErrorWithTrace(ctx, "创建智能体配置失败", zap.Uint("id", userID.(uint)), zap.Error(err))
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "创建智能体配置失败，请稍后再试", Data: nil})
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{Code: 0, Msg: "ok", Data: nil})
}

func (ac *AgentController) GetAgentList(c *gin.Context) {
	ctx := c.Request.Context()
	logger.InfoWithTrace(ctx, "获取智能体列表")
	userID, exists := c.Get("userID")
	if !exists {
		logger.ErrorWithTrace(ctx, "上下文中未找到用户ID")
		c.JSON(http.StatusUnauthorized, dto.APIResponse{Code: http.StatusUnauthorized, Msg: "未授权，请重新登录", Data: nil})
		return
	}
	agents, err := ac.agentService.GetAgentList(ctx, userID.(uint))
	if err != nil {
		logger.ErrorWithTrace(ctx, "获取智能体列表失败", zap.Error(err))
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "获取智能体列表失败，请稍后再试", Data: nil})
		return
	}
	logger.InfoWithTrace(ctx, "获取智能体列表成功", zap.Int("count", len(agents)))
	c.JSON(http.StatusOK, dto.APIResponse{Code: 0, Msg: "ok", Data: dto.AgentListResponse{Agents: &agents}})
}

func (ac *AgentController) UpdateAgent(c *gin.Context) {
	var req dto.UpdateAgentRequest
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
	if err := ac.agentService.UpdateAgent(ctx, userID.(uint), &req); err != nil {
		logger.ErrorWithTrace(ctx, "更新智能体配置失败", zap.Uint("id", userID.(uint)), zap.Error(err))
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "更新智能体配置失败，请稍后再试", Data: nil})
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{Code: 0, Msg: "ok", Data: nil})
}

func (ac *AgentController) DeleteAgent(c *gin.Context) {
	var req dto.DeleteAgentRequest
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
	if err := ac.agentService.DeleteAgent(ctx, userID.(uint), &req); err != nil {
		logger.ErrorWithTrace(ctx, "删除智能体配置失败", zap.Uint("id", userID.(uint)), zap.Error(err))
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "删除智能体配置失败，请稍后再试", Data: nil})
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{Code: 0, Msg: "ok", Data: nil})
}
