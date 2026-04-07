import { useState, FormEvent } from 'react'
import { LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 清除对应字段的错误
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }))
    // 清除登录错误
    setLoginError('')
  }

  const validateForm = (): boolean => {
    const newErrors = {
      username: '',
      password: ''
    }

    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    }

    if (!formData.password.trim()) {
      newErrors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少为6位'
    }

    setErrors(newErrors)
    return Object.values(newErrors).every(error => error === '')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setLoginError('')

    try {
      const response = await fetch('http://localhost:8080/api/v1/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // 保存token和用户名到localStorage
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('username', formData.username)
        // 跳转到主页
        navigate('/')
      } else {
        setLoginError(data.msg || '登录失败，请重试')
      }
    } catch (error) {
      setLoginError('网络错误，请检查网络连接')
      console.error('登录错误:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <button 
            className="back-button" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="login-brand">
            <h1>小歪</h1>
            <p>AI 智能体助手</p>
          </div>
        </div>

        <div className="login-form-container">
          <h2>登录</h2>
          <p className="login-subtitle">欢迎回来，请登录您的账号</p>

          <form onSubmit={handleSubmit} className="login-form">
            {loginError && (
              <div className="error-message">
                {loginError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">用户名</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="请输入用户名"
                className={errors.username ? 'input-error' : ''}
                disabled={isLoading}
              />
              {errors.username && (
                <div className="input-error-message">
                  {errors.username}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">密码</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="请输入密码"
                  className={errors.password ? 'input-error' : ''}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <div className="input-error-message">
                  {errors.password}
                </div>
              )}
            </div>

            <div className="form-actions">
              <a href="#" className="forgot-password">忘记密码？</a>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>

            <div className="login-footer">
              <p>还没有账号？ <a href="#" className="register-link">立即注册</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login