import { useEffect, useRef, useState } from "react";
import { avatarPhoto } from "../constants/media";
import { ROUTES } from "../routes";
import { getCurrentUser, logout } from "../services/auth";
import { Icon } from "./Icon";

export function AppHeader({ goTo, activeSection = "documents" }) {
  const userMenuRef = useRef(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const currentUser = getCurrentUser();
  const displayName = currentUser?.name || currentUser?.email || "Usuario";

  useEffect(() => {
    if (!isUserMenuOpen) {
      return undefined;
    }

    const closeOnOutsideClick = (event) => {
      if (!userMenuRef.current?.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    await logout();
    goTo(ROUTES.login);
  };

  const navItems = [["documents", "Documents"]];

  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-outline-variant/10 bg-surface/80 px-5 py-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-bold tracking-tighter text-blue-900">NextLevel Knowledge</h1>
        <div className="hidden items-center gap-6 font-manrope text-sm font-medium tracking-tight lg:flex">
          {navItems.map(([id, label]) => (
            <button
              className={
                activeSection === id
                  ? "border-b-2 border-blue-900 pb-1 text-blue-900"
                  : "text-slate-500 transition-colors hover:text-blue-800"
              }
              type="button"
              key={id}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={userMenuRef}>
          <button
            className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant/20 bg-surface-container-high"
            type="button"
            onClick={() => setIsUserMenuOpen((current) => !current)}
            aria-expanded={isUserMenuOpen}
            aria-label="Abrir menu do usuario"
          >
            <img alt="User profile avatar" className="h-full w-full object-cover" src={avatarPhoto} />
          </button>

          {isUserMenuOpen ? (
            <div className="absolute right-0 top-12 z-50 w-64 rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-3 shadow-xl shadow-on-surface/10">
              <div className="mb-3 flex items-center gap-3 border-b border-outline-variant/10 pb-3">
                <div className="h-10 w-10 overflow-hidden rounded-full border border-outline-variant/20 bg-surface-container-high">
                  <img alt="User profile avatar" className="h-full w-full object-cover" src={avatarPhoto} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-on-surface">{displayName}</p>
                  <p className="text-xs text-on-surface-variant">Conta ativa</p>
                </div>
              </div>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-error transition-colors hover:bg-error/10"
                type="button"
                onClick={handleLogout}
              >
                <Icon className="text-lg">logout</Icon>
                <span>Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
