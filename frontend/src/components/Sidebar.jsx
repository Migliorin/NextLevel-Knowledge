import { avatarPhoto } from "../constants/media";
import { ROUTES } from "../routes";
import { getCurrentUser, logout } from "../services/auth";
import { Icon } from "./Icon";
import { SidebarNav } from "./SidebarNav";

export function Sidebar({ activeItem = "documents", goTo }) {
  const currentUser = getCurrentUser();
  const displayName = currentUser?.name || currentUser?.email || "Usuário";

  const handleLogout = async () => {
    await logout();
    goTo(ROUTES.login);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-auth-outline-variant/40 bg-auth-background/90 p-4 font-manrope text-sm text-auth-on-surface shadow-2xl shadow-black/30 backdrop-blur-xl md:flex">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-8 h-48 w-48 rounded-full bg-[#35A9F6]/15 blur-3xl" />
        <div className="absolute -bottom-24 right-[-5rem] h-56 w-56 rounded-full bg-[#7D7BF2]/15 blur-3xl" />
        <div className="auth-data-path absolute inset-0 opacity-20" />
      </div>

      <div className="relative mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07]">
          <img
            alt="Avatar do usuário"
            className="h-full w-full object-cover"
            src={avatarPhoto}
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-auth-on-surface">
            {displayName}
          </p>

          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-auth-on-surface-variant">
            <span className="h-1.5 w-1.5 rounded-full bg-[#35A9F6]" />
            Conta ativa
          </p>
        </div>
      </div>

      <div className="relative flex-1">
        <SidebarNav activeItem={activeItem} goTo={goTo} />
      </div>

      <div className="relative mt-auto space-y-3 border-t border-white/10 pt-4">
        <button
          className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left font-semibold text-auth-on-surface-variant transition hover:border-[#35A9F6]/30 hover:bg-[#35A9F6]/10 hover:text-auth-on-surface"
          type="button"
        >
          <Icon className="text-xl text-auth-primary">help_outline</Icon>
          <span>Central de ajuda</span>
        </button>

        <button
          className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left font-bold text-auth-on-surface-variant transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-100"
          type="button"
          onClick={handleLogout}
        >
          <Icon className="text-xl">logout</Icon>
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}