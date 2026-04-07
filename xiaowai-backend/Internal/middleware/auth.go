package middleware

import (
	"fmt"
	"xiaowai-backend/config"
	"xiaowai-backend/pkg/jwt"

	"github.com/gin-gonic/gin"
	jwtv5 "github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从cookie中获取token
		tokenStr, err := c.Cookie("token")

		// 如果cookie中没有token，从请求头中获取
		if err != nil {
			tokenStr = c.GetHeader("Authorization")
			// 移除Bearer前缀
			if len(tokenStr) > 7 && tokenStr[:7] == "Bearer " {
				tokenStr = tokenStr[7:]
			}
			// 如果请求头中也没有token，返回未授权
			if tokenStr == "" {
				c.JSON(401, gin.H{"msg": "请先登录"})
				c.Abort()
				return
			}
		}

		claims := &jwt.Claims{}
		token, err := jwtv5.ParseWithClaims(tokenStr, claims, func(token *jwtv5.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwtv5.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("非法签名算法: %v", token.Header["alg"])
			}
			return []byte(config.Get().JWT.Default.JWTKey), nil
		})

		if err != nil || !token.Valid {
			c.JSON(401, gin.H{"msg": "登录已失效，请重新登录"})
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Next()
	}
}
