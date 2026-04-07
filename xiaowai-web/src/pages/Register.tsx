import { useState, FormEvent } from 'react'
import { LogIn, Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { userApi, verificationApi } from '../api/api'
import '../App.css'

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    username: '',
    password: '',
    phone: ''
  })
  const [errors, setErrors] = useState({
    email: '',
    code: '',
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isSendingCode, setIsSendingCode] = useState(false)
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
    // 清除注册错误
    setRegisterError('')
  }

  const validateForm = (): boolean => {
    const newErrors = {
      email: '',
      code: '',
      username: '',
      password: ''
    }

    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    if (!formData.code.trim()) {
      newErrors.code = '请输入验证码'
    } else if (formData.code.length !== 6) {
      newErrors.code = '验证码长度为6位'
    }

    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    } else if (formData.username.length < 2 || formData.username.length > 50) {
      newErrors.username = '用户名长度为2-50位'
    }

    if (!formData.password.trim()) {
      newErrors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少为6位'
    }

    setErrors(newErrors)
    return Object.values(newErrors).every(error => error === '')
  }

  const handleSendCode = async () => {
    if (!formData.email.trim()) {
      setErrors(prev => ({
        ...prev,
        email: '请输入邮箱'
      }))
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: '请输入有效的邮箱地址'
      }))
      return
    }

    setIsSendingCode(true)
    try {
      await verificationApi.sendCode({ email: formData.email })
      // 开始倒计时
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      setRegisterError(error.message || '发送验证码失败，请重试')
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setRegisterError('')

    try {
      await userApi.register({
        email: formData.email,
        code: formData.code,
        username: formData.username,
        password: formData.password,
        phone: formData.phone
      })
      // 注册成功，跳转到登录页面
      navigate('/login')
    } catch (error: any) {
      setRegisterError(error.message || '注册失败，请重试')
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
          <h2>注册</h2>
          <p className="login-subtitle">创建新账号，开始使用小歪</p>

          <form onSubmit={handleSubmit} className="login-form">
            {registerError && (
              <div className="error-message">
                {registerError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">邮箱</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="请输入邮箱"
                className={errors.email ? 'input-error' : ''}
                disabled={isLoading}
              />
              {errors.email && (
                <div className="input-error-message">
                  {errors.email}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="code">验证码</label>
              <div className="code-input-container">
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="请输入验证码"
                  className={errors.code ? 'input-error' : ''}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="code-button"
                  onClick={handleSendCode}
                  disabled={isLoading || isSendingCode || countdown > 0}
                >
                  {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
              </div>
              {errors.code && (
                <div className="input-error-message">
                  {errors.code}
                </div>
              )}
            </div>

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

            <div className="form-group">
              <label htmlFor="phone">手机号（可选）</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="请输入手机号"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? '注册中...' : '注册'}
            </button>

            <div className="login-footer">
              <p>已有账号？ <a href="/login" className="register-link">立即登录</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
