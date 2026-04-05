package service

import (
	"context"
	"xiaowai-backend/Internal/dto"
	"xiaowai-backend/Internal/model"
	"xiaowai-backend/Internal/repository"
)

type MessageService struct {
	messageRepo *repository.MessageRepository
}

func NewMessageService(messageRepo *repository.MessageRepository) *MessageService {
	return &MessageService{messageRepo: messageRepo}
}

func (s *MessageService) CreateMessage(ctx context.Context, userID uint, req *dto.CreateSessionRequest) error {
	session := &model.Session{
		UserID:  userID,
		AgentID: req.AgentID,
	}
	return s.sessionRepo.CreateSession(ctx, session)
}
