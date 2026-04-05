package model

import (
	"time"
)

type User struct {
	ID        uint      `gorm:"column:id;primaryKey;autoIncrement;comment:自增ID"`
	UserName  string    `gorm:"column:username;type:varchar(50);not null;uniqueIndex:uk_username;comment:用户名"`
	Email     string    `gorm:"column:email;type:varchar(200);not null;uniqueIndex:uk_email;comment:邮箱"`
	Phone     string    `gorm:"column:phone;type:varchar(11);default:null;comment:手机号"`
	Password  string    `gorm:"column:password;type:varchar(255);not null;comment:密码(bcrypt哈希)"`
	CreatedAt time.Time `gorm:"column:created_at;type:timestamp;default:current_timestamp;comment:注册时间"`
}

func (u *User) TableName() string {
	return "users"
}

type UserProfile struct {
	ID         uint       `gorm:"column:id;primaryKey;not null;comment:对应用户表id"`
	NickName   string     `gorm:"column:nickname;varchar(20);comment:用户昵称"`
	BirthDay   *time.Time `gorm:"column:birthday;type:date;comment:出生日期"`
	Avatar     string     `gorm:"column:avatar;type:varchar(255);comment:头像链接"`
	Gender     string     `gorm:"column:gender;type:enum('unknown','male','female','other');comment:性别"`
	Hobbies    string     `gorm:"column:hobbies;type:text;comment:兴趣爱好"`
	Signature  string     `gorm:"column:signature;size:200;comment:个性签名"`
	Experience uint32     `gorm:"column:experience;not null;default 0;comment:经验"`
	UpdatedAt  time.Time  `gorm:"column:updatedat;autoUpdateTime;comment:资料最后修改时间"`
}

func (up *UserProfile) TableName() string {
	return "user_profiles"
}
