import { Icon } from "../Icon";

export function StatusWidget({ description, icon, label, value }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10 transition hover:border-[#35A9F6]/25 hover:bg-white/[0.065]">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#35A9F6]/60 to-transparent opacity-60" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-auth-on-surface-variant">
            {label}
          </p>

          <p className="mt-3 font-headline text-4xl font-extrabold tracking-tight text-auth-on-surface">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-auth-primary">
          <Icon className="text-xl">{icon}</Icon>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-auth-on-surface-variant">
        {description}
      </p>
    </article>
  );
}
