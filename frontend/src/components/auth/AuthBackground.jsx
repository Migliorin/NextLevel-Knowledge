export function AuthBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-[-12%] top-[-12%] h-[420px] w-[420px] rounded-full bg-auth-primary/20 blur-[100px]" />
      <div className="absolute bottom-[-12%] right-[-12%] h-[420px] w-[420px] rounded-full bg-auth-secondary/20 blur-[100px]" />

      <div className="auth-data-path top-[24%] opacity-40" />
      <div className="auth-data-path top-[58%] opacity-25" />
      <div className="auth-data-path top-[82%] opacity-30" />
    </div>
  );
}
