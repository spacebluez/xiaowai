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

func (r *AgentRepository) GetAgentList(ctx context.Context, db *gorm.DB, id uint) ([]model.Agent, error) {
	logger.InfoWithTrace(ctx, "获取智能体列表", zap.Uint("id", id))
	var agents []model.Agent
	result := db.WithContext(ctx).Model(&model.Agent{}).
		Where("user_id = ?", id).
		Order("updated_at DESC").
		Find(&agents)
	if result.Error != nil {
		return nil, result.Error
	}
	return agents, nil
}

func (r *AgentRepository) FindAgentByID(ctx context.Context, db *gorm.DB, id uint) (*model.Agent, error) {
	var agent model.Agent
	result := db.WithContext(ctx).Model(&model.Agent{}).
		Where("id = ?", id).
		First(&agent)
	if result.Error != nil {
		return nil, result.Error
	}
	return &agent, nil
}
