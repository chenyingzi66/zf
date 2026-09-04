import type { CSSProperties, ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  titleSize?: number;
}

/**
 * 页面标题块。字号规范:页面主标题 13px,其余文字一律不超过 12px,
 * 全局封顶规则见 src/index.css 末尾的「字号规范」段。
 */
export default function PageHeader({ title, description, actions, titleSize = 13 }: PageHeaderProps) {
  const style: CSSProperties = {
    marginBottom: 24,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: actions ? 'space-between' : undefined,
    gap: 16,
  };

  return (
    <div style={style}>
      <div>
        <h1 className="page-title" style={{ fontSize: titleSize, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>{title}</h1>
        {description && <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>{description}</p>}
      </div>
      {actions}
    </div>
  );
}
