package service

import (
	"context"
	"xiaowai-backend/Internal/dto"
	"xiaowai-backend/Internal/model"
	"xiaowai-backend/Internal/repository"
	"xiaowai-backend/pkg/llm/qianwen"
	"xiaowai-backend/pkg/logger"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type AgentService struct {
	agent       *qianwen.QianWenClient
	agentRepo   *repository.AgentRepository
	sessionRepo *repository.SessionRepository
	messageRepo *repository.MessageRepository
	db          *gorm.DB
}

func NewAgentService(agent *qianwen.QianWenClient, db *gorm.DB, agentRepo *repository.AgentRepository, sessionRepo *repository.SessionRepository, messageRepo *repository.MessageRepository) *AgentService {
	return &AgentService{
		agent:       agent,
		agentRepo:   agentRepo,
		sessionRepo: sessionRepo,
		db:          db,
	}
}

func (s *AgentService) CreateAgent(ctx context.Context, id uint, req *dto.CreateAgentRequest) error {
	logger.InfoWithTrace(ctx, "创建智能体配置", zap.Uint("id", id), zap.Any("req", req))

	agent := &model.Agent{
		UserID:    id,
		Name:      req.Name,
		ModelName: req.ModelName,
		Persona:   req.Persona,
	}
	if err := s.agentRepo.CreateAgent(ctx, s.db, agent); err != nil {
		logger.ErrorWithTrace(ctx, "创建智能体配置失败", zap.Error(err))
		return err
	}
	logger.InfoWithTrace(ctx, "智能体配置创建成功", zap.Uint("id", agent.ID))
	return nil
}

func (s *AgentService) ChatAgent(ctx context.Context, id uint, req *dto.ChatAgentRequest) (output string, err error) {
	logger.InfoWithTrace(ctx, "对话开始", zap.Uint("id", id), zap.Any("req", req))
	var sessionID uint
	if req.SessionID == 0 {
		session := &model.Session{
			UserID:  id,
			AgentID: req.AgentID,
		}
		if sessionID, err = s.sessionRepo.CreateSession(ctx, session); err != nil {
			logger.ErrorWithTrace(ctx, "创建会话失败", zap.Error(err), zap.Uint("id", id))
			return "", err
		}
	} else {
		session, err := s.sessionRepo.FindSessionByUserIDAndSessionID(ctx, id, req.SessionID)
		if err != nil {
			logger.ErrorWithTrace(ctx, "查询会话失败", zap.Error(err))
			return "", err
		}
		sessionID = session.ID
	}
	messages, err := s.sessionRepo.FindMessagesBySessionID(ctx, s.db, sessionID)
	if err != nil {
		logger.ErrorWithTrace(ctx, "查询消息失败", zap.Error(err))
		return "", err
	}

	return output, nil
}

func (s *AgentService) GetAgentList(ctx context.Context, id uint) ([]model.Agent, error) {
	logger.InfoWithTrace(ctx, "获取智能体列表", zap.Uint("id", id))
	var agents []model.Agent
	agents, err := s.agentRepo.GetAgentList(ctx, s.db, id)
	if err != nil {
		logger.ErrorWithTrace(ctx, "获取智能体列表失败", zap.Error(err))
		return nil, err
	}
	return agents, nil
}
