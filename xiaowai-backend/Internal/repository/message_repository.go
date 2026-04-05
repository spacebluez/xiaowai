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

func (m *MessageRepository) FindMessageBySessionID(ctx context.Context, sessionID uint) ([]model.Message, error) {
	var messages []model.Message
	if err := m.db.WithContext(ctx).Where("session_id = ?", sessionID).Find(&messages).Error; err != nil {
		return nil, err
	}
	return messages, nil
}

func (m *MessageRepository) CreateMessage(ctx context.Context, message *model.Message) error {
	return m.db.WithContext(ctx).Create(message).Error
}

func (m *MessageRepository) FindSessionBySessionIDLimit(ctx context.Context, sessionID uint, limit int) ([]model.Session, error) {
	var sessions []model.Session
	if err := m.db.WithContext(ctx).Where("id = ?", sessionID).Order("created_at DESC").Limit(limit).Find(&sessions).Error; err != nil {
		return nil, err
	}
	return sessions, nil
}
