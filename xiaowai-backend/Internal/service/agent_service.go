package service

import (
	"context"
	"spaceblue/pkg/llm/qianwen"
	"spaceblue/pkg/logger"

	"go.uber.org/zap"
)

type AgentService struct {
	agent *qianwen.QianWenClient
}

func NewAgentService(agent *qianwen.QianWenClient) *AgentService {
	return &AgentService{
		agent: agent,
	}
}

func (s *AgentService) ChatAgent(ctx context.Context, id uint, input string) (output string, err error) {
	logger.InfoWithTrace(ctx, "对话开始", zap.Uint("id", id))

	output, err = s.agent.ChatByWord(ctx, input)
	if err != nil {
		logger.ErrorWithTrace(ctx, "对话失败", zap.Error(err))
		return "", err
	}

	logger.InfoWithTrace(ctx, "对话结束", zap.String("output", output))
	return output, nil
}
