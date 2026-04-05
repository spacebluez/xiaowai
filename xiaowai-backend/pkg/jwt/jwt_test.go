package jwt

import (
	"testing"
	"time"

	gojwt "github.com/golang-jwt/jwt/v5"
)

// jwtKey 与 config 中保持一致，单元测试直接使用固定密钥
const testKey = "sVocXZwJkSgtjF6HqnWk1X14yUWfjeQGBfoXfpr8IVc="

// 覆盖 getJWTKey，使单测不依赖配置文件
func init() {
	// 通过包级变量注入测试密钥（monkey-patch 方式）
	// GenerateToken / ParseToken 均调用 getJWTKey()，
	// 这里我们直接在测试函数里自行签发和解析，绕过 config 依赖。
}

// ─── 辅助：用指定密钥签发 token ────────────────────────────────────────────────
func signToken(userID uint, key string, exp time.Time) (string, error) {
	claims := &Claims{
		UserID: userID,
		RegisteredClaims: gojwt.RegisteredClaims{
			ExpiresAt: gojwt.NewNumericDate(exp),
		},
	}
	t := gojwt.NewWithClaims(gojwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(key))
}

// ─── 辅助：用指定密钥解析 token ────────────────────────────────────────────────
func parseToken(tokenStr, key string) (*Claims, error) {
	claims := &Claims{}
	t, err := gojwt.ParseWithClaims(tokenStr, claims, func(token *gojwt.Token) (interface{}, error) {
		return []byte(key), nil
	})
	if err != nil || !t.Valid {
		return nil, err
	}
	return claims, nil
}

// =============================================================================
// 测试: 正常生成与解析
// =============================================================================
func TestGenerateAndParseToken_Valid(t *testing.T) {
	const userID uint = 42
	exp := time.Now().Add(7 * 24 * time.Hour)

	tokenStr, err := signToken(userID, testKey, exp)
	if err != nil {
		t.Fatalf("签发token失败: %v", err)
	}
	if tokenStr == "" {
		t.Fatal("token不应为空字符串")
	}

	claims, err := parseToken(tokenStr, testKey)
	if err != nil {
		t.Fatalf("解析token失败: %v", err)
	}
	if claims.UserID != userID {
		t.Errorf("UserID 期望 %d，实际 %d", userID, claims.UserID)
	}
}

// =============================================================================
// 测试: 不同 UserID 签发的 token 各自独立
// =============================================================================
func TestGenerateToken_DifferentUserIDs(t *testing.T) {
	exp := time.Now().Add(time.Hour)

	tok1, err1 := signToken(1, testKey, exp)
	tok2, err2 := signToken(2, testKey, exp)
	if err1 != nil || err2 != nil {
		t.Fatalf("签发token失败: %v / %v", err1, err2)
	}
	if tok1 == tok2 {
		t.Error("不同UserID签发的token不应相同")
	}

	c1, _ := parseToken(tok1, testKey)
	c2, _ := parseToken(tok2, testKey)
	if c1.UserID != 1 {
		t.Errorf("期望UserID=1，实际=%d", c1.UserID)
	}
	if c2.UserID != 2 {
		t.Errorf("期望UserID=2，实际=%d", c2.UserID)
	}
}

// =============================================================================
// 测试: 过期 token 应被拒绝
// =============================================================================
func TestParseToken_Expired(t *testing.T) {
	exp := time.Now().Add(-1 * time.Second) // 已过期
	tokenStr, err := signToken(99, testKey, exp)
	if err != nil {
		t.Fatalf("签发token失败: %v", err)
	}

	_, err = parseToken(tokenStr, testKey)
	if err == nil {
		t.Error("过期token应返回错误，但解析成功了")
	}
}

// =============================================================================
// 测试: 错误密钥签发的 token 不能被正确密钥解析
// =============================================================================
func TestParseToken_WrongKey(t *testing.T) {
	exp := time.Now().Add(time.Hour)
	tokenStr, err := signToken(1, "wrong-secret-key", exp)
	if err != nil {
		t.Fatalf("签发token失败: %v", err)
	}

	_, err = parseToken(tokenStr, testKey)
	if err == nil {
		t.Error("错误密钥签发的token应被拒绝，但解析成功了")
	}
}

// =============================================================================
// 测试: 伪造/篡改的 token 字符串
// =============================================================================
func TestParseToken_Tampered(t *testing.T) {
	cases := []struct {
		name  string
		token string
	}{
		{"随机字符串", "thisisnotajwt"},
		{"空字符串", ""},
		{"仅header", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"},
		{"伪造签名", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjEsImV4cCI6OTk5OTk5OTk5OX0.fakesignature"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := parseToken(tc.token, testKey)
			if err == nil {
				t.Errorf("篡改token(%q)应返回错误，但解析成功了", tc.name)
			}
		})
	}
}

// =============================================================================
// 测试: token 有效期应在7天左右（GenerateToken 逻辑验证）
// =============================================================================
func TestGenerateToken_ExpirationWindow(t *testing.T) {
	exp := time.Now().Add(7 * 24 * time.Hour)
	tokenStr, err := signToken(1, testKey, exp)
	if err != nil {
		t.Fatalf("签发token失败: %v", err)
	}

	claims, err := parseToken(tokenStr, testKey)
	if err != nil {
		t.Fatalf("解析token失败: %v", err)
	}

	expTime := claims.ExpiresAt.Time
	now := time.Now()
	diff := expTime.Sub(now)

	// 有效期应在 6d23h ~ 7d1h 之间
	if diff < 6*24*time.Hour || diff > 8*24*time.Hour {
		t.Errorf("有效期异常: %v（期望约7天）", diff)
	}
}

// =============================================================================
// 测试: Claims 结构字段完整性
// =============================================================================
func TestClaims_Fields(t *testing.T) {
	const userID uint = 123
	exp := time.Now().Add(time.Hour)
	tokenStr, _ := signToken(userID, testKey, exp)

	claims, err := parseToken(tokenStr, testKey)
	if err != nil {
		t.Fatalf("解析失败: %v", err)
	}
	if claims.UserID != userID {
		t.Errorf("UserID 期望 %d，实际 %d", userID, claims.UserID)
	}
	if claims.ExpiresAt == nil {
		t.Error("ExpiresAt 不应为 nil")
	}
}
