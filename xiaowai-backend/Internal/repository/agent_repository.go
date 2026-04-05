package repository

import (
	"context"
	"xiaowai-backend/Internal/model"
	"xiaowai-backend/pkg/logger"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type AgentRepository struct {
	db *gorm.DB
}

func NewAgentRepository(db *gorm.DB) *AgentRepository {
	return &AgentRepository{db: db}
}

func (r *AgentRepository) CreateAgent(ctx context.Context, db *gorm.DB, agent *model.Agent) error {
	logger.InfoWithTrace(ctx, "创建智能体配置", zap.Uint("id", agent.ID))
	result := db.WithContext(ctx).Model(&model.Agent{}).
		Create(agent)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
