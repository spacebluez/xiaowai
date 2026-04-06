package controller

import (
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
	logger.InfoWithTrace(c, "创建会话", zap.Uint("id", c.GetUint("id")), zap.Any("req", c.Request.Body))
	var req dto.CreateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	var session *model.Session
	var err error
	if session, err = sc.sessionService.CreateSession(c, c.GetUint("id"), req.AgentID); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"APIResponse": dto.APIResponse{
		Code: 0,
		Msg:  "会话创建成功",
		Data: dto.CreateSessionResponse{
			ID:        session.ID,
			UserID:    session.UserID,
			AgentID:   session.AgentID,
			Title:     session.Title,
			CreatedAt: session.CreatedAt,
			UpdatedAt: session.UpdatedAt,
		},
	}})
	logger.InfoWithTrace(c, "会话创建成功", zap.Uint("id", c.GetUint("id")), zap.Uint("session_id", session.ID))
}
