import { Icon } from "./Icon";
import { ROUTES } from "../routes";

const sidebarItems = [
  ["library", "folder_open", "Library", ROUTES.dashboard],
  ["chat", "smart_toy", "AI Chat", ROUTES.chat],
];

export function SidebarNav({ activeItem = "library", goTo }) {
  return (
    <nav className="flex-1 space-y-1">
      {sidebarItems.map(([id, icon, label, route]) => {
        const active = activeItem === id;
        return (
        <button
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
            active ? "bg-white font-semibold text-blue-900 shadow-sm" : "text-slate-600 hover:bg-slate-200/50"
          }`}
          type="button"
          onClick={() => goTo?.(route)}
          key={label}
        >
          <Icon>{icon}</Icon>
          <span>{label}</span>
        </button>
        );
      })}
    </nav>
  );
}
