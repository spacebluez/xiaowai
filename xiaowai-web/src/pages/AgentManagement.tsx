import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Edit3, Trash2, MessageSquare, X, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { agentApi, sessionApi } from '../api/api'
import { Agent, CreateAgentRequest, UpdateAgentRequest, DeleteAgentRequest, ChatAgentRequest } from '../types'
import '../App.css'

function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState<CreateAgentRequest>({
    name: '',
    model_name: '',
    persona: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({
    name: '',
    model_name: '',
    persona: ''
  })
  const [message, setMessage] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [chatAgent, setChatAgent] = useState<Agent | null>(null)
  const [chatSessionId, setChatSessionId] = useState<number | null>(null)
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatting, setIsChatting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    setIsLoading(true)
    try {
      const response = await agentApi.getAgentList()
      setAgents(response.data.agents)
    } catch (error: any) {
      console.error('获取智能体列表失败:', error)
      setMessage(`获取智能体列表失败: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }))
    setMessage('')
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {
      name: '',
      model_name: '',
      persona: ''
    }

    if (!formData.name.trim()) {
      newErrors.name = '请输入智能体名称'
    }

    if (!formData.model_name.trim()) {
      newErrors.model_name = '请输入模型名称'
    }

    if (!formData.persona.trim()) {
      newErrors.persona = '请输入智能体角色设定'
    }

    setErrors(newErrors)
    return Object.values(newErrors).every(error => error === '')
  }

  const handleCreate = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      console.log('Creating agent with data:', formData)
      const response = await agentApi.createAgent(formData)
      console.log('Create agent response:', response)
      setMessage('创建成功')
      setIsSaving(false)
      setIsCreating(false)
      setFormData({ name: '', model_name: '', persona: '' })
      fetchAgents()
    } catch (error: any) {
      console.error('创建智能体失败:', error)
      setMessage(`创建失败: ${error.message}`)
      setIsSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!validateForm() || !editingAgent) {
      return
    }

    setIsSaving(true)
    try {
      await agentApi.updateAgent({
        agent_id: editingAgent.ID,
        name: formData.name,
        model_name: formData.model_name,
        persona: formData.persona
      })
      setMessage('更新成功')
      setIsSaving(false)
      setIsEditing(false)
      setEditingAgent(null)
      setFormData({ name: '', model_name: '', persona: '' })
      fetchAgents()
    } catch (error: any) {
      console.error('更新智能体失败:', error)
      setMessage(`更新失败: ${error.message}`)
      setIsSaving(false)
    }
  }

  const handleDelete = (agentId: number) => {
    setAgentToDelete(agentId)
    setShowConfirm(true)
  }

  const confirmDelete = async () => {
    if (agentToDelete === null) {
      return
    }

    try {
      await agentApi.deleteAgent({ agent_id: agentToDelete })
      setMessage('删除成功')
      fetchAgents()
    } catch (error: any) {
      console.error('删除智能体失败:', error)
      setMessage(`删除失败: ${error.message}`)
    } finally {
      setShowConfirm(false)
      setAgentToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowConfirm(false)
    setAgentToDelete(null)
  }

  const handleStartChat = async (agent: any) => {
    setChatAgent(agent)
    setChatMessages([])
    setChatInput('')
    
    try {
      console.log('Creating session with agent:', agent)
      console.log('Sending data:', { agent_id: agent.ID })
      // 创建会话
      const response = await sessionApi.createSession({ agent_id: agent.ID })
      setChatSessionId(response.data.session.id)
      setShowChat(true)
    } catch (error: any) {
      console.error('创建会话失败:', error)
      setMessage(`创建会话失败: ${error.message}`)
    }
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatAgent || !chatSessionId) {
      return
    }

    const message = chatInput.trim()
    setChatInput('')
    
    // 添加用户消息
    setChatMessages(prev => [...prev, { role: 'user', content: message }])
    setIsChatting(true)

    try {
      const response = await agentApi.chatAgent({
        agent_id: chatAgent.ID,
        session_id: chatSessionId,
        content: message,
        createdAt: new Date().toISOString()
      })
      
      // 添加智能体回复
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.content 
      }])
    } catch (error: any) {
      console.error('发送消息失败:', error)
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `发送失败: ${error.message}` 
      }])
    } finally {
      setIsChatting(false)
    }
  }

  const handleEdit = (agent: any) => {
    setEditingAgent(agent)
    setFormData({
      name: agent.Name,
      model_name: agent.ModelName,
      persona: agent.Persona
    })
    setIsEditing(true)
    setMessage('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setIsCreating(false)
    setEditingAgent(null)
    setFormData({ name: '', model_name: '', persona: '' })
    setErrors({})
    setMessage('')
  }

  if (isLoading) {
    return (
      <div className="agent-management-page">
        <div className="agent-management-container">
          <div className="loading">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="agent-management-page">
      <div className="agent-management-container">
        <div className="agent-management-header">
          <button 
            className="back-button" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={20} />
          </button>
          <h1>智能体管理</h1>
          {!isEditing && !isCreating && (
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setIsCreating(true)
                setFormData({ name: '', model_name: '', persona: '' })
                setErrors({})
                setMessage('')
              }}
            >
              <Plus size={16} />
              创建智能体
            </button>
          )}
        </div>

        {message && (
          <div className={`message ${message.includes('成功') ? 'success-message' : 'error-message'}`}>
            {message}
          </div>
        )}

        {isEditing || isCreating ? (
          <div className="agent-form">
            <h2>{isEditing ? '编辑智能体' : '创建智能体'}</h2>
            <form className="form">
              <div className="form-group">
                <label htmlFor="name">智能体名称</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="请输入智能体名称"
                  className={errors.name ? 'input-error' : ''}
                  disabled={isSaving}
                />
                {errors.name && (
                  <div className="input-error-message">
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="model_name">模型名称</label>
                <input
                  type="text"
                  id="model_name"
                  name="model_name"
                  value={formData.model_name}
                  onChange={handleInputChange}
                  placeholder="请输入模型名称"
                  className={errors.model_name ? 'input-error' : ''}
                  disabled={isSaving}
                />
                {errors.model_name && (
                  <div className="input-error-message">
                    {errors.model_name}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="persona">角色设定</label>
                <textarea
                  id="persona"
                  name="persona"
                  value={formData.persona}
                  onChange={handleInputChange}
                  placeholder="请输入智能体的角色设定"
                  rows={4}
                  className={`form-textarea ${errors.persona ? 'input-error' : ''}`}
                  disabled={isSaving}
                />
                {errors.persona && (
                  <div className="input-error-message">
                    {errors.persona}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X size={16} />
                  取消
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={isEditing ? handleUpdate : handleCreate}
                  disabled={isSaving}
                >
                  {isSaving ? '保存中...' : (
                    <>
                      <Save size={16} />
                      保存
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="agent-list">
            <h2>智能体列表</h2>
            {agents.length === 0 ? (
              <div className="empty-state">
                <p>还没有创建智能体，点击上方按钮创建第一个智能体</p>
              </div>
            ) : (
              <div className="agent-card-grid">
                {agents.map((agent) => (
                  <div key={agent.ID} className="agent-card">
                    <div className="agent-card-header">
                      <h3>{agent.Name}</h3>
                      <div className="agent-card-actions">
                        <button
                          className="action-button chat-button"
                          onClick={() => handleStartChat(agent)}
                          title="聊天"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button
                          className="action-button edit-button"
                          onClick={() => handleEdit(agent)}
                          title="编辑"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="action-button delete-button"
                          onClick={() => handleDelete(agent.ID)}
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="agent-card-body">
                      <div className="agent-model">模型: {agent.ModelName}</div>
                      <div className="agent-persona">{agent.Persona}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 聊天窗口 */}
        {showChat && chatAgent && (
          <div className="chat-modal">
            <div className="chat-modal-content">
              <div className="chat-modal-header">
                <h3>与 {chatAgent.Name} 聊天</h3>
                <button
                  className="close-button"
                  onClick={() => setShowChat(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.role}`}>
                    <div className="message-content">{msg.content}</div>
                  </div>
                ))}
                {isChatting && (
                  <div className="chat-message assistant">
                    <div className="message-content">正在思考...</div>
                  </div>
                )}
              </div>
              <div className="chat-input-container">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="输入消息..."
                  disabled={isChatting}
                  className="chat-input"
                />
                <button
                  className="btn btn-primary chat-send-button"
                  onClick={handleSendMessage}
                  disabled={isChatting || !chatInput.trim()}
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 自定义删除确认提示框 */}
        {showConfirm && (
          <div className="confirm-modal">
            <div className="confirm-modal-content">
              <div className="confirm-modal-header">
                <h3>确认删除</h3>
              </div>
              <div className="confirm-modal-body">
                <p>确定要删除这个智能体吗？</p>
              </div>
              <div className="confirm-modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={cancelDelete}
                >
                  取消
                </button>
                <button
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  确定删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentManagement
