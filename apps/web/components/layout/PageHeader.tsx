type Props = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, subtitle, children }: Props) {
  return (
    <div className="border-b border-border bg-surface px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-black text-text-dark">{title}</h1>
        {subtitle && <p className="mt-1 text-text-muted">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
