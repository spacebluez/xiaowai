package store

import (
	"fmt"
	"sync"
	"xiaowai-backend/Internal/model"
	"xiaowai-backend/config"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB
var once sync.Once

func Init() error {
	var initErr error
	once.Do(func() {
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			config.Get().DB.Xiaowai.UserName,
			config.Get().DB.Xiaowai.PassWord,
			config.Get().DB.Xiaowai.Host,
			config.Get().DB.Xiaowai.Port,
			config.Get().DB.Xiaowai.DBName,
		)
		DB, initErr = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if initErr != nil {
			return
		}
		initErr = DB.AutoMigrate(&model.User{}, &model.UserProfile{})
	})
	return initErr
}
