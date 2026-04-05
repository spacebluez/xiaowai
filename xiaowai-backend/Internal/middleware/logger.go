package middleware

import (
	"spaceblue/pkg/logger"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

const (
	// TraceIDHeader 是 HTTP 头中 TraceID 的 key
	TraceIDHeader = "X-Trace-ID"
)

// Logger 日志中间件，统一记录所有请求的信息
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method
		clientIP := c.ClientIP()

		// 生成或获取 TraceID
		traceID := c.GetHeader(TraceIDHeader)
		if traceID == "" {
			traceID = logger.GenerateTraceID()
		}

		// 将 TraceID 存入 context
		ctx := logger.SetTraceID(c.Request.Context(), traceID)
		c.Request = c.Request.WithContext(ctx)

		// 将 TraceID 添加到响应头，方便客户端追踪
		c.Header(TraceIDHeader, traceID)

		// 记录请求开始
		logger.InfoWithTrace(ctx, "API 请求开始",
			zap.String("method", method),
			zap.String("path", path),
			zap.String("ip", clientIP),
			zap.String("user-agent", c.Request.UserAgent()),
		)

		c.Next() // 执行业务逻辑

		// 记录请求完成
		logger.InfoWithTrace(ctx, "API 请求完成",
			zap.String("method", method),
			zap.String("path", path),
			zap.String("ip", clientIP),
			zap.Int("status", c.Writer.Status()),
			zap.Duration("latency", time.Since(start)),
			zap.Int("response_size", c.Writer.Size()),
		)
	}
}

// Recovery 恢复中间件，捕获 panic 并记录错误
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				ctx := c.Request.Context()
				logger.ErrorWithTrace(ctx, "程序发生 panic",
					zap.String("method", c.Request.Method),
					zap.String("path", c.Request.URL.Path),
					zap.String("ip", c.ClientIP()),
					zap.Any("error", err),
				)
				c.AbortWithStatus(500)
			}
		}()
		c.Next()
	}
}
