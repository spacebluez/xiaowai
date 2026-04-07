import { useState, useEffect } from 'react'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { agentApi, sessionApi } from '../api/api'
import '../App.css'

function ChatPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  
  const [agent, setAgent] = useState<any>(null)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (agentId) {
      initChat()
    }
  }, [agentId])

  const initChat = async () => {
    setIsLoading(true)
    try {
      // 创建会话
      const sessionResponse = await sessionApi.createSession({ agent_id: parseInt(agentId!) })
      setSessionId(sessionResponse.data.session.id)
      
      // 获取智能体信息
      const agentsResponse = await agentApi.getAgentList()
      const foundAgent = agentsResponse.data.agents.find((a: any) => a.ID === parseInt(agentId!))
      if (foundAgent) {
        setAgent(foundAgent)
      }
    } catch (error: any) {
      console.error('初始化聊天失败:', error)
      setMessage(`初始化聊天失败: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !agent || !sessionId) {
      return
    }

    const message = input.trim()
    setInput('')
    
    // 添加用户消息
    setMessages(prev => [...prev, { role: 'user', content: message }])
    setIsStreaming(true)
    setStreamingContent('')

    try {
      // 模拟流式输出
      const response = await agentApi.chatAgent({
        agent_id: agent.ID,
        session_id: sessionId,
        content: message,
        createdAt: new Date().toISOString()
      })

      // 模拟流式输出效果
      const content = response.data.content
      let currentContent = ''
      const words = content.split(' ')
      
      for (let i = 0; i < words.length; i++) {
        currentContent += words[i] + ' '
        setStreamingContent(currentContent)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // 添加智能体回复
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: content 
      }])
    } catch (error: any) {
      console.error('发送消息失败:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `发送失败: ${error.message}` 
      }])
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
    }
  }

  if (isLoading) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <div className="loading">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-page">
      {/* 头部 */}
      <div className="chat-header">
        <button 
          className="back-button" 
          onClick={() => navigate('/agents')}
        >
          <ArrowLeft size={20} />
        </button>
        <h1>与 {agent?.Name} 聊天</h1>
      </div>

      {/* 消息区域 */}
      <div className="chat-messages">
        {message && (
          <div className={`message ${message.includes('成功') ? 'success-message' : 'error-message'}`}>
            {message}
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {isStreaming && (
          <div className="chat-message assistant">
            <div className="message-content">
              {streamingContent}
              <span className="loading-indicator">
                <Loader2 size={16} className="loader" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 输入区域 - 固定在底部 */}
      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="输入消息..."
          disabled={isStreaming}
          className="chat-input"
        />
        <button
          className="btn btn-primary chat-send-button"
          onClick={handleSendMessage}
          disabled={isStreaming || !input.trim()}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}

export default ChatPage