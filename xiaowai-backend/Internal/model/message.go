package model

import (
	"time"
	"xiaowai-backend/pkg/llm/qianwen"
)

type Message struct {
	ID        uint      `gorm:"column:id;primaryKey;autoIncrement;comment:自增ID"`
	SessionID uint      `gorm:"column:session_id;index:idx_session_id;not null;comment:会话ID"`
	Role      string    `gorm:"column:role;type:varchar(20);not null;comment:角色(user/assistant)"`
	Content   string    `gorm:"column:content;type:text;not null;comment:对话内容"`
	CreatedAt time.Time `gorm:"column:created_at;type:timestamp;default:current_timestamp;comment:创建时间"`
}

func (Message) TableName() string {
	return "messages"
}

func (m *Message) ToQianWenMessage() qianwen.Message {
	return qianwen.Message{
		Role:    m.Role,
		Content: m.Content,
	}
}

