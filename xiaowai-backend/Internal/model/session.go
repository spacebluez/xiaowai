package model

import "time"

type Session struct {
	ID        uint      `gorm:"column:id;primaryKey;autoIncrement;comment:自增ID"`
	UserID    uint      `gorm:"column:user_id;index:idx_user_id;not null;comment:用户ID"`
	AgentID   uint      `gorm:"column:agent_id;index:idx_agent_id;not null;comment:智能体ID"`
	Title     string    `gorm:"column:title;type:varchar(255);default:'未定义';comment:会话标题"`
	CreatedAt time.Time `gorm:"column:created_at;type:timestamp;default:current_timestamp;comment:创建时间"`
	UpdatedAt time.Time `gorm:"column:updated_at;type:timestamp;default:current_timestamp;comment:更新时间"`
}

func (Session) TableName() string {
	return "sessions"
}
