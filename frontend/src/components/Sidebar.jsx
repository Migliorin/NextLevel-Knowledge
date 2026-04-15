import { Icon } from "./Icon";
import { SidebarNav } from "./SidebarNav";

export function Sidebar({ activeItem = "library", goTo }) {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col space-y-2 bg-slate-100 p-4 font-manrope text-sm md:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="signature-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
          <Icon>auto_stories</Icon>
        </div>
        <div>
          <h2 className="text-lg font-extrabold leading-tight text-blue-900">NextLevel Knowledge</h2>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">PDF Intelligence Workspace</p>
        </div>
      </div>
      <SidebarNav activeItem={activeItem} goTo={goTo} />
      <div className="mt-auto border-t border-slate-200 pt-4">
        <button className="signature-gradient mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-lg shadow-primary/20">
          <Icon className="text-sm">upload_file</Icon>
          Analyze PDF
        </button>
        <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-slate-600 transition-all hover:bg-slate-200/50">
          <Icon>help_outline</Icon>
          <span>Help Center</span>
        </button>
      </div>
    </aside>
  );
}
