import { useState } from "react";
import { Icon } from "../components/Icon";
import { login, saveAuthTokens } from "../services/auth";
import { ROUTES } from "../routes";

export function LoginPage({ goTo }) {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [rememberSession, setRememberSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateCredential = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const tokens = await login(credentials);
      saveAuthTokens(tokens, rememberSession);
      goTo(ROUTES.dashboard);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setErrorMessage(
        message.toLowerCase().includes("credenciais")
          ? "Email ou senha incorretos. Verifique os dados e tente novamente."
          : message || "Nao foi possivel entrar agora. Tente novamente em alguns instantes.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[10%] -top-[20%] h-[60%] w-[60%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[60%] rounded-full bg-secondary-container/10 blur-[120px]" />
      </div>

      <main className="z-10 w-full max-w-[480px]">
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low">
            <Icon className="text-3xl text-primary" fill>
              auto_stories
            </Icon>
          </div>
          <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tighter text-on-surface">
            Entrar na plataforma
          </h1>
          <p className="tracking-wide text-on-surface-variant">
            Acesse sua conta para continuar a analise dos documentos.
          </p>
        </div>

        <div className="glass-panel rounded-full border border-outline-variant/10 p-8 shadow-2xl shadow-primary/5 md:p-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label
                className="ml-1 block font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                htmlFor="login-email"
              >
                Email
              </label>
              <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-outline">
                  alternate_email
                </Icon>
                <input
                  className="w-full rounded-xl border-none bg-surface-container-low py-4 pl-12 pr-4 text-sm text-on-surface placeholder:text-outline/60 transition-all focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/40"
                  id="login-email"
                  name="email"
                  placeholder="seu@email.com"
                  type="email"
                  value={credentials.email}
                  onChange={updateCredential}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="ml-1 block font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                htmlFor="login-password"
              >
                Senha
              </label>
              <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-outline">
                  lock_open
                </Icon>
                <input
                  className="w-full rounded-xl border-none bg-surface-container-low py-4 pl-12 pr-12 text-sm text-on-surface placeholder:text-outline/60 transition-all focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/40"
                  id="login-password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={updateCredential}
                  autoComplete="current-password"
                  required
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface"
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <Icon className="text-xl">{showPassword ? "visibility_off" : "visibility"}</Icon>
                </button>
              </div>
            </div>

            <div className="ml-1 flex items-center space-x-2">
              <input
                className="h-4 w-4 rounded border-outline-variant bg-surface-container-low text-primary focus:ring-primary"
                id="remember"
                type="checkbox"
                checked={rememberSession}
                onChange={(event) => setRememberSession(event.target.checked)}
              />
              <label className="text-xs font-medium text-on-surface-variant" htmlFor="remember">
                Manter conectado neste dispositivo
              </label>
            </div>

            {errorMessage ? (
              <div className="flex items-start gap-3 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-error" role="alert">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-error/10">
                  <Icon className="text-lg">error</Icon>
                </div>
                <div>
                  <p className="font-headline text-sm font-bold">Nao foi possivel entrar</p>
                  <p className="mt-0.5 text-sm text-on-surface-variant">{errorMessage}</p>
                </div>
              </div>
            ) : null}

            <button
              className="scholar-gradient w-full rounded-full py-4 font-headline text-lg font-bold text-on-primary shadow-lg shadow-primary/20 transition-transform duration-150 hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Ainda nao tem conta?{" "}
          <button
            className="font-semibold text-primary decoration-primary/30 underline-offset-4 hover:underline"
            type="button"
            onClick={() => goTo(ROUTES.register)}
          >
            Criar conta
          </button>
        </p>
      </main>

      <aside className="absolute right-[10%] top-1/2 hidden w-80 -translate-y-1/2 xl:block">
        <div className="rounded-full border border-outline-variant/10 bg-surface-container-lowest/40 p-6 shadow-sm backdrop-blur-md">
          <div className="flex items-start space-x-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-tint/10">
              <Icon className="text-surface-tint">tips_and_updates</Icon>
            </div>
            <div>
              <h4 className="mb-1 font-headline text-sm font-bold text-on-surface">Acesso seguro</h4>
              <p className="text-xs leading-relaxed text-on-surface-variant">
                Use o email e a senha cadastrados para acessar seus PDFs e continuar seus uploads.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
