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
	agent     *qianwen.QianWenClient
	agentRepo *repository.AgentRepository
	db        *gorm.DB
}

func NewAgentService(agent *qianwen.QianWenClient, db *gorm.DB, agentRepo *repository.AgentRepository) *AgentService {
	return &AgentService{
		agent:     agent,
		agentRepo: agentRepo,
		db:        db,
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

func (s *AgentService) ChatAgent(ctx context.Context, id uint, input string) (output string, err error) {
	logger.InfoWithTrace(ctx, "对话开始", zap.Uint("id", id))

	output, err = s.agent.ChatByWord(ctx, input)
	if err != nil {
		logger.ErrorWithTrace(ctx, "对话失败", zap.Error(err))
		return "", err
	}

	logger.InfoWithTrace(ctx, "对话结束", zap.String("output", output))
	return output, nil
}
