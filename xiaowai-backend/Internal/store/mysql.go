package store

import (
	"fmt"
	"spaceblue/Internal/model"
	"spaceblue/config"
	"sync"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB
var once sync.Once

func Init() error {
	var initErr error
	once.Do(func() {
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			config.Get().DB.Spaceblue.UserName,
			config.Get().DB.Spaceblue.PassWord,
			config.Get().DB.Spaceblue.Host,
			config.Get().DB.Spaceblue.Port,
			config.Get().DB.Spaceblue.DBName,
		)
		DB, initErr = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if initErr != nil {
			return
		}
		initErr = DB.AutoMigrate(&model.User{}, &model.UserProfile{})
	})
	return initErr
}
