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
		tokenStr, err := c.Cookie("token")
		if err != nil {
			c.JSON(401, gin.H{"msg": "请先登录"})
			c.Abort()
			return
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
