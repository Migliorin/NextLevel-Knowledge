import { useState } from "react";
import { AuthFormField } from "../components/auth/AuthFormField";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthSubmitButton } from "../components/auth/AuthSubmitButton";
import { Icon } from "../components/Icon";
import { ROUTES } from "../routes";
import { login, saveAuthTokens } from "../services/auth";

const loginBrand = {
  description: "Plataforma inteligente para automação e análise de relatórios.",
  icon: "auto_stories",
  title: (
    <>
      Next<span className="text-auth-primary">Level</span>
    </>
  ),
  visual: "mesh",
};

const loginFields = [
  {
    autoComplete: "email",
    icon: "alternate_email",
    id: "login-email",
    label: "E-mail",
    name: "email",
    placeholder: "seu@email.com",
    type: "email",
  },
  {
    autoComplete: "current-password",
    icon: "lock",
    id: "login-password",
    label: "Senha",
    name: "password",
    placeholder: "••••••••",
  },
];

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
      goTo(ROUTES.chat);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      setErrorMessage(
        message.toLowerCase().includes("credenciais")
          ? "E-mail ou senha incorretos. Verifique os dados e tente novamente."
          : message || "Não foi possível entrar agora. Tente novamente em alguns instantes.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      alertMessage={errorMessage}
      alertTitle="Não foi possível entrar"
      brand={loginBrand}
      contentClassName="justify-center"
      onCloseAlert={() => setErrorMessage("")}
    >
      <div className="mx-auto w-full max-w-[380px]">
        <div className="mb-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-auth-surface-container-high/50 shadow-inner">
            <Icon className="text-[32px] text-auth-primary" fill>
              auto_stories
            </Icon>
          </div>

          <h2 className="mb-2 font-auth-headline text-auth-headline-lg leading-tight text-auth-on-surface">
            Entrar na plataforma
          </h2>

          <p className="font-auth-body text-auth-body-md leading-relaxed text-auth-on-surface-variant">
            Acesse sua conta para continuar a análise dos documentos.
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {loginFields.map((field) => (
            <AuthFormField
              {...field}
              key={field.id}
              type={field.name === "password" && showPassword ? "text" : field.type || "password"}
              value={credentials[field.name]}
              onChange={updateCredential}
              required
            >
              {field.name === "password" ? (
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-auth-on-surface-variant transition-colors hover:text-auth-primary"
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <Icon className="text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </Icon>
                </button>
              ) : null}
            </AuthFormField>
          ))}

          <div className="flex items-center justify-between gap-4 rounded-xl border border-auth-outline-variant/20 bg-auth-surface-container-high/20 p-4">
            <label className="group flex cursor-pointer items-center gap-2">
              <input
                className="h-4 w-4 rounded border-auth-outline-variant bg-transparent text-auth-primary transition-all focus:ring-auth-primary focus:ring-offset-auth-surface"
                type="checkbox"
                checked={rememberSession}
                onChange={(event) => setRememberSession(event.target.checked)}
              />

              <span className="font-auth-label text-auth-label-sm text-auth-on-surface-variant transition-colors group-hover:text-auth-on-surface">
                Manter conectado
              </span>
            </label>

            <button
              className="font-auth-label text-auth-label-sm text-auth-primary transition-colors hover:text-auth-primary-fixed-dim"
              type="button"
            >
              Esqueceu a senha?
            </button>
          </div>

          <AuthSubmitButton
            isSubmitting={isSubmitting}
            label="Entrar"
            loadingLabel="Entrando..."
          />
        </form>

        <div className="mt-10 text-center">
          <p className="font-auth-body text-auth-body-md text-auth-on-surface-variant">
            Ainda não tem conta?{" "}
            <button
              className="font-semibold text-auth-primary transition-colors hover:text-auth-primary-fixed-dim"
              type="button"
              onClick={() => goTo(ROUTES.register)}
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
