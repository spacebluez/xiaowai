package dto

// APIResponse 统一接口响应结构
// code=0 表示成功，其余 code 通常对应 HTTP 状态码。
type APIResponse struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
	Data any    `json:"data"`
}
