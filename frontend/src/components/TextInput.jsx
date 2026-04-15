import { Icon } from "./Icon";

export function TextInput({ icon, id, label, placeholder, type = "text", helper }) {
  return (
    <div className="space-y-2">
      <label className="ml-1 block text-sm font-semibold text-on-surface-variant" htmlFor={id}>
        {label}
      </label>
      <div className="group relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline transition-colors group-focus-within:text-primary">
          {icon}
        </Icon>
        <input
          className="w-full rounded-full border-0 bg-surface-container-low py-3.5 pl-12 pr-4 text-on-surface placeholder:text-outline/50 transition-all focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/40"
          id={id}
          name={id}
          placeholder={placeholder}
          type={type}
        />
        {type === "password" ? (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface"
            type="button"
            aria-label="Mostrar senha"
          >
            <Icon className="text-lg">visibility</Icon>
          </button>
        ) : null}
      </div>
      {helper ? <p className="px-1 text-[10px] text-outline">{helper}</p> : null}
    </div>
  );
}
