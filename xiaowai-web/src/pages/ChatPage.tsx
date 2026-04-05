import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { ChatMessage } from '../types';

const prompts = ['帮我整理一段工作汇报', '把这句话改得更温柔一些', '给我一个今天的自我介绍版本'];

function createMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage('assistant', '你好，我是小歪。想聊天、整理表达，或者把一个模糊的念头说清楚，都可以现在开始。'),
  ]);

  const welcome = useMemo(() => {
    return user?.nickname ? `${user.nickname}，欢迎回来` : '欢迎来到小歪';
  }, [user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim();
    if (!value || pending) return;

    const userMessage = createMessage('user', value);
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setPending(true);
    setError('');

    try {
      const response = await api.chat(value);
      setMessages((current) => [...current, createMessage('assistant', response.data.output)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '对话失败，请稍后再试');
    } finally {
      setPending(false);
    }
  };

  const handlePrompt = (prompt: string) => {
    setInput(prompt);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-shell chat-shell product-chat-shell">
      <header className="dashboard-topbar">
        <div>
          <p className="eyebrow">YOUR CONVERSATION SPACE</p>
          <h1>{welcome}</h1>
        </div>
        <nav className="topbar-links">
          <Link to="/profile">我的资料</Link>
          <button className="text-button" onClick={() => void handleLogout()}>
            退出登录
          </button>
        </nav>
      </header>

      <section className="chat-layout product-chat-layout">
        <aside className="chat-sidebar product-chat-sidebar">
          <div className="sidebar-card tone-card">
            <span className="sidebar-label">今日状态</span>
            <h2>安静、专注、适合慢慢把话说清楚。</h2>
            <p>你可以把它当作一个懂中文表达节奏的陪伴式助手。</p>
          </div>
          <div className="sidebar-card prompt-card">
            <span className="sidebar-label">快速开始</span>
            <div className="prompt-list">
              {prompts.map((prompt) => (
                <button key={prompt} type="button" className="prompt-chip" onClick={() => handlePrompt(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="chat-main product-chat-main">
          <div className="message-list product-message-list">
            {messages.map((message) => (
              <article className={`message-bubble ${message.role}`} key={message.id}>
                <div className="message-meta-row">
                  <span className="message-role">{message.role === 'user' ? '你' : '小歪'}</span>
                  <time>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                </div>
                <p>{message.content}</p>
              </article>
            ))}
            {pending ? (
              <article className="message-bubble assistant pending">
                <div className="message-meta-row">
                  <span className="message-role">小歪</span>
                  <time>思考中</time>
                </div>
                <p>我在整理你的问题，稍等一下。</p>
              </article>
            ) : null}
          </div>

          <form className="chat-form product-chat-form" onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={4}
              placeholder="想说什么，就从这里开始。"
            />
            <div className="chat-form-footer">
              {error ? <div className="form-error inline-error">{error}</div> : <span>小歪更擅长中文场景下的表达整理与陪伴交流</span>}
              <button className="primary-button" type="submit" disabled={pending || !input.trim()}>
                {pending ? '发送中…' : '发送'}
              </button>
            </div>
          </form>
        </main>
      </section>
    </div>
  );
}
