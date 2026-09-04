/**
 * 管理端登录页。沿用模版的视觉与 AuthPage.css,但去掉了注册 / 忘记密码 / 角色下拉 / 假验证码 ——
 * 后端只有一个硬编码的 admin 账号,也没有注册接口(见 docs/管理端功能与接口对接文档.md §2.1)。
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../lib/localizedToast';
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  FolderCheckIcon,
  LockKeyholeIcon,
  MoonIcon,
  ShieldCheckIcon,
  SlidersIcon,
  SunIcon,
  UserRoundIcon,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { usePendingCounts } from '../hooks/usePendingCounts';
import ThemePanel from '../components/ThemePanel';
import { login } from '../api';
import appConfig from '../config/app.json';
import './AuthPage.css';

function AuthVisual() {
  return (
    <aside className="auth-showcase" aria-label="产品介绍">
      <div className="auth-brand">
        <span className="auth-brand-mark">
          <span />
          <span />
          <span />
        </span>
        <span>{appConfig.brand.name}</span>
      </div>

      <div className="auth-display" aria-hidden="true">
        <div className="auth-display-orbit" />
        <div className="auth-display-spark auth-display-spark-one" />
        <div className="auth-display-spark auth-display-spark-two" />
        <div className="auth-monitor">
          <div className="auth-monitor-bar">
            <span />
            <span />
            <span />
          </div>
          <div className="auth-monitor-content">
            <div className="auth-monitor-rail">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="auth-monitor-main">
              <div className="auth-monitor-line auth-monitor-line-short" />
              <div className="auth-monitor-line" />
              <div className="auth-monitor-chart">
                <span className="chart-column-one" />
                <span className="chart-column-two" />
                <span className="chart-column-three" />
                <span className="chart-column-four" />
                <span className="chart-column-five" />
              </div>
            </div>
          </div>
        </div>

        <div className="auth-folder">
          <div className="auth-folder-tab" />
          <div className="auth-folder-body">
            <FolderCheckIcon size={52} strokeWidth={1.55} />
            <div className="auth-folder-check">
              <CheckIcon size={15} strokeWidth={3} />
            </div>
          </div>
        </div>

        <div className="auth-security-badge">
          <ShieldCheckIcon size={20} />
          <span>房源 · 订单 · 房东统一管理</span>
        </div>
      </div>

      <div className="auth-showcase-copy">
        <p>随心住房屋租订系统</p>
        <span>房源审核、订单跟踪、房东认证与运营配置,都在这里完成。</span>
      </div>
    </aside>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { themeState, setMode } = useTheme();
  const { refresh } = usePendingCounts();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [themePanelOpen, setThemePanelOpen] = useState(false);

  const isDark = themeState.mode === 'dark';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    // 旧界面的校验:两项都必填,文案「请输入账号和密码」(admin.js:108-111)
    if (!username || !password) {
      toast.warning('请输入账号和密码');
      return;
    }

    setSubmitting(true);
    try {
      await login(username, password);
      toast.success('登录成功');
      void refresh();
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '登录失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-frame">
        <AuthVisual />

        <section className="auth-main" aria-labelledby="auth-title">
          <header className="auth-toolbar">
            <span className="auth-back" style={{ pointerEvents: 'none' }}>
              <ShieldCheckIcon size={16} />
              <span>管理员登录</span>
            </span>
            <div className="auth-toolbar-actions">
              <button type="button" className="auth-icon-button" title="主题设置" onClick={() => setThemePanelOpen(true)}>
                <SlidersIcon size={17} />
              </button>
              <button
                type="button"
                className="auth-icon-button"
                title={isDark ? '切换到浅色' : '切换到深色'}
                onClick={() => setMode(isDark ? 'light' : 'dark')}
              >
                {isDark ? <SunIcon size={17} /> : <MoonIcon size={17} />}
              </button>
            </div>
          </header>

          <div className="auth-form-wrap">
            <div className="auth-heading">
              <h1 className="page-title" id="auth-title">随心住 · 管理后台</h1>
              <p>请使用管理员账号登录</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <span>用户名</span>
                <div className="auth-input-wrap">
                  <UserRoundIcon size={17} />
                  <input
                    autoFocus
                    value={username}
                    onChange={event => setUsername(event.target.value)}
                    placeholder="请输入用户名"
                    autoComplete="username"
                  />
                </div>
              </label>

              <label className="auth-field">
                <span>密码</span>
                <div className="auth-input-wrap">
                  <LockKeyholeIcon size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    placeholder="请输入密码"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    title={showPassword ? '隐藏密码' : '显示密码'}
                    onClick={() => setShowPassword(open => !open)}
                  >
                    {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
              </label>

              <button className="auth-submit" type="submit" disabled={submitting}>
                {submitting ? '登录中…' : '登 录'}
              </button>
            </form>

            <div className="auth-footer">
              <span>默认账号: admin / 密码: 123456</span>
            </div>
          </div>

          <footer className="auth-copyright">{appConfig.copyright}</footer>
        </section>
      </div>

      <ThemePanel open={themePanelOpen} onClose={() => setThemePanelOpen(false)} />
    </main>
  );
}
