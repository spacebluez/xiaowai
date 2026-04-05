package dto

import "xiaowai-backend/Internal/model"

type ChatAgentRequest struct {
	AgentID   uint   `json:"agent_id" binding:"required"`
	Input     string `json:"input" binding:"required"`
	SessionID uint   `json:"session_id,omitempty" binding:"required"`
}

type ChatAgentData struct {
	Output string `json:"output"`
}

type CreateAgentRequest struct {
	Name      string `json:"name" binding:"required"`
	ModelName string `json:"model_name" binding:"required"`
	Persona   string `json:"persona" binding:"required"`
}

type AgentListResponse struct {
	Agents *[]model.Agent `json:"agents,omitempty"`
}
