package email

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"spaceblue/config"
	"sync"

	"github.com/jordan-wright/email"
)

var (
	emailClient *Client
	once        sync.Once
)

type SMTPConfig struct {
	Host     string
	Port     int
	UserName string
	PassWord string
	NickName string
}

type Client struct {
	smtpConfig SMTPConfig
	pool       chan *email.Email
}

func NewClient(host, username, password, nickname string, port int) *Client {
	return &Client{
		smtpConfig: SMTPConfig{
			Host:     host,
			Port:     port,
			UserName: username,
			PassWord: password,
			NickName: nickname,
		},
	}
}

func Init() {
	once.Do(func() {
		emailClient = NewClient(config.Get().SMTP.QQ.Host, config.Get().SMTP.QQ.UserName,
			config.Get().SMTP.QQ.PassWord, config.Get().SMTP.QQ.NickName, config.Get().SMTP.QQ.Port)
	})
}

func (c *Client) SendHTML(touser, subject, body string) error {
	e := email.NewEmail()
	e.From = fmt.Sprintf("%s <%s>", c.smtpConfig.NickName, c.smtpConfig.UserName)
	e.To = []string{touser}
	e.Subject = subject
	e.HTML = []byte(body)

	addr := fmt.Sprintf("%s:%d", c.smtpConfig.Host, c.smtpConfig.Port)
	auth := smtp.PlainAuth("", c.smtpConfig.UserName, c.smtpConfig.PassWord, c.smtpConfig.Host)

	return e.SendWithTLS(addr, auth, &tls.Config{ServerName: c.smtpConfig.Host})
}
