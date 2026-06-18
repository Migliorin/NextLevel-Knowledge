import { Icon } from "../Icon";

export function DocumentSearch({ onClear, onSearchChange, searchTerm }) {
  return (
    <label className="flex h-11 w-full max-w-sm items-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-4 text-auth-on-surface-variant transition focus-within:border-[#35A9F6]/60 focus-within:ring-2 focus-within:ring-[#35A9F6]/20">
      <Icon className="text-lg text-auth-primary">search</Icon>

      <input
        className="min-w-0 flex-1 border-none bg-transparent p-0 text-sm text-auth-on-surface placeholder:text-auth-on-surface-variant/60 focus:ring-0"
        placeholder="Buscar por nome ou descrição..."
        type="text"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      {searchTerm ? (
        <button
          className="text-auth-on-surface-variant transition hover:text-auth-on-surface"
          type="button"
          onClick={onClear}
          aria-label="Limpar busca"
        >
          <Icon className="text-sm">close</Icon>
        </button>
      ) : null}
    </label>
  );
}
