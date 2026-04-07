import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Brain, Users, MessageSquare, Settings, LogIn, LogOut, ChevronRight, Menu, X, Sun, Moon, User, List } from 'lucide-react'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import AgentManagement from './pages/AgentManagement'
import SessionManagement from './pages/SessionManagement'
import './App.css'

function Main() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userInfo, setUserInfo] = useState({
    id: 0,
    nickname: '',
    avatar: ''
  })
  const navigate = useNavigate()

  // 模拟加载状态
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // 检查登录状态并获取用户信息
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        setIsLoggedIn(true)
        // 获取用户信息
        try {
          const response = await fetch('http://localhost:8080/api/v1/user/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            if (data.code === 0) {
              setUserInfo({
                id: data.data.id,
                nickname: data.data.nickname,
                avatar: data.data.avatar
              })
            }
          }
        } catch (error) {
          console.error('获取用户信息失败:', error)
        }
      }
    }
    checkLoginStatus()
  }, [])

  // 切换深色模式
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  // 登出功能
  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await fetch('http://localhost:8080/api/v1/user/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      } catch (error) {
        console.error('登出失败:', error)
      } finally {
        localStorage.removeItem('token')
        setIsLoggedIn(false)
        setUserInfo({
          id: 0,
          nickname: '',
          avatar: ''
        })
      }
    }
  }

  // 模拟登录
  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  // 加载状态骨架屏
  if (isLoading) {
    return (
      <div className="app dark:bg-gray-900">
        <div className="skeleton-navbar"></div>
        <div className="skeleton-hero"></div>
        <div className="skeleton-features"></div>
        <div className="skeleton-how-to"></div>
        <div className="skeleton-footer"></div>
      </div>
    )
  }

  return (
    <div className={`app ${isDarkMode ? 'dark' : ''}`}>
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <div className="logo">
              <Brain className="logo-icon" />
              <span>小歪</span>
            </div>
            
            {/* 桌面导航 */}
            <div className="nav-links">
              {isLoggedIn ? (
                <>
                  <Link to="/agents" className="nav-link">智能体管理</Link>
                  <Link to="/sessions" className="nav-link">会话管理</Link>
                  <Link to="/profile" className="nav-link">个人中心</Link>
                  <div className="user-avatar">
                    {userInfo.avatar ? (
                      <img src={userInfo.avatar} alt={userInfo.nickname} className="avatar-image" />
                    ) : (
                      <div className="avatar-placeholder">
                        {userInfo.nickname ? userInfo.nickname.charAt(0) : 'U'}
                      </div>
                    )}
                  </div>
                  <button className="btn btn-outline" onClick={handleLogout}>
                    <LogOut className="btn-icon" />
                    登出
                  </button>
                </>
              ) : (
                <>
                  <a href="#" className="nav-link">功能</a>
                  <a href="#" className="nav-link">文档</a>
                  <a href="#" className="nav-link">价格</a>
                  <button className="btn btn-outline" onClick={() => navigate('/login')}>
                    <LogIn className="btn-icon" />
                    登录
                  </button>
                  <button className="btn btn-primary" onClick={() => navigate('/register')}>
                    注册
                  </button>
                </>
              )}
              <button className="btn dark-mode-btn" onClick={toggleDarkMode}>
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            {/* 移动端菜单按钮 */}
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* 移动端导航菜单 */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              {isLoggedIn ? (
                <>
                  <Link to="/agents" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>智能体管理</Link>
                  <Link to="/sessions" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>会话管理</Link>
                  <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>个人中心</Link>
                  <div className="mobile-user-avatar">
                    {userInfo.avatar ? (
                      <img src={userInfo.avatar} alt={userInfo.nickname} className="avatar-image" />
                    ) : (
                      <div className="avatar-placeholder">
                        {userInfo.nickname ? userInfo.nickname.charAt(0) : 'U'}
                      </div>
                    )}
                    <span className="user-nickname">{userInfo.nickname || '用户'}</span>
                  </div>
                  <button className="btn btn-outline w-full" onClick={handleLogout}>
                    <LogOut className="btn-icon" />
                    登出
                  </button>
                </>
              ) : (
                <>
                  <a href="#" className="mobile-nav-link">功能</a>
                  <a href="#" className="mobile-nav-link">文档</a>
                  <a href="#" className="mobile-nav-link">价格</a>
                  <button className="btn btn-outline w-full" onClick={() => navigate('/login')}>
                    <LogIn className="btn-icon" />
                    登录
                  </button>
                  <button className="btn btn-primary w-full" onClick={() => navigate('/register')}>
                    注册
                  </button>
                </>
              )}
              <button className="btn btn-icon w-full" onClick={toggleDarkMode}>
                {isDarkMode ? '☀️ 切换到浅色模式' : '🌙 切换到深色模式'}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 英雄区域 */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>创建专属智能体，释放AI潜能</h1>
              <p>小歪是一款基于智能体技术的人工智能助手，根据用户的自定义需求创建专属智能体，为你提供个性化的智能服务。</p>
              <div className="hero-buttons">
                {isLoggedIn ? (
                  <button className="btn btn-primary" onClick={() => navigate('/agents')}>
                    创建智能体
                    <ChevronRight className="btn-icon" />
                  </button>
                ) : (
                  <>
                    <button className="btn btn-primary" onClick={() => navigate('/register')}>
                      开始使用
                      <ChevronRight className="btn-icon" />
                    </button>
                    <button className="btn btn-outline" onClick={() => navigate('/login')}>
                      试用体验
                    </button>
                  </>
                )}
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">10,000+</span>
                  <span className="stat-label">活跃用户</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">50,000+</span>
                  <span className="stat-label">智能体创建</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">99.9%</span>
                  <span className="stat-label">系统可用性</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="ai-visual">
                <div className="brain-container">
                  <Brain className="brain-icon" />
                  <div className="brain-glow"></div>
                </div>
                <div className="floating-elements">
                  <div className="floating-element">
                    <MessageSquare className="element-icon" />
                  </div>
                  <div className="floating-element">
                    <Settings className="element-icon" />
                  </div>
                  <div className="floating-element">
                    <Users className="element-icon" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 功能特点 */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>核心功能</h2>
            <p>小歪提供强大的智能体创建和管理功能，满足你的各种需求</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Settings />
              </div>
              <h3>智能体创建</h3>
              <p>根据用户需求自定义创建专属智能体，设置角色、功能和行为，打造你的专属AI助手。</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <MessageSquare />
              </div>
              <h3>智能对话</h3>
              <p>与创建的智能体进行自然语言对话，获取专业领域的智能回答，解决你的各种问题。</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Users />
              </div>
              <h3>用户管理</h3>
              <p>完善的用户系统，支持注册、登录、个人信息管理等功能，保障你的账户安全。</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Brain />
              </div>
              <h3>会话管理</h3>
              <p>记录与智能体的对话历史，支持多会话管理和切换，方便你随时回顾和继续对话。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 如何使用 */}
      <section className="how-to-section">
        <div className="container">
          <div className="section-header">
            <h2>如何使用</h2>
            <p>简单三步，开始你的智能体之旅</p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>注册账号</h3>
                <p>创建个人账号，登录系统，开始你的智能体之旅。</p>
              </div>
            </div>
            <div className="step-divider"></div>
            <div className="step">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>创建智能体</h3>
                <p>根据需求设置智能体的角色、功能和行为，打造专属AI助手。</p>
              </div>
            </div>
            <div className="step-divider"></div>
            <div className="step">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>开始对话</h3>
                <p>与创建的智能体进行自然语言对话，获取智能回答和服务。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 底部 */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <Brain className="logo-icon" />
                <span>小歪</span>
              </div>
              <p className="footer-tagline">AI 智能体助手</p>
            </div>
            <div className="footer-links">
              <div className="footer-link-group">
                <h4>产品</h4>
                <ul>
                  <li><a href="#">功能</a></li>
                  <li><a href="#">定价</a></li>
                  <li><a href="#">文档</a></li>
                  <li><a href="#">更新日志</a></li>
                </ul>
              </div>
              <div className="footer-link-group">
                <h4>公司</h4>
                <ul>
                  <li><a href="#">关于我们</a></li>
                  <li><a href="#">联系我们</a></li>
                  <li><a href="#">招贤纳士</a></li>
                  <li><a href="#">博客</a></li>
                </ul>
              </div>
              <div className="footer-link-group">
                <h4>支持</h4>
                <ul>
                  <li><a href="#">帮助中心</a></li>
                  <li><a href="#">常见问题</a></li>
                  <li><a href="#">隐私政策</a></li>
                  <li><a href="#">服务条款</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 小歪 - AI 智能体助手. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/agents" element={<AgentManagement />} />
      <Route path="/sessions" element={<SessionManagement />} />
    </Routes>
  )
}

export default App
