package model

import "time"

type Agent struct {
	ID        uint      `gorm:"column:id;primaryKey;autoIncrement;comment:自增ID"`
	UID       string    `gorm:"column:uid;uniqueIndex:uk_uid;type:varchar(64);not null;comment:UID"`
	UserID    uint      `gorm:"column:user_id;index:idx_user_id;not null;comment:用户ID"`
	Name      string    `gorm:"column:name;type:varchar(255);not null;comment:名称"`
	ModelName string    `gorm:"column:model_name;type:varchar(255);not null;comment:模型名称"`
	Gender    int       `gorm:"column:gender;type:int(11);not null;comment:性别"`
	Persona   string    `gorm:"column:persona;type:text;not null;comment:人物设定"`
	CreatedAt time.Time `gorm:"column:created_at;type:timestamp;default:current_timestamp;comment:创建时间"`
}
