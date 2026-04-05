package main

import (
	"os"
	"path/filepath"
	"xiaowai-backend/Internal/store"
	"xiaowai-backend/config"
	"xiaowai-backend/pkg/email"
	"xiaowai-backend/pkg/llm/qianwen"
	"xiaowai-backend/pkg/logger"
	"xiaowai-backend/pkg/oss"
	"xiaowai-backend/pkg/redis"
	"xiaowai-backend/router"

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
	qianwen.Init()

	r := router.InitRouter()
	if err := r.Run(":8080"); err != nil {
		panic(err)
	}
}
