package dto

import "time"

type CreateSessionRequest struct {
	AgentID uint `json:"agent_id" binding:"required"`
}

type CreateSessionResponse struct {
	Session Session `json:"session"`
}

type GetSessionListRequest struct {
	UserID uint `json:"user_id" binding:"required"`
}

type GetSessionListResponse struct {
	SessionList []Session `json:"session_list"`
}

type Session struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	AgentID   uint      `json:"agent_id"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
