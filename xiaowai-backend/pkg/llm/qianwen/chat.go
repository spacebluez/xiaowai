package qianwen

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func (c *QianWenClient) createChatCompletion(ctx context.Context, req ChatCompletionRequest) (*ChatCompletionResponse, error) {
	if req.Model == "" {
		req.Model = c.model
	}
	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("qianwen marshal error:%w", err)
	}
	httpReq, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("qianwen create request error:%w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)
	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("qianwen post error:%w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("qwen api error: status=%d, body=%s", resp.StatusCode, string(body))
	}
	var completionResp ChatCompletionResponse
	if err := json.NewDecoder(resp.Body).Decode(&completionResp); err != nil {
		return nil, fmt.Errorf("qwen decode error: %w", err)
	}

	return &completionResp, nil
}

func (c *QianWenClient) ChatByWord(ctx context.Context, input string) (output string, err error) {
	req := &ChatCompletionRequest{
		Model: "",
		Message: []Message{
			{
				Role:    "system",
				Content: "You are a helpful assistant",
			},
			{
				Role:    "user",
				Content: input,
			},
		},
	}
	rsp, err := c.createChatCompletion(ctx, *req)
	if err != nil {
		return "", err
	}
	if len(rsp.Choices) > 0 {
		output, ok := rsp.Choices[0].Message.Content.(string)
		if !ok {
			return "", fmt.Errorf("api 返回的类型不是string,实际类型是：%T", rsp.Choices[0].Message.Content)
		}
		return output, nil
	}
	return "", fmt.Errorf("qianwen returned empty choices")
}

func (c *QianWenClient) TagImageByUrl(ctx context.Context, imagURL, input string) (string, error) {
	content := []ContentPart{
		{
			Type: "image_url",
			ImageURL: &ImageURL{
				URL: imagURL,
			},
		},
		{
			Type: "text",
			Text: input,
		},
	}
	req := ChatCompletionRequest{
		Model: "qwen-vl-plus",
		Message: []Message{
			{
				Role:    "user",
				Content: content,
			},
		},
	}
	rsp, err := c.createChatCompletion(ctx, req)
	if err != nil {
		return "", err
	}
	if len(rsp.Choices) > 0 {
		output, ok := rsp.Choices[0].Message.Content.(string)
		if !ok {
			return "", fmt.Errorf("api 返回的类型不是string,实际类型是：%T", rsp.Choices[0].Message.Content)
		}
		return output, nil
	}
	return "", fmt.Errorf("qianwen returned empty choices")
}

func (c *QianWenClient) ChatV2(ctx context.Context, input string, messages Messages) (output string, err error) {
	messages.Messages = append(messages.Messages, Message{
		Role:    "user",
		Content: input,
	})
	req := &ChatCompletionRequest{
		Model:   "",
		Message: messages.Messages,
	}
	rsp, err := c.createChatCompletion(ctx, *req)
	if err != nil {
		return "", err
	}
	if len(rsp.Choices) > 0 {
		output, ok := rsp.Choices[0].Message.Content.(string)
		if !ok {
			return "", fmt.Errorf("api 返回的类型不是string,实际类型是：%T", rsp.Choices[0].Message.Content)
		}
		return output, nil
	}
	return "", fmt.Errorf("qianwen returned empty choices")
}
