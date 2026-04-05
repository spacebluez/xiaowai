import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const highlights = [
  {
    title: '聪明但克制',
    text: '整理问题、润色表达、陪你推进日常沟通与工作思考。',
  },
  {
    title: '个人空间',
    text: '维护昵称、头像、生日与个性签名，让助手更懂你的表达习惯。',
  },
  {
    title: '随时可达',
    text: '无论是在深夜整理想法，还是白天快速求助，都能立即开始对话。',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const greeting = useMemo(() => {
    if (!user) return '一个更懂中文语境、更适合日常表达与陪伴交流的智能助手。';
    return `欢迎回来，${user.nickname || '小歪用户'}。今天想从哪一句话开始？`;
  }, [user]);

  const handleStart = async () => {
    const profile = await refreshProfile();
    navigate(profile ? '/chat' : '/login');
  };

  return (
    <div className="shell shell-home product-home">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">歪</span>
          <span>
            <strong>Xiaowai</strong>
            <em>陪伴式智能助手</em>
          </span>
        </Link>
        <nav className="topbar-links">
          {user ? <Link to="/profile">我的资料</Link> : <Link to="/login">登录</Link>}
          <Link to="/register">注册</Link>
        </nav>
      </header>

      <main className="hero-grid product-hero-grid">
        <section className="hero-card hero-card-main product-hero-main">
          <p className="eyebrow">XIAOWAI</p>
          <h1>把想说的话，慢慢说清楚。</h1>
          <p className="hero-copy">{greeting}</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => void handleStart()}>
              立即开始
            </button>
            <Link className="secondary-button" to="/register">
              创建账号
            </Link>
          </div>
        </section>

        <aside className="hero-card hero-card-side ambiance-panel">
          <div className="quote-block">
            <span>今日灵感</span>
            <strong>“表达不是更快，而是更接近真正想说的话。”</strong>
          </div>
          <div className="mini-cards">
            <div className="mini-card">
              <span>适合场景</span>
              <strong>整理思路 · 对话陪伴 · 文字润色</strong>
            </div>
            <div className="mini-card">
              <span>体验节奏</span>
              <strong>轻量、专注、安静</strong>
            </div>
          </div>
        </aside>
      </main>

      <section className="feature-grid product-feature-grid">
        {highlights.map((item) => (
          <article className="feature-card product-feature-card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <footer className="site-footer">
        <span>© 2026 小歪 Xiaowai. All rights reserved.</span>
        <div>
          <a href="#">关于</a>
          <a href="#">隐私政策</a>
          <a href="#">服务条款</a>
          <a href="#">联系我们</a>
        </div>
      </footer>
    </div>
  );
}
