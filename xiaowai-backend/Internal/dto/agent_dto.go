package dto

type ChatAgentRequest struct {
	Input string `json:"input" binding:"required"`
}

type ChatAgentData struct {
	Output string `json:"output"`
}

type CreateAgentRequest struct {
	Name      string `json:"name" binding:"required"`
	ModelName string `json:"model_name" binding:"required"`
	Persona   string `json:"persona" binding:"required"`
}
