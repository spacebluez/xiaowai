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

func (r *AgentRepository) GetAgentByID(ctx context.Context, db *gorm.DB, id uint) (*model.Agent, error) {
	var agent model.Agent
	result := db.WithContext(ctx).Model(&model.Agent{}).
		Where("id = ?", id).
		First(&agent)
	if result.Error != nil {
		return nil, result.Error
	}
	return &agent, nil
}

func (r *AgentRepository) UpdateAgent(ctx context.Context, db *gorm.DB, agent *model.Agent) error {
	logger.InfoWithTrace(ctx, "更新智能体配置", zap.Uint("id", agent.ID))
	result := db.WithContext(ctx).Model(&model.Agent{}).
		Where("id = ?", agent.ID).
		Updates(agent)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (r *AgentRepository) DeleteAgent(ctx context.Context, db *gorm.DB, id uint) error {
	logger.InfoWithTrace(ctx, "删除智能体配置", zap.Uint("id", id))
	result := db.WithContext(ctx).Model(&model.Agent{}).
		Where("id = ?", id).
		Delete(&model.Agent{})
	if result.Error != nil {
		return result.Error
	}
	return nil
}
