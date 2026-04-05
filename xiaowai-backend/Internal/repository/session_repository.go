package repository

import (
	"context"
	"xiaowai-backend/Internal/model"

	"gorm.io/gorm"
)

type SessionRepository struct {
	db *gorm.DB
}

func NewSessionRepository(db *gorm.DB) *SessionRepository {
	return &SessionRepository{db: db}
}

func (s *SessionRepository) CreateSession(ctx context.Context, session *model.Session) (uint, error) {
	if err := s.db.WithContext(ctx).Create(session).Error; err != nil {
		return 0, err
	}
	return session.ID, nil
}

func (s *SessionRepository) FindSessionByUserIDAndSessionID(ctx context.Context, userID uint, sessionID uint) (*model.Session, error) {
	var session model.Session
	if err := s.db.WithContext(ctx).Where("user_id = ? AND id = ?", userID, sessionID).First(&session).Error; err != nil {
		return nil, err
	}
	return &session, nil
}

func (s *SessionRepository) SetSessionTitle(ctx context.Context, id uint, title string) error {
	return s.db.WithContext(ctx).Where("id = ?", id).Update("title", title).Error
}
