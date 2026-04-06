package controller

import (
	"net/http"
	"xiaowai-backend/Internal/dto"
	"xiaowai-backend/Internal/model"
	"xiaowai-backend/Internal/service"
	"xiaowai-backend/pkg/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type SessionController struct {
	sessionService *service.SessionService
}

func NewSessionController(sessionService *service.SessionService) *SessionController {
	return &SessionController{sessionService: sessionService}
}

func (sc *SessionController) CreateSession(c *gin.Context) {
	ctx := c.Request.Context()
	userID, exists := c.Get("userID")
	if !exists {
		logger.ErrorWithTrace(ctx, "上下文中未找到用户ID")
		c.JSON(http.StatusUnauthorized, dto.APIResponse{Code: http.StatusUnauthorized, Msg: "未授权，请重新登录", Data: nil})
		return
	}

	logger.InfoWithTrace(ctx, "创建会话", zap.Uint("user_id", userID.(uint)))
	var req dto.CreateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.WarnWithTrace(ctx, "参数验证失败", zap.Error(err))
		c.JSON(http.StatusBadRequest, dto.APIResponse{Code: http.StatusBadRequest, Msg: "参数错误:" + err.Error(), Data: nil})
		return
	}
	var session *model.Session
	var err error
	if session, err = sc.sessionService.CreateSession(ctx, userID.(uint), req.AgentID); err != nil {
		logger.ErrorWithTrace(ctx, "创建会话失败", zap.Uint("user_id", userID.(uint)), zap.Error(err))
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "创建会话失败，请稍后再试", Data: nil})
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{
		Code: 0,
		Msg:  "会话创建成功",
		Data: dto.CreateSessionResponse{
			Session: dto.Session{
				ID:        session.ID,
				UserID:    session.UserID,
				AgentID:   session.AgentID,
				Title:     session.Title,
				CreatedAt: session.CreatedAt,
				UpdatedAt: session.UpdatedAt,
			},
		},
	})
	logger.InfoWithTrace(ctx, "会话创建成功", zap.Uint("user_id", userID.(uint)), zap.Uint("session_id", session.ID))
}

func (sc *SessionController) GetSessionListByUserID(c *gin.Context) {
	ctx := c.Request.Context()
	userID, exists := c.Get("userID")
	if !exists {
		logger.ErrorWithTrace(ctx, "上下文中未找到用户ID")
		c.JSON(http.StatusUnauthorized, dto.APIResponse{Code: http.StatusUnauthorized, Msg: "未授权，请重新登录", Data: nil})
		return

	}
	sessionList, err := sc.sessionService.GetSessionListByUserID(ctx, userID.(uint))
	if err != nil {
		logger.ErrorWithTrace(ctx, "获取会话列表失败", zap.Uint("user_id", userID.(uint)), zap.Error(err))
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Code: http.StatusInternalServerError, Msg: "获取会话列表失败，请稍后再试", Data: nil})
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{
		Code: 0,
		Msg:  "会话列表获取成功",
		Data: sessionList,
	})
}
