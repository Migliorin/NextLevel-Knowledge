import { Icon } from "../Icon";

const baseInputClassName =
  "w-full rounded-xl border border-auth-outline-variant/40 bg-auth-surface-container-high/40 py-3 font-auth-body text-auth-body-md text-auth-on-surface outline-none placeholder:text-auth-outline-variant/60 transition-all focus:border-auth-primary focus:bg-auth-surface-container-high/60 focus:ring-2 focus:ring-auth-primary/20";

export function AuthFormField({
  children,
  className = "",
  icon = "",
  id,
  inputClassName = "",
  label,
  ...inputProps
}) {
  const hasLeftIcon = Boolean(icon);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        className="font-auth-label text-auth-label-sm text-auth-on-surface-variant"
        htmlFor={id}
      >
        {label}
      </label>

      <div className="relative">
        {hasLeftIcon ? (
          <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-auth-on-surface-variant">
            {icon}
          </Icon>
        ) : null}

        <input
          className={`${baseInputClassName} ${hasLeftIcon ? "pl-12" : "px-4"} ${children ? "pr-12" : "pr-4"} ${inputClassName}`}
          id={id}
          {...inputProps}
        />

        {children}
      </div>
    </div>
  );
}
