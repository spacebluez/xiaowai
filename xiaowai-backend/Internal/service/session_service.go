package service

import (
	"context"
	"time"
	"xiaowai-backend/Internal/dto"
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
	now := time.Now()
	session := &model.Session{
		UserID:    userID,
		AgentID:   agentID,
		Title:     "未定义会话",
		CreatedAt: now,
		UpdatedAt: now,
	}
	if err := s.sessionRepo.CreateSession(ctx, session); err != nil {
		return nil, err
	}
	return session, nil
}

func (s *SessionService) GetSessionListByUserID(ctx context.Context, userID uint) (*dto.GetSessionListResponse, error) {
	sessionList, err := s.sessionRepo.GetSessionListByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	sessionListDTO := make([]dto.Session, 0, len(*sessionList))
	for _, session := range *sessionList {
		sessionListDTO = append(sessionListDTO, dto.Session{
			ID:        session.ID,
			UserID:    session.UserID,
			AgentID:   session.AgentID,
			Title:     session.Title,
			CreatedAt: session.CreatedAt,
			UpdatedAt: session.UpdatedAt,
		})
	}
	return &dto.GetSessionListResponse{
		SessionList: sessionListDTO,
	}, nil
}
