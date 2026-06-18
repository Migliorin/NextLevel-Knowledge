import { ROUTES } from "../routes";
import { Icon } from "./Icon";

const sidebarItems = [
  ["chat", "smart_toy", "Chat IA", ROUTES.chat],
  ["library", "folder_open", "Biblioteca", ROUTES.dashboard],
];

export function SidebarNav({ activeItem = "library", goTo }) {
  return (
    <nav className="flex-1 space-y-1">
      {sidebarItems.map(([id, icon, label, route]) => {
        const active = activeItem === id;
        return (
          <button
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
              active
                ? "border-[#35A9F6]/35 bg-[#35A9F6]/10 font-semibold text-auth-on-surface shadow-lg shadow-[#35A9F6]/10"
                : "border-transparent text-auth-on-surface-variant hover:border-white/10 hover:bg-white/[0.05] hover:text-auth-on-surface"
            }`}
            type="button"
            onClick={() => goTo?.(route)}
            key={label}
          >
            <Icon className={active ? "text-auth-primary" : "text-auth-on-surface-variant"}>
              {icon}
            </Icon>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
