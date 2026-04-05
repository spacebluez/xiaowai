package logger

import (
	"context"
	"os"
	"xiaowai-backend/config"

	"github.com/google/uuid"
	"github.com/natefinch/lumberjack"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// levelEnabler 是一个自定义的 LevelEnabler，只允许特定级别的日志通过
type levelEnabler struct {
	level zapcore.Level
}

// Enabled 实现 zapcore.LevelEnabler 接口
func (l levelEnabler) Enabled(level zapcore.Level) bool {
	return level == l.level
}

type TraceIDKey struct{}

var Log *zap.Logger

func InitLogger() {
	encoderCofig := zap.NewProductionEncoderConfig()
	encoderCofig.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderCofig.EncodeLevel = zapcore.CapitalLevelEncoder

	// 配置不同级别的日志文件
	infoLogger := &lumberjack.Logger{
		Filename:   config.Get().Log.Info.FileName,
		MaxSize:    config.Get().Log.Info.MaxSize,
		MaxBackups: config.Get().Log.Info.MaxBackups,
		MaxAge:     config.Get().Log.Info.MaxAge,
		Compress:   config.Get().Log.Info.ComPress,
	}

	errorLogger := &lumberjack.Logger{
		Filename:   config.Get().Log.Error.FileName,
		MaxSize:    config.Get().Log.Error.MaxSize,
		MaxBackups: config.Get().Log.Error.MaxBackups,
		MaxAge:     config.Get().Log.Error.MaxAge,
		Compress:   config.Get().Log.Error.ComPress,
	}

	debugLogger := &lumberjack.Logger{
		Filename:   config.Get().Log.Debug.FileName,
		MaxSize:    config.Get().Log.Debug.MaxSize,
		MaxBackups: config.Get().Log.Debug.MaxBackups,
		MaxAge:     config.Get().Log.Debug.MaxAge,
		Compress:   config.Get().Log.Debug.ComPress,
	}

	warnLogger := &lumberjack.Logger{
		Filename:   config.Get().Log.Warn.FileName,
		MaxSize:    config.Get().Log.Warn.MaxSize,
		MaxBackups: config.Get().Log.Warn.MaxBackups,
		MaxAge:     config.Get().Log.Warn.MaxAge,
		Compress:   config.Get().Log.Warn.ComPress,
	}

	// 创建不同级别的日志核心，使用自定义的 levelEnabler 确保每个文件只包含指定级别的日志
	infoCore := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderCofig),
		zapcore.AddSync(infoLogger),
		levelEnabler{level: zapcore.InfoLevel},
	)

	errorCore := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderCofig),
		zapcore.AddSync(errorLogger),
		levelEnabler{level: zapcore.ErrorLevel},
	)

	debugCore := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderCofig),
		zapcore.AddSync(debugLogger),
		levelEnabler{level: zapcore.DebugLevel},
	)

	warnCore := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderCofig),
		zapcore.AddSync(warnLogger),
		levelEnabler{level: zapcore.WarnLevel},
	)

	consoleCore := zapcore.NewCore(
		zapcore.NewConsoleEncoder(encoderCofig),
		zapcore.AddSync(os.Stdout),
		zapcore.InfoLevel,
	)

	// 合并所有核心
	Log = zap.New(zapcore.NewTee(infoCore, errorCore, debugCore, warnCore, consoleCore), zap.AddCaller(), zap.AddCallerSkip(1))
	Log.Info("Logger initialized")
}

func Debug(msg string, fields ...zap.Field) {
	Log.Debug(msg, fields...)
}

func Info(msg string, fileds ...zap.Field) {
	Log.Info(msg, fileds...)
}

func Warn(msg string, fields ...zap.Field) {
	Log.Warn(msg, fields...)
}

func Error(msg string, fields ...zap.Field) {
	Log.Error(msg, fields...)
}

func Fatal(msg string, fields ...zap.Field) {
	Log.Fatal(msg, fields...)
}

// GenerateTraceID 生成新的 TraceID
func GenerateTraceID() string {
	return uuid.New().String()
}

// GetTraceID 从 context 中获取 TraceID
func GetTraceID(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	if traceID, ok := ctx.Value(TraceIDKey{}).(string); ok {
		return traceID
	}
	return ""
}

// SetTraceID 将 TraceID 存入 context
func SetTraceID(ctx context.Context, traceID string) context.Context {
	return context.WithValue(ctx, TraceIDKey{}, traceID)
}

// WithTraceID 返回带 TraceID 的日志字段
func WithTraceID(ctx context.Context) zap.Field {
	return zap.String("trace_id", GetTraceID(ctx))
}

// DebugWithTrace 带 TraceID 的 Debug 日志
func DebugWithTrace(ctx context.Context, msg string, fields ...zap.Field) {
	fields = append(fields, WithTraceID(ctx))
	Log.Debug(msg, fields...)
}

// InfoWithTrace 带 TraceID 的 Info 日志
func InfoWithTrace(ctx context.Context, msg string, fields ...zap.Field) {
	fields = append(fields, WithTraceID(ctx))
	Log.Info(msg, fields...)
}

// WarnWithTrace 带 TraceID 的 Warn 日志
func WarnWithTrace(ctx context.Context, msg string, fields ...zap.Field) {
	fields = append(fields, WithTraceID(ctx))
	Log.Warn(msg, fields...)
}

// ErrorWithTrace 带 TraceID 的 Error 日志
func ErrorWithTrace(ctx context.Context, msg string, fields ...zap.Field) {
	fields = append(fields, WithTraceID(ctx))
	Log.Error(msg, fields...)
}

// FatalWithTrace 带 TraceID 的 Fatal 日志
func FatalWithTrace(ctx context.Context, msg string, fields ...zap.Field) {
	fields = append(fields, WithTraceID(ctx))
	Log.Fatal(msg, fields...)
}
