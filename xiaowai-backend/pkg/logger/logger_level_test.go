package logger

import (
	"os"
	"path/filepath"
	"testing"
	"xiaowai-backend/config"

	"go.uber.org/zap"
)

func TestLoggerLevels(t *testing.T) {
	// 获取当前工作目录
	cwd, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get current working directory: %v", err)
	}

	// 从 pkg/logger 向上导航到项目根目录
	projectRoot := filepath.Dir(filepath.Dir(cwd))

	// 构建配置文件路径
	configPath := filepath.Join(projectRoot, "config", "config.yaml")
	config.Init(configPath)

	// 初始化日志
	InitLogger()

	// 测试各种日志级别
	Debug("Debug message")
	Info("Info message")
	Warn("Warn message")
	Error("Error message")

	// 测试带字段的日志
	Info("User login",
		zap.String("user", "test@example.com"),
		zap.Int("id", 123),
	)

	// 测试错误日志带错误信息
	err = &MockError{message: "mock error"}
	Error("Operation failed", zap.Error(err))

	t.Log("Logger levels test completed")
}
