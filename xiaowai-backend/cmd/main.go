package main

import (
	"os"
	"path/filepath"
	"spaceblue/Internal/store"
	"spaceblue/config"
	"spaceblue/pkg/email"
	"spaceblue/pkg/logger"
	"spaceblue/pkg/oss"
	"spaceblue/pkg/redis"
	"spaceblue/router"

	"go.uber.org/zap"
)

func resolveConfigPath() string {
	if p := os.Getenv("SPACEBLUE_CONFIG"); p != "" {
		return p
	}
	return filepath.Join("config", "config.yaml")
}

func main() {
	configPath := resolveConfigPath()
	config.Init(configPath)

	logger.InitLogger()
	logger.Info("SpaceBlue 服务启动中...", zap.String("config", configPath))

	if err := store.Init(); err != nil {
		logger.Fatal("数据库初始化失败", zap.Error(err))
	}

	redis.Init()
	email.Init()
	oss.Init()

	r := router.InitRouter()
	if err := r.Run(":8080"); err != nil {
		panic(err)
	}
}
