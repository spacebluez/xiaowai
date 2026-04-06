package dto

import (
	"time"
	"xiaowai-backend/Internal/model"
)

type ChatAgentRequest struct {
	AgentID   uint      `json:"agent_id" binding:"required"`
	SessionID uint      `json:"session_id" binding:"required"`
	Content   string    `json:"content" binding:"required"`
	CreatedAt time.Time `json:"createdAt"`
}

type ChatAgentResponse struct {
	SessionID uint      `json:"session_id"`
	Role      string    `json:"role"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

type CreateAgentRequest struct {
	Name      string `json:"name" binding:"required"`
	ModelName string `json:"model_name" binding:"required"`
	Persona   string `json:"persona" binding:"required"`
}

type AgentListResponse struct {
	Agents *[]model.Agent `json:"agents,omitempty"`
}

type UpdateAgentRequest struct {
	AgentID   uint   `json:"agent_id" binding:"required"`
	Name      string `json:"name" binding:"required"`
	ModelName string `json:"model_name" binding:"required"`
	Persona   string `json:"persona" binding:"required"`
}
