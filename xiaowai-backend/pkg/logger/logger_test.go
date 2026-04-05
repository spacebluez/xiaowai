package logger

import (
	"testing"

	"go.uber.org/zap"
)

func TestLogger(t *testing.T) {
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
	err := &MockError{message: "mock error"}
	Error("Operation failed", zap.Error(err))

	// 注意：不要测试Fatal，因为它会导致程序退出
	t.Log("Logger test completed")
}

// MockError 用于测试的模拟错误类型
type MockError struct {
	message string
}

func (e *MockError) Error() string {
	return e.message
}
