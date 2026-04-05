package router

import (
	"spaceblue/Internal/controller"
	"spaceblue/Internal/middleware"
	"spaceblue/Internal/repository"
	"spaceblue/Internal/service"
	"spaceblue/Internal/store"
	"spaceblue/pkg/llm/qianwen"
	"spaceblue/pkg/redis"

	"github.com/gin-gonic/gin"
)

func InitRouter() *gin.Engine {
	r := gin.New()

	r.Use(middleware.Logger())
	r.Use(middleware.Recovery())
	r.Use(middleware.CORS())

	userRepo := repository.NewUserRepository(store.DB)
	verificationService := service.NewVerificationService(redis.GetClient())
	userService := service.NewUserService(userRepo, verificationService, redis.GetClient(), store.DB)

	userCtrl := controller.NewUserController(userService)
	verifyCtrl := controller.NewVerificationController(verificationService)

	agentService := service.NewAgentService(qianwen.GetClient())
	agentCtrl := controller.NewAgentController(agentService)

	v1 := r.Group("/api/v1")
	{
		v1.POST("/user/register", userCtrl.Register)
		v1.POST("/user/login", userCtrl.Login)
		v1.POST("/user/logout", userCtrl.Logout)
		v1.POST("/verification/send-code", verifyCtrl.SendCode)
		v1.GET("/user/:id/avatar", userCtrl.PreviewAvatar)

		auth := v1.Group("/user")
		auth.Use(middleware.AuthMiddleware())
		{
			auth.GET("/profile", userCtrl.GetProfile)
			auth.PUT("/profile", userCtrl.UpdateProfile)
			auth.PUT("/avatar", userCtrl.UpdateAvatar)
			auth.POST("/agent/chat", agentCtrl.ChatAgent)
		}
	}

	return r

}
