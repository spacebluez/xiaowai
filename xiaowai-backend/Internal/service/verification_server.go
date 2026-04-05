package service

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"spaceblue/pkg/email"
	"spaceblue/pkg/redis"
	"strconv"
	"time"
)

const (
	codeTTL        = 5 * time.Minute
	codeCooldown   = 60 * time.Second
	maxDailyCount  = 10
	maxIPPerMinute = 5
)

type VerificationService struct {
	redisClient *redis.Client
}

func NewVerificationService(redisClient *redis.Client) *VerificationService {
	return &VerificationService{redisClient: redisClient}
}

func (s *VerificationService) SendCode(ctx context.Context, emailAddr, clientIP string) error {
	ipLimitKey := fmt.Sprintf("verify:ip:%s", clientIP)
	ipCountStr, _ := s.redisClient.Get(ctx, ipLimitKey)
	ipCount, _ := strconv.Atoi(ipCountStr)
	if ipCount >= maxIPPerMinute {
		return errors.New("请求过于频繁，请稍后再试")
	}

	cooldownKey := fmt.Sprintf("verify:cooldown:%s", emailAddr)
	if _, err := s.redisClient.Get(ctx, cooldownKey); err == nil {
		return errors.New("验证码获取操作频繁，60s后再试")
	}

	dailyKey := fmt.Sprintf("verify:daily:%s:%s", emailAddr, time.Now().Format("2006-01-02"))
	countStr, err := s.redisClient.Get(ctx, dailyKey)
	if err == nil {
		if count, _ := strconv.Atoi(countStr); count >= maxDailyCount {
			return errors.New("今日验证码发送次数已达上限，请明天再试")
		}
	}
	n, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		return fmt.Errorf("生成验证码失败:%w", err)
	}
	code := fmt.Sprintf("%06d", n.Int64())

	codeKey := fmt.Sprintf("verify:code:%s", emailAddr)
	if err := s.redisClient.Set(ctx, codeKey, code, codeTTL); err != nil {
		return fmt.Errorf("存储验证码失败:%w", err)
	}
	_ = s.redisClient.Set(ctx, cooldownKey, "1", codeCooldown)
	_ = s.redisClient.Set(ctx, ipLimitKey, strconv.Itoa(ipCount+1), time.Minute)

	newCount := 1
	if countStr != "" {
		if c, e := strconv.Atoi(countStr); e == nil {
			newCount = c + 1
		}
	}
	now := time.Now()
	endOfDay := time.Date(now.Year(), now.Month(), now.Day(), 23, 59, 59, 0, now.Location())
	_ = s.redisClient.Set(ctx, dailyKey, strconv.Itoa(newCount), endOfDay.Sub(now)+time.Minute)

	if err := email.VerificationCodeEmail(emailAddr, code); err != nil {
		return errors.New("邮箱地址不可投递，请检查后重试")
	}

	return nil
}

func (s *VerificationService) VerifyCode(ctx context.Context, emailAddr, code string) error {
	codeKey := fmt.Sprintf("verify:code:%s", emailAddr)
	saved, err := s.redisClient.Get(ctx, codeKey)
	if err != nil {
		return errors.New("验证码不存在或已过期")
	}
	if saved != code {
		return errors.New("验证码错误")
	}
	_, _ = s.redisClient.Del(ctx, codeKey)
	return nil
}
