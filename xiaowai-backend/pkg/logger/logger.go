package logger

import (
	"context"
	"os"
	"spaceblue/config"

	"github.com/google/uuid"
	"github.com/natefinch/lumberjack"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type TraceIDKey struct{}

var Log *zap.Logger

func InitLogger() {
	lumberjackLogger := &lumberjack.Logger{
		Filename:   config.Get().Log.Default.FileName,
		MaxSize:    config.Get().Log.Default.MaxSize,
		MaxBackups: config.Get().Log.Default.MaxBackups,
		MaxAge:     config.Get().Log.Default.MaxAge,
		Compress:   config.Get().Log.Default.ComPress,
	}

	encoderCofig := zap.NewProductionEncoderConfig()
	encoderCofig.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderCofig.EncodeLevel = zapcore.CapitalLevelEncoder

	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderCofig),
		zapcore.AddSync(lumberjackLogger),
		zapcore.InfoLevel,
	)

	consoleCore := zapcore.NewCore(
		zapcore.NewConsoleEncoder(encoderCofig),
		zapcore.AddSync(os.Stdout),
		zapcore.InfoLevel,
	)

	Log = zap.New(zapcore.NewTee(core, consoleCore), zap.AddCaller(), zap.AddCallerSkip(1))
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
