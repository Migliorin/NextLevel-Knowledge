import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";

function AppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute left-[-12rem] top-[-12rem] h-[32rem] w-[32rem] rounded-full bg-[#35A9F6]/20 blur-3xl" />
      <div className="absolute right-[-10rem] top-24 h-[30rem] w-[30rem] rounded-full bg-[#7D7BF2]/20 blur-3xl" />
      <div className="absolute bottom-[-14rem] left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#371A7B]/30 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#062F5F55,transparent_34%),linear-gradient(135deg,#011134_0%,#001D41_52%,#011134_100%)]" />
      <div className="auth-data-path absolute inset-0 opacity-30" />
    </div>
  );
}

export function AppLayout({ activeItem, children, goTo }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-auth-background text-auth-on-surface">
      <AppBackground />

      <Sidebar activeItem={activeItem} goTo={goTo} />

      <main className="min-h-screen md:ml-64">
        <AppHeader goTo={goTo} />
        {children}
      </main>
    </div>
  );
}
