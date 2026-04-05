package middleware

import "github.com/gin-gonic/gin"

func CORS() gin.HandlerFunc {
	allowed := map[string]bool{
		"http://localhost:5173":       true,
		"http://47.111.12.222:5173": true,
	}

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if allowed[origin] {
			c.Header("Access-Control-Allow-Origin", origin)
		}
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, X-Trace-ID")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
