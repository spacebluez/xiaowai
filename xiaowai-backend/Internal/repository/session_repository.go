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

func (s *SessionRepository) CreateSession(ctx context.Context, session *model.Session) error {
	if err := s.db.WithContext(ctx).Create(session).Error; err != nil {
		return err
	}
	return nil
}

func (s *SessionRepository) GetSessionByID(ctx context.Context, sessionID uint) (*model.Session, error) {
	var session model.Session
	if err := s.db.WithContext(ctx).Where("id = ?", sessionID).First(&session).Error; err != nil {
		return nil, err
	}
	return &session, nil
}

func (s *SessionRepository) GetSessionByUserID(ctx context.Context, userID uint) (*model.Session, error) {
	var session model.Session
	if err := s.db.WithContext(ctx).Where("user_id = ?", userID).First(&session).Error; err != nil {
		return nil, err
	}
	return &session, nil
}

func (s *SessionRepository) GetSessionListByUserID(ctx context.Context, userID uint) (*[]model.Session, error) {
	var sessions []model.Session
	if err := s.db.WithContext(ctx).Where("user_id = ?", userID).Order("created_at DESC").Find(&sessions).Error; err != nil {
		return nil, err
	}
	return &sessions, nil
}

func (s *SessionRepository) SetTitle(ctx context.Context, sessionID uint, title string) error {
	return s.db.WithContext(ctx).Model(&model.Session{}).Where("id = ?", sessionID).Update("title", title).Error
}
