import { Alert } from "../Alert";
import { AuthBackground } from "./AuthBackground";
import { AuthBrandPanel } from "./AuthBrandPanel";
import { AuthFooter } from "./AuthFooter";

export function AuthLayout({
  alertMessage = "",
  alertTitle,
  brand,
  children,
  contentClassName = "",
  minHeightClassName = "min-h-[620px]",
  onCloseAlert,
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-auth-background px-4 py-8 text-auth-on-surface">
      {alertMessage ? (
        <Alert title={alertTitle} message={alertMessage} onClose={onCloseAlert} />
      ) : null}

      <AuthBackground />

      <main className="auth-glass-panel relative z-10 flex w-full max-w-[1040px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <AuthBrandPanel {...brand} minHeightClassName={minHeightClassName} />

        <section
          className={`relative flex ${minHeightClassName} w-full flex-col bg-auth-surface-container-low/90 p-7 backdrop-blur-xl sm:p-8 md:w-1/2 md:p-12 ${contentClassName}`}
        >
          {children}
        </section>
      </main>

      <AuthFooter />
    </div>
  );
}
