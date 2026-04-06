package service

import (
	"context"
	"xiaowai-backend/Internal/model"
	"xiaowai-backend/Internal/repository"
)

type SessionService struct {
	sessionRepo *repository.SessionRepository
}

func NewSessionService(sessionRepo *repository.SessionRepository) *SessionService {
	return &SessionService{sessionRepo: sessionRepo}
}

func (s *SessionService) CreateSession(ctx context.Context, userID uint, agentID uint) (*model.Session, error) {
	session := &model.Session{
		UserID:  userID,
		AgentID: agentID,
		Title:   "未定义会话",
	}
	if err := s.sessionRepo.CreateSession(ctx, session); err != nil {
		return nil, err
	}
	return session, nil
}
