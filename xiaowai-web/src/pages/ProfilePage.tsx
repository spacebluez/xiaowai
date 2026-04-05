import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, avatarUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { Gender } from '../types';

const genderOptions: { value: Gender; label: string }[] = [
  { value: 'unknown', label: '保密' },
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' },
];

export default function ProfilePage() {
  const { user, setUser, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    nickname: '',
    birthday: '',
    gender: 'unknown' as Gender,
    hobbies: '',
    signature: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      nickname: user.nickname || '',
      birthday: user.birthday ? user.birthday.slice(0, 10) : '',
      gender: user.gender || 'unknown',
      hobbies: user.hobbies || '',
      signature: user.signature || '',
    });
  }, [user]);

  const previewAvatar = useMemo(() => {
    if (!user || avatarFailed) return '';
    return avatarUrl(user.id);
  }, [user, avatarFailed]);

  const lastUpdated = useMemo(() => {
    if (!user?.updatedat) return '尚未更新';
    return new Date(user.updatedat).toLocaleString();
  }, [user?.updatedat]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await api.updateProfile({
        nickname: form.nickname.trim(),
        birthday: form.birthday || undefined,
        gender: form.gender,
        hobbies: form.hobbies.trim(),
        signature: form.signature.trim(),
      });
      setUser(response.data);
      setMessage('资料已更新');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await api.updateAvatar(formData);
      setAvatarFailed(false);
      const profile = await refreshProfile();
      if (profile) setUser(profile);
      setMessage('头像上传成功');
    } catch (err) {
      setError(err instanceof Error ? err.message : '头像上传失败');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="dashboard-shell product-profile-shell">
      <header className="dashboard-topbar">
        <div>
          <p className="eyebrow">PERSONAL SPACE</p>
          <h1>我的资料</h1>
        </div>
        <nav className="topbar-links">
          <Link to="/chat">返回对话</Link>
          <Link to="/">首页</Link>
        </nav>
      </header>

      <section className="profile-layout product-profile-layout">
        <aside className="profile-card profile-identity product-profile-side">
          <div className="avatar-stack product-avatar-stack">
            {previewAvatar ? (
              <img src={previewAvatar} alt="用户头像" onError={() => setAvatarFailed(true)} />
            ) : (
              <div className="avatar-fallback">{form.nickname?.slice(0, 1) || '歪'}</div>
            )}
            <label className="secondary-button compact-button upload-button">
              {uploading ? '上传中…' : '更换头像'}
              <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            </label>
          </div>

          <div className="identity-copy">
            <strong>{user?.nickname || '未命名用户'}</strong>
            <span>用户 ID #{user?.id}</span>
            <em>最近更新：{lastUpdated}</em>
          </div>

          <div className="profile-quiet-card">
            <span>今日印象</span>
            <strong>{form.signature || '还没有留下签名，写一句最像你的话吧。'}</strong>
          </div>
        </aside>

        <form className="profile-card profile-form product-profile-form" onSubmit={handleSave}>
          <div className="section-heading">
            <h2>基础信息</h2>
            <p>让小歪更了解你的称呼、习惯和表达方式。</p>
          </div>

          <div className="form-grid two-columns">
            <label>
              <span>昵称</span>
              <input
                value={form.nickname}
                onChange={(event) => setForm((prev) => ({ ...prev, nickname: event.target.value }))}
                placeholder="你希望被怎样称呼"
                required
              />
            </label>
            <label>
              <span>生日</span>
              <input
                type="date"
                value={form.birthday}
                onChange={(event) => setForm((prev) => ({ ...prev, birthday: event.target.value }))}
              />
            </label>
            <label>
              <span>性别</span>
              <select
                value={form.gender}
                onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value as Gender }))}
              >
                {genderOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>经验值</span>
              <input value={String(user?.experience ?? 0)} readOnly />
            </label>
          </div>

          <div className="section-heading compact-heading">
            <h2>个性表达</h2>
            <p>这些内容会帮助你在使用过程中更有归属感。</p>
          </div>

          <label>
            <span>爱好</span>
            <textarea
              value={form.hobbies}
              onChange={(event) => setForm((prev) => ({ ...prev, hobbies: event.target.value }))}
              rows={4}
              placeholder="例如：音乐、咖啡、电影、徒步"
            />
          </label>

          <label>
            <span>个性签名</span>
            <textarea
              value={form.signature}
              onChange={(event) => setForm((prev) => ({ ...prev, signature: event.target.value }))}
              rows={4}
              placeholder="写一句最像你的话"
            />
          </label>

          {error ? <div className="form-error">{error}</div> : null}
          {message ? <div className="form-success">{message}</div> : null}

          <div className="profile-form-actions">
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? '保存中…' : '保存修改'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
