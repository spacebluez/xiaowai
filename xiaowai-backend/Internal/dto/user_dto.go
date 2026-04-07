package dto

import (
	"time"
)

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Code     string `json:"code" binding:"required,len=6"`
	UserName string `json:"username" binding:"required,min=2,max=50"`
	PassWord string `json:"password" binding:"required,min=6"`
	Phone    string `json:"phone"`
}

type LoginRequest struct {
	UserName string `json:"username" binding:"required"`
	PassWord string `json:"password" binding:"required"`
}

type ProfileRequest struct {
	NickName  string `json:"nickname" binding:"required,min=2,max=20"`
	BirthDay  string `json:"birthday" binding:"omitempty,datetime=2006-01-02"`
	Gender    string `json:"gender" binding:"oneof=unknown male female other"`
	Hobbies   string `json:"hobbies" binding:"max=500"`
	Signature string `json:"signature" binding:"max=200"`
}

type LoginData struct {
	Token string `json:"token"`
}

type UserProfileData struct {
	ID         uint       `json:"id"`
	NickName   string     `json:"nickname"`
	BirthDay   *time.Time `json:"birthday,omitempty"`
	Avatar     string     `json:"avatar"`
	Gender     string     `json:"gender"`
	Hobbies    string     `json:"hobbies"`
	Signature  string     `json:"signature"`
	Experience uint32     `json:"experience"`
	UpdatedAt  time.Time  `json:"updatedat"`
}
