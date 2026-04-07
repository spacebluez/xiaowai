package service

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"
	"xiaowai-backend/Internal/dto"
	"xiaowai-backend/Internal/model"
	"xiaowai-backend/Internal/repository"
	"xiaowai-backend/pkg/llm/qianwen"
	"xiaowai-backend/pkg/logger"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type AgentService struct {
	agent       *qianwen.QianWenClient
	agentRepo   *repository.AgentRepository
	sessionRepo *repository.SessionRepository
	messageRepo *repository.MessageRepository
	db          *gorm.DB
}

func NewAgentService(agent *qianwen.QianWenClient, db *gorm.DB, agentRepo *repository.AgentRepository, sessionRepo *repository.SessionRepository, messageRepo *repository.MessageRepository) *AgentService {
	return &AgentService{
		agent:       agent,
		agentRepo:   agentRepo,
		sessionRepo: sessionRepo,
		messageRepo: messageRepo,
		db:          db,
	}
}

func (s *AgentService) CreateAgent(ctx context.Context, id uint, req *dto.CreateAgentRequest) error {
	logger.InfoWithTrace(ctx, "创建智能体配置", zap.Uint("id", id), zap.Any("req", req))

	agent := &model.Agent{
		UserID:    id,
		Name:      req.Name,
		ModelName: req.ModelName,
		Persona:   req.Persona,
	}
	if err := s.agentRepo.CreateAgent(ctx, s.db, agent); err != nil {
		logger.ErrorWithTrace(ctx, "创建智能体配置失败", zap.Error(err))
		return err
	}
	logger.InfoWithTrace(ctx, "智能体配置创建成功", zap.Uint("id", agent.ID))
	return nil
}

func (s *AgentService) ChatAgent(ctx context.Context, id uint, req *dto.ChatAgentRequest) (rsp *dto.ChatAgentResponse, err error) {
	logger.InfoWithTrace(ctx, "开始对话", zap.Uint("id", id), zap.Any("req", req))
	SessionID := req.SessionID
	Content := req.Content
	AgentID := req.AgentID
	if ok, err := s.ChatVerify(ctx, id, SessionID, AgentID); ok == false || err != nil {
		logger.ErrorWithTrace(ctx, "验证对话失败", zap.Error(err))
		return nil, err
	}
	agent, err := s.agentRepo.GetAgentByID(ctx, s.db, AgentID)
	if err != nil {
		logger.ErrorWithTrace(ctx, "获取智能体配置失败", zap.Error(err))
		return nil, err
	}
	messages, err := s.messageRepo.FindMessageBySessionIDLimit(ctx, SessionID, 10)
	if err != nil {
		logger.ErrorWithTrace(ctx, "获取消息失败", zap.Error(err))
		return nil, err
	}
	qianwenmessages := ConvertToLLMMessages(messages, agent.Name, agent.Persona)
	output, err := s.agent.ChatV2(ctx, Content, qianwenmessages)
	if err != nil {
		logger.ErrorWithTrace(ctx, "对话失败", zap.Error(err))
		return nil, err
	}
	//开始保存对话消息
	go s.saveMessage(ctx, SessionID, Content, output)
	return &dto.ChatAgentResponse{
		SessionID: SessionID,
		Role:      "assistant",
		Content:   output,
		CreatedAt: time.Now(),
	}, nil
}
func ConvertToLLMMessages(dbMsgs []model.Message, agentName string, persona string) qianwen.Messages {
	llmMsgs := make([]qianwen.Message, 0, len(dbMsgs))
	for _, m := range dbMsgs {
		llmMsgs = append(llmMsgs, qianwen.Message{
			Role:    m.Role,
			Content: m.Content,
		})
	}
	llmMsgs = append(llmMsgs, qianwen.Message{
		Role:    "system",
		Content: fmt.Sprintf("You are a helpful assistant. Your name is %s. Your persona is %s.", agentName, persona),
	})
	return qianwen.Messages{
		Messages: llmMsgs,
	}
}

func (s *AgentService) saveMessage(ctx context.Context, ssesionID uint, input string, output string) error {
	defer func() {
		if r := recover(); r != nil {
			logger.ErrorWithTrace(ctx, "保存消息失败", zap.Any("err", r))
		}
	}()
	tx := s.db.Begin()
	defer tx.Rollback()

	usermessage := model.Message{
		SessionID: ssesionID,
		Role:      "user",
		Content:   input,
		CreatedAt: time.Now(),
	}
	if err := tx.Create(&usermessage).Error; err != nil {
		return err
	}
	assistantmessage := model.Message{
		SessionID: ssesionID,
		Role:      "assistant",
		Content:   output,
		CreatedAt: time.Now(),
	}
	if err := tx.Create(&assistantmessage).Error; err != nil {
		return err
	}
	if err := tx.Commit().Error; err != nil {
		return err
	}
	return nil
}

func (s *AgentService) GetAgentList(ctx context.Context, id uint) ([]model.Agent, error) {
	logger.InfoWithTrace(ctx, "获取智能体列表", zap.Uint("id", id))
	var agents []model.Agent
	agents, err := s.agentRepo.GetAgentList(ctx, s.db, id)
	if err != nil {
		logger.ErrorWithTrace(ctx, "获取智能体列表失败", zap.Error(err))
		return nil, err
	}
	return agents, nil
}

func (s *AgentService) ChatVerify(ctx context.Context, id uint, SessionID uint, AgentID uint) (bool, error) {
	logger.InfoWithTrace(ctx, "验证对话", zap.Uint("id", id), zap.Uint("SessionID", SessionID), zap.Uint("AgentID", AgentID))
	if AgentID == 0 {
		if _, err := s.sessionRepo.GetSessionByUserID(ctx, id); err != nil {
			return false, err
		}
	}
	agent, err := s.agentRepo.GetAgentByID(ctx, s.db, AgentID)
	if err != nil {
		logger.ErrorWithTrace(ctx, "获取智能体配置失败", zap.Error(err))
		return false, err
	}
	if agent.UserID != id {

		return false, errors.New("智能体用户与会体配置不匹配")
	}
	Session, err := s.sessionRepo.GetSessionByID(ctx, SessionID)
	if err != nil {
		logger.ErrorWithTrace(ctx, "获取会话失败", zap.Error(err))
		return false, err
	}
	if Session.UserID != id {
		return false, errors.New("会话用户与会体配置不匹配")
	}
	return true, nil
}

func (s *AgentService) UpdateAgent(ctx context.Context, id uint, req *dto.UpdateAgentRequest) error {
	logger.InfoWithTrace(ctx, "更新智能体配置", zap.Uint("id", id), zap.Any("req", req))
	agent := &model.Agent{
		ID:        req.AgentID,
		Name:      req.Name,
		ModelName: req.ModelName,
		Persona:   req.Persona,
	}
	if err := s.agentRepo.UpdateAgent(ctx, s.db, agent); err != nil {
		logger.ErrorWithTrace(ctx, "更新智能体配置失败", zap.Error(err))
		return err
	}
	logger.InfoWithTrace(ctx, "智能体配置更新成功", zap.Uint("id", agent.ID))
	return nil
}

func (s *AgentService) DeleteAgent(ctx context.Context, id uint, req *dto.DeleteAgentRequest) error {
	logger.InfoWithTrace(ctx, "删除智能体配置", zap.Uint("id", id), zap.Any("req", req))
	if err := s.agentRepo.DeleteAgent(ctx, s.db, req.AgentID); err != nil {
		logger.ErrorWithTrace(ctx, "删除智能体配置失败", zap.Error(err))
		return err
	}
	logger.InfoWithTrace(ctx, "智能体配置删除成功", zap.Uint("id", req.AgentID))
	return nil
}

func (s *AgentService) GetSessionMessages(ctx context.Context, userID uint, sessionIDStr string) ([]dto.Message, error) {
	logger.InfoWithTrace(ctx, "获取会话消息", zap.Uint("user_id", userID), zap.String("session_id", sessionIDStr))

	// 解析会话ID
	sessionID, err := strconv.ParseUint(sessionIDStr, 10, 32)
	if err != nil {
		logger.ErrorWithTrace(ctx, "会话ID解析失败", zap.Error(err))
		return nil, err
	}

	// 验证会话属于当前用户
	session, err := s.sessionRepo.GetSessionByID(ctx, uint(sessionID))
	if err != nil {
		logger.ErrorWithTrace(ctx, "获取会话失败", zap.Error(err))
		return nil, err
	}

	if session.UserID != userID {
		logger.ErrorWithTrace(ctx, "会话用户与会体配置不匹配")
		return nil, errors.New("会话用户与会体配置不匹配")
	}

	// 获取会话消息
	messages, err := s.messageRepo.FindMessageBySessionID(ctx, uint(sessionID))
	if err != nil {
		logger.ErrorWithTrace(ctx, "获取消息失败", zap.Error(err))
		return nil, err
	}

	// 转换为DTO
	messageDTOs := make([]dto.Message, 0, len(messages))
	for _, msg := range messages {
		messageDTOs = append(messageDTOs, dto.Message{
			SessionID: msg.SessionID,
			Role:      msg.Role,
			Content:   msg.Content,
			CreatedAt: msg.CreatedAt,
		})
	}

	return messageDTOs, nil
}
