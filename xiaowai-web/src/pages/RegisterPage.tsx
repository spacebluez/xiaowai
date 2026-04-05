import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

const initialForm = {
  username: '',
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
  phone: '',
  agreement: false,
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!countdown) return;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const canSendCode = useMemo(() => !!form.email && countdown === 0 && !sendingCode, [form.email, countdown, sendingCode]);

  const validate = () => {
    if (form.username.trim().length < 2 || form.username.trim().length > 50) {
      return '用户名长度需在 2 到 50 个字符之间';
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      return '请输入合法邮箱地址';
    }
    if (!/^\d{6}$/.test(form.code)) {
      return '验证码必须为 6 位数字';
    }
    if (form.password.length < 6) {
      return '密码至少需要 6 位';
    }
    if (form.password !== form.confirmPassword) {
      return '两次输入的密码不一致';
    }
    if (!form.agreement) {
      return '请先勾选用户协议';
    }
    return '';
  };

  const handleSendCode = async () => {
    setError('');
    setSuccess('');

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('请先输入合法邮箱地址');
      return;
    }

    setSendingCode(true);
    try {
      await api.sendCode(form.email.trim());
      setCountdown(60);
      setSuccess('验证码已发送，请查收邮箱');
    } catch (err) {
      const message = err instanceof Error ? err.message : '验证码发送失败';
      if (message.includes('550')) {
        setError('该邮箱地址无法投递，请确认邮箱填写正确，或先使用可正常收信的邮箱进行测试。');
      } else {
        setError(message);
      }
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = validate();
    setError(message);
    setSuccess('');
    if (message) return;

    setSubmitting(true);
    try {
      await api.register({
        username: form.username.trim(),
        email: form.email.trim(),
        code: form.code.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      setSuccess('注册成功，即将跳转登录页');
      window.setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell auth-shell-wide">
      <div className="auth-panel auth-panel-intro">
        <p className="eyebrow">CREATE YOUR ACCOUNT</p>
        <h1>注册小歪账号</h1>
        <p>完成邮箱验证后，即可开启属于你的智能对话空间。</p>
      </div>

      <form className="auth-panel auth-form" onSubmit={handleSubmit}>
        <h2>创建账号</h2>
        <div className="form-grid two-columns">
          <label>
            <span>用户名</span>
            <input
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              placeholder="2-50 个字符"
              required
            />
          </label>
          <label>
            <span>邮箱</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="name@example.com"
              required
            />
          </label>
          <label>
            <span>验证码</span>
            <div className="inline-field">
              <input
                value={form.code}
                onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                placeholder="6 位验证码"
                maxLength={6}
                required
              />
              <button type="button" className="secondary-button compact-button" disabled={!canSendCode} onClick={() => void handleSendCode()}>
                {countdown > 0 ? `${countdown}s` : sendingCode ? '发送中…' : '获取验证码'}
              </button>
            </div>
          </label>
          <label>
            <span>手机号（可选）</span>
            <input
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="选填"
            />
          </label>
          <label>
            <span>密码</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="至少 6 位"
              autoComplete="new-password"
              required
            />
          </label>
          <label>
            <span>确认密码</span>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              placeholder="再次输入密码"
              autoComplete="new-password"
              required
            />
          </label>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.agreement}
            onChange={(event) => setForm((prev) => ({ ...prev, agreement: event.target.checked }))}
          />
          <span>我已阅读并同意《用户协议》与《隐私政策》</span>
        </label>

        {error ? <div className="form-error">{error}</div> : null}
        {success ? <div className="form-success">{success}</div> : null}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? '注册中…' : '创建账号'}
        </button>

        <p className="form-hint">
          已有账号？<Link to="/login">返回登录</Link>
        </p>
      </form>
    </div>
  );
}
