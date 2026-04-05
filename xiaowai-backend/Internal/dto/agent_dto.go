package dto

type ChatAgentRequest struct {
	Input string `json:"input" binding:"required"`
}

type ChatAgentData struct {
	Output string `json:"output"`
}
