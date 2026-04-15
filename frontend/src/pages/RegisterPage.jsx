import { useState } from "react";
import { Icon } from "../components/Icon";
import { libraryPhoto } from "../constants/media";
import { ROUTES } from "../routes";
import { register, saveAuthTokens } from "../services/auth";

export function RegisterPage({ goTo }) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const tokens = await register(formData);
      saveAuthTokens(tokens, true);
      goTo(ROUTES.dashboard);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setErrorMessage(
        message.toLowerCase().includes("email")
          ? "Este email nao esta disponivel. Use outro email para criar sua conta."
          : message || "Nao foi possivel criar sua conta agora. Tente novamente em alguns instantes.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 text-on-surface">
      <div className="absolute inset-0 z-0">
        <div className="absolute left-[-5%] top-[-10%] h-[60%] w-[40%] rounded-full bg-primary-fixed opacity-20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[50%] w-[30%] rounded-full bg-secondary-fixed opacity-20 blur-[100px]" />
      </div>

      <main className="relative z-10 grid w-full max-w-[1100px] overflow-hidden rounded-full bg-surface-container-lowest shadow-2xl shadow-on-surface/5 md:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-surface-container-low p-12 md:flex">
          <div className="relative z-10">
            <div className="mb-16 flex items-center gap-3">
              <div className="signature-gradient flex h-10 w-10 items-center justify-center rounded-xl text-on-primary shadow-lg shadow-primary/20">
                <Icon className="text-2xl">menu_book</Icon>
              </div>
              <span className="font-headline text-xl font-extrabold tracking-tighter text-primary">
                NextLevel Knowledge
              </span>
            </div>
            <h1 className="mb-8 font-headline text-5xl font-extrabold leading-[1.1] tracking-tight text-on-surface">
              Organize seus PDFs e converse com o conhecimento.
            </h1>
            <p className="mb-12 max-w-md text-lg leading-relaxed text-on-surface-variant">
              Crie sua conta para enviar documentos, visualizar arquivos e fazer perguntas com apoio da IA.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["picture_as_pdf", "Upload de PDFs"],
                ["smart_toy", "Chat com IA"],
              ].map(([icon, label]) => (
                <div className="rounded-full border border-outline-variant/10 bg-surface-container-lowest p-4" key={label}>
                  <Icon className="mb-2 text-primary">{icon}</Icon>
                  <p className="text-sm font-semibold text-on-surface">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <img
            alt="Minimalist library workspace"
            className="mt-12 h-48 w-full rounded-full object-cover opacity-80 shadow-sm grayscale-[0.2]"
            src={libraryPhoto}
          />
        </section>

        <section className="flex flex-col justify-center p-8 md:p-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-10">
              <h2 className="mb-2 font-headline text-3xl font-bold text-on-surface">Criar conta</h2>
              <p className="text-sm text-on-surface-variant">
                Informe seus dados para acessar a plataforma.
              </p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label
                  className="ml-1 block font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                  htmlFor="register-name"
                >
                  Nome completo
                </label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-outline">person</Icon>
                  <input
                    className="w-full rounded-xl border-none bg-surface-container-low py-4 pl-12 pr-4 text-sm text-on-surface placeholder:text-outline/60 transition-all focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/40"
                    id="register-name"
                    name="name"
                    placeholder="Joao Silva"
                    type="text"
                    value={formData.name}
                    onChange={updateField}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  className="ml-1 block font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                  htmlFor="register-email"
                >
                  Email
                </label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-outline">mail</Icon>
                  <input
                    className="w-full rounded-xl border-none bg-surface-container-low py-4 pl-12 pr-4 text-sm text-on-surface placeholder:text-outline/60 transition-all focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/40"
                    id="register-email"
                    name="email"
                    placeholder="seu@email.com"
                    type="email"
                    value={formData.email}
                    onChange={updateField}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  className="ml-1 block font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                  htmlFor="register-password"
                >
                  Senha
                </label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-outline">lock</Icon>
                  <input
                    className="w-full rounded-xl border-none bg-surface-container-low py-4 pl-12 pr-12 text-sm text-on-surface placeholder:text-outline/60 transition-all focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/40"
                    id="register-password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={updateField}
                    autoComplete="new-password"
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

              {errorMessage ? (
                <div className="flex items-start gap-3 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-error" role="alert">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-error/10">
                    <Icon className="text-lg">error</Icon>
                  </div>
                  <div>
                    <p className="font-headline text-sm font-bold">Nao foi possivel criar a conta</p>
                    <p className="mt-0.5 text-sm text-on-surface-variant">{errorMessage}</p>
                  </div>
                </div>
              ) : null}

              <button
                className="signature-gradient mt-4 flex w-full items-center justify-center gap-2 rounded-full py-4 font-headline font-bold text-on-primary shadow-xl shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Criando conta..." : "Criar conta"}
                <Icon className="text-xl">arrow_forward</Icon>
              </button>
            </form>

            <p className="mt-12 text-center text-sm font-medium text-on-surface-variant">
              Ja tem uma conta?{" "}
              <button className="ml-1 font-bold text-primary hover:underline" type="button" onClick={() => goTo(ROUTES.login)}>
                Entrar
              </button>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
