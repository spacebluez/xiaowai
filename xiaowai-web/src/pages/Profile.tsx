import { useState, useEffect } from 'react'
import { ArrowLeft, User, Calendar, Image, Gender, Heart, Edit3, Save, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../api/api'
import { UserProfileData, ProfileRequest } from '../types'
import '../App.css'

function Profile() {
  const [userData, setUserData] = useState<UserProfileData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<ProfileRequest>({
    nickname: '',
    birthday: '',
    avatar: '',
    gender: 'unknown',
    hobbies: '',
    signature: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({
    nickname: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setIsLoading(true)
    try {
      const response = await userApi.getProfile()
      const userProfile = response.data
      setUserData(userProfile)
      setFormData({
        nickname: userProfile.nickname,
        birthday: userProfile.birthday ? new Date(userProfile.birthday).toISOString().split('T')[0] : '',
        avatar: userProfile.avatar,
        gender: userProfile.gender,
        hobbies: userProfile.hobbies,
        signature: userProfile.signature
      })
    } catch (error: any) {
      console.error('获取用户资料失败:', error)
      setMessage(`获取用户资料失败: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
      // 预览头像
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({
            ...prev,
            avatar: event.target.result as string
          }))
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {
      nickname: ''
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = '请输入昵称'
    } else if (formData.nickname.length < 2 || formData.nickname.length > 20) {
      newErrors.nickname = '昵称长度为2-20位'
    }

    setErrors(newErrors)
    return Object.values(newErrors).every(error => error === '')
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      // 先更新头像（如果有）
      if (avatarFile) {
        const formDataForAvatar = new FormData()
        formDataForAvatar.append('avatar', avatarFile)
        await userApi.updateAvatar(formDataForAvatar)
      }

      // 更新用户资料
      await userApi.updateProfile({
        nickname: formData.nickname,
        birthday: formData.birthday,
        avatar: formData.avatar,
        gender: formData.gender,
        hobbies: formData.hobbies,
        signature: formData.signature
      })

      setMessage('保存成功')
      setIsEditing(false)
      // 重新获取用户资料
      fetchUserData()
    } catch (error: any) {
      console.error('保存用户资料失败:', error)
      setMessage(`保存失败: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (userData) {
      setFormData({
        nickname: userData.nickname,
        birthday: userData.birthday ? new Date(userData.birthday).toISOString().split('T')[0] : '',
        avatar: userData.avatar,
        gender: userData.gender,
        hobbies: userData.hobbies,
        signature: userData.signature
      })
    }
    setAvatarFile(null)
    setErrors({})
    setMessage('')
  }

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading">加载中...</div>
        </div>
      </div>
    )
  }

  // 处理头像URL
  const getAvatarUrl = (avatar: string | undefined) => {
    if (!avatar || avatar.startsWith('oss://')) {
      // 如果没有头像或者是oss协议，使用默认头像
      return null;
    }
    return avatar;
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <button 
            className="back-button" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={20} />
          </button>
          <h1>个人资料</h1>
          {!isEditing && (
            <button 
              className="edit-button" 
              onClick={() => setIsEditing(true)}
            >
              <Edit3 size={20} />
            </button>
          )}
        </div>

        {message && (
          <div className={`message ${message.includes('成功') ? 'success-message' : 'error-message'}`}>
            {message}
          </div>
        )}

        <div className="profile-content">
          <div className="avatar-section">
            <div className="avatar-container">
              {getAvatarUrl(formData.avatar) ? (
                <img 
                  src={getAvatarUrl(formData.avatar)} 
                  alt="头像" 
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  {userData?.nickname.charAt(0) || localStorage.getItem('username')?.charAt(0) || 'U'}
                </div>
              )}
              {isEditing && (
                <label className="avatar-upload">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                    className="avatar-input"
                  />
                  <span className="avatar-upload-text">更换头像</span>
                </label>
              )}
            </div>
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label htmlFor="nickname">昵称</label>
              {isEditing ? (
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  placeholder="请输入昵称"
                  className={errors.nickname ? 'input-error' : ''}
                  disabled={isSaving}
                />
              ) : (
                <div className="form-value">{userData?.nickname || '未设置'}</div>
              )}
              {errors.nickname && (
                <div className="input-error-message">
                  {errors.nickname}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="gender">性别</label>
              {isEditing ? (
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className="form-select"
                >
                  <option value="unknown">未知</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">其他</option>
                </select>
              ) : (
                <div className="form-value">
                  {userData?.gender === 'male' ? '男' : 
                   userData?.gender === 'female' ? '女' : 
                   userData?.gender === 'other' ? '其他' : '未知'}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="birthday">生日</label>
              {isEditing ? (
                <input
                  type="date"
                  id="birthday"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
              ) : (
                <div className="form-value">{userData?.birthday || '未设置'}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="hobbies">爱好</label>
              {isEditing ? (
                <input
                  type="text"
                  id="hobbies"
                  name="hobbies"
                  value={formData.hobbies}
                  onChange={handleInputChange}
                  placeholder="请输入爱好，多个爱好用逗号分隔"
                  disabled={isSaving}
                />
              ) : (
                <div className="form-value">{userData?.hobbies || '未设置'}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="signature">个性签名</label>
              {isEditing ? (
                <textarea
                  id="signature"
                  name="signature"
                  value={formData.signature}
                  onChange={handleInputChange}
                  placeholder="请输入个性签名"
                  rows={3}
                  disabled={isSaving}
                  className="form-textarea"
                />
              ) : (
                <div className="form-value">{userData?.signature || '未设置'}</div>
              )}
            </div>

            <div className="form-group">
              <label>经验值</label>
              <div className="form-value">{userData?.experience || 0}</div>
            </div>

            <div className="form-group">
              <label>更新时间</label>
              <div className="form-value">
                {userData?.updatedat ? new Date(userData.updatedat).toLocaleString() : '未更新'}
              </div>
            </div>
          </div>

          {isEditing && (
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
                onClick={handleSave}
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
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
