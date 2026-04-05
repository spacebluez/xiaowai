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

func (s *SessionService) GetSession(ctx context.Context, userID uint) ([]model.Session, error) {
	session, err := s.sessionRepo.FindSessionByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return session, nil
}
