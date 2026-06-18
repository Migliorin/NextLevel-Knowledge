import { Icon } from "../Icon";

export function AuthSubmitButton({
  disabled = false,
  icon = "arrow_forward",
  isSubmitting = false,
  label,
  loadingLabel,
}) {
  return (
    <button
      className="auth-glow-button group mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-auth-title text-auth-title-md text-auth-on-primary transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      type="submit"
      disabled={disabled || isSubmitting}
    >
      <span>{isSubmitting ? loadingLabel : label}</span>

      <Icon className="text-[20px] transition-transform group-hover:translate-x-1">
        {icon}
      </Icon>
    </button>
  );
}
