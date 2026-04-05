package dto

type SendCodeRequest struct {
	Email string `json:"email" binding:"required,email"`
}
