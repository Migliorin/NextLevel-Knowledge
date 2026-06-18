import { Icon } from "./Icon";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-auth-outline-variant/40 bg-auth-background/75 px-5 py-4 text-auth-on-surface shadow-lg shadow-black/10 backdrop-blur-xl md:px-8">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="group flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#35A9F6]/20 to-[#7D7BF2]/20 text-auth-primary shadow-lg shadow-[#35A9F6]/10 transition group-hover:scale-105">
            <Icon className="text-2xl">auto_awesome</Icon>
          </div>

          <div className="min-w-0">
            <h1 className="truncate font-headline text-lg font-extrabold tracking-tight text-auth-on-surface">
              NextLevel Knowledge
            </h1>
            <p className="hidden truncate text-xs font-medium text-auth-on-surface-variant sm:block">
              Automação e análise de relatórios
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
