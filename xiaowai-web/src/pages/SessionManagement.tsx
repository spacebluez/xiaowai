import { useState, useEffect } from 'react'
import { ArrowLeft, MessageSquare, Clock, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { sessionApi } from '../api/api'
import { Session } from '../types'
import '../App.css'

function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    setIsLoading(true)
    try {
      const response = await sessionApi.getSessionList()
      setSessions(response.data.session_list)
    } catch (error: any) {
      console.error('获取会话列表失败:', error)
      setMessage(`获取会话列表失败: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm('确定要删除这个会话吗？')) {
      return
    }

    try {
      // 这里需要添加删除会话的API调用，目前后端接口中没有删除会话的接口
      // await sessionApi.deleteSession({ session_id: sessionId })
      setMessage('删除成功')
      // 重新获取会话列表
      fetchSessions()
    } catch (error: any) {
      console.error('删除会话失败:', error)
      setMessage(`删除失败: ${error.message}`)
    }
  }

  const handleSessionClick = (session: Session) => {
    // 这里可以跳转到聊天页面，或者在当前页面打开聊天窗口
    console.log('Session clicked:', session)
  }

  if (isLoading) {
    return (
      <div className="session-management-page">
        <div className="session-management-container">
          <div className="loading">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="session-management-page">
      <div className="session-management-container">
        <div className="session-management-header">
          <button 
            className="back-button" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={20} />
          </button>
          <h1>会话管理</h1>
        </div>

        {message && (
          <div className={`message ${message.includes('成功') ? 'success-message' : 'error-message'}`}>
            {message}
          </div>
        )}

        <div className="session-list">
          <h2>会话列表</h2>
          {sessions.length === 0 ? (
            <div className="empty-state">
              <p>还没有创建会话，与智能体聊天后会自动创建会话</p>
            </div>
          ) : (
            <div className="session-card-list">
              {sessions.map((session) => (
                <div key={session.id} className="session-card">
                  <div className="session-card-content" onClick={() => handleSessionClick(session)}>
                    <div className="session-card-icon">
                      <MessageSquare size={24} />
                    </div>
                    <div className="session-card-info">
                      <h3>{session.title || `会话 ${session.id}`}</h3>
                      <div className="session-card-meta">
                        <Clock size={14} />
                        <span>{new Date(session.updated_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="session-card-delete"
                    onClick={() => handleDeleteSession(session.id)}
                    title="删除会话"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SessionManagement
