import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = (location.state as { from?: string } | null)?.from || '/chat';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.login({
        username: form.username.trim(),
        password: form.password,
      });

      const profile = await refreshProfile();
      if (!profile) {
        throw new Error('登录成功，但未获取到用户资料，请稍后重试');
      }

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel auth-panel-intro">
        <p className="eyebrow">WELCOME BACK</p>
        <h1>欢迎回到小歪</h1>
        <p>登录后，你可以继续对话、维护个人资料，并在熟悉的节奏里开始今天的交流。</p>
      </div>

      <form className="auth-panel auth-form" onSubmit={handleSubmit}>
        <h2>账号登录</h2>
        <label>
          <span>用户名</span>
          <input
            value={form.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            placeholder="请输入用户名"
            autoComplete="username"
            required
          />
        </label>
        <label>
          <span>密码</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="请输入密码"
            autoComplete="current-password"
            required
          />
        </label>

        {error ? <div className="form-error">{error}</div> : null}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? '登录中…' : '登录'}
        </button>

        <p className="form-hint">
          还没有账号？<Link to="/register">立即注册</Link>
        </p>
      </form>
    </div>
  );
}
