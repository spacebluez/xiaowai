package repository

import (
	"context"
	"xiaowai-backend/Internal/model"

	"gorm.io/gorm"
)

type MessageRepository struct {
	db *gorm.DB
}

func NewMessageRepository(db *gorm.DB) *MessageRepository {
	return &MessageRepository{db: db}
}

func (m *MessageRepository) CreateMessageBySessionID(ctx context.Context, sessionID uint, message *model.Message) error {
	return m.db.WithContext(ctx).Create(message).Error
}

func (m *MessageRepository) FindMessageBySessionID(ctx context.Context, sessionID uint) ([]model.Message, error) {
	var messages []model.Message
	if err := m.db.WithContext(ctx).Where("session_id = ?", sessionID).Find(&messages).Error; err != nil {
		return nil, err
	}
	return messages, nil
}

func (m *MessageRepository) FindMessageBySessionIDLimit(ctx context.Context, sessionID uint, limit uint) ([]model.Message, error) {
	var messages []model.Message
	if err := m.db.WithContext(ctx).Where("session_id = ?", sessionID).Limit(int(limit)).Find(&messages).Error; err != nil {
		return nil, err
	}
	return messages, nil
}
