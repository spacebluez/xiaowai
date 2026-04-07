import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, Plus, Trash2, MessageSquare, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { agentApi, sessionApi } from '../api/api'
import '../App.css'

function ChatPage() {
  // 状态管理
  const [sessions, setSessions] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // 初始化数据
  useEffect(() => {
    loadInitialData()
  }, [])

  // 加载初始数据
  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      // 获取智能体列表
      const agentsResponse = await agentApi.getAgentList()
      const agentsList = agentsResponse.data.agents
      setAgents(agentsList)
      
      // 获取会话列表
      await loadSessions(agentsList)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 加载会话列表
  const loadSessions = async (agentsList: any[]) => {
    try {
      const sessionsResponse = await sessionApi.getSessionList()
      setSessions(sessionsResponse.data.session_list)
      
      // 如果有会话，默认选择第一个
      if (sessionsResponse.data.session_list.length > 0) {
        selectSession(sessionsResponse.data.session_list[0], agentsList)
      }
    } catch (error) {
      console.error('加载会话列表失败:', error)
    }
  }

  // 选择会话
  const selectSession = async (session: any, agentsList?: any[]) => {
    setSelectedSession(session)
    
    // 查找对应的智能体
    const agent = (agentsList || agents).find(a => a.ID === session.agent_id)
    setSelectedAgent(agent)
    
    // 加载历史消息
    try {
      const messagesResponse = await sessionApi.getSessionMessages(session.id)
      // 转换消息格式，确保 role 字段正确
      const formattedMessages = messagesResponse.data.messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
      setMessages(formattedMessages)
    } catch (error) {
      console.error('加载历史消息失败:', error)
      setMessages([])
    }
  }

  // 创建新会话
  const createNewSession = async (agentId: number) => {
    setIsCreatingSession(true)
    try {
      const sessionResponse = await sessionApi.createSession({ agent_id: agentId })
      const newSession = sessionResponse.data.session
      
      // 更新会话列表
      setSessions(prev => [newSession, ...prev])
      
      // 选择新会话
      selectSession(newSession)
    } catch (error) {
      console.error('创建会话失败:', error)
    } finally {
      setIsCreatingSession(false)
    }
  }

  // 发送消息
  const handleSendMessage = async () => {
    if (!input.trim() || !selectedAgent || !selectedSession) {
      return
    }

    const message = input.trim()
    setInput('')
    
    // 添加用户消息
    setMessages(prev => [...prev, { role: 'user', content: message }])
    setIsStreaming(true)
    setStreamingContent('')

    try {
      // 发送消息到后端
      const response = await agentApi.chatAgent({
        agent_id: selectedAgent.ID,
        session_id: selectedSession.id,
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

  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

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
    <div className="chat-page gemini-layout">
      {/* 左侧会话列表 */}
      <div className="chat-sidebar">
        {/* 侧边栏头部 */}
        <div className="sidebar-header">
          <h2>对话</h2>
          <button 
            className="new-chat-button"
            onClick={() => {
              // 显示智能体选择菜单
              const agentId = agents.length > 0 ? agents[0].ID : null
              if (agentId) {
                createNewSession(agentId)
              }
            }}
          >
            <Plus size={16} />
            新建对话
          </button>
        </div>
        
        {/* 会话列表 */}
        <div className="sessions-list">
          {sessions.map((session) => {
            const agent = agents.find(a => a.ID === session.agent_id)
            return (
              <div 
                key={session.id} 
                className={`session-item ${selectedSession?.id === session.id ? 'selected' : ''}`}
                onClick={() => selectSession(session, agents)}
              >
                <div className="session-avatar">
                  <MessageSquare size={16} />
                </div>
                <div className="session-info">
                  <div className="session-agent-name">{agent?.Name || '未知智能体'}</div>
                  <div className="session-time">{new Date(session.created_at).toLocaleString()}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 右侧聊天区域 */}
      <div className="chat-main">
        {/* 聊天头部 */}
        <div className="chat-header">
          <button 
            className="home-button"
            onClick={() => navigate('/')}
          >
            <Home size={20} />
          </button>
          <div className="agent-selector">
            <select 
              value={selectedAgent?.ID || ''}
              onChange={(e) => {
                const agentId = parseInt(e.target.value)
                createNewSession(agentId)
              }}
              disabled={isCreatingSession}
            >
              {agents.map(agent => (
                <option key={agent.ID} value={agent.ID}>
                  {agent.Name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 消息区域 */}
        <div className="chat-messages">
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
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="chat-input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="输入消息..."
            disabled={isStreaming || !selectedSession}
            className="chat-input"
          />
          <button
            className="btn btn-primary chat-send-button"
            onClick={handleSendMessage}
            disabled={isStreaming || !input.trim() || !selectedSession}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPage