package qianwen

type ChatCompletionRequest struct {
	Model   string    `json:"model"`
	Message []Message `json:"messages"`
}

type ChatCompletionResponse struct {
	ID                string   `json:"id"`
	Model             string   `json:"model"`
	Object            string   `json:"object"`
	Created           int      `json:"created"`
	SystemFingerprint *string  `json:"system_fingerprint"`
	Usage             Usage    `json:"usage"`
	Choices           []Choice `json:"choices"`
}

type Message struct {
	Role    string `json:"role"`
	Content any    `json:"content"`
}

type ContentPart struct {
	Type     string    `json:"type"`
	Text     string    `json:"text,omitempty"`
	ImageURL *ImageURL `json:"image_url,omitempty"`
}

type ImageURL struct {
	URL string `json:"url"`
}

type Usage struct {
	PromptTokens        int                `json:"prompt_tokens"`
	CompletionTokens    int                `json:"completion_tokens"`
	TotalToken          int                `json:"total_tokens"`
	PromptTokensDetails PromptTokensDetail `json:"prompt_tokens_details"`
}

type PromptTokensDetail struct {
	CachedTokens int `json:"cached_tokens"`
}

type Choice struct {
	Message     Message `json:"message"`
	FinishReson string  `json:"finish_reason"`
	Index       int     `json:"index"`
	Logprobs    *any    `json:"loggrobs"`
}

type Messages struct {
	Messages []Message `json:"messages"`
}
