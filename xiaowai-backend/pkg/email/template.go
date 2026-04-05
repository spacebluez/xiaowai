package email

import "fmt"

func VerificationCodeEmail(touser, code string) error {
	subject := "【SPACEBLUE】身份验证"
	content := fmt.Sprintf(`
		<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
			<h2>验证码确认</h2>
			<p>您好，您的验证码为：</p>
			<p style="font-size: 32px; font-weight: bold; color: #409EFF; letter-spacing: 5px;">%s</p>
			<p>有效期为 5 分钟，请勿泄露给他人。</p>
		</div>
	`, code)
	return emailClient.SendHTML(touser, subject, content)
}
