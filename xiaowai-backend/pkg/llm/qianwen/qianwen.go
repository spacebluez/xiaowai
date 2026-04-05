package qianwen

import (
	"net/http"
	"sync"
	"time"
	"xiaowai-backend/config"
)

var once sync.Once
var qianWen *QianWenClient

type QianWenClient struct {
	apiKey     string
	baseURL    string
	model      string
	httpClient *http.Client
}

func NewClient(apiKey, baseurl, model string) *QianWenClient {
	return &QianWenClient{
		apiKey:  apiKey,
		baseURL: baseurl,
		model:   model,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func Init() {
	once.Do(func() {
		qianWen = NewClient(config.Get().LLM.QianWen.ApiKey, config.Get().LLM.QianWen.BaseUrl, config.Get().LLM.QianWen.Model)
	})
}

func GetClient() *QianWenClient {
	return qianWen
}
