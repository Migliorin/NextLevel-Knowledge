import { useState } from "react";
import { AuthFormField } from "../components/auth/AuthFormField";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthSubmitButton } from "../components/auth/AuthSubmitButton";
import { ROUTES } from "../routes";
import { register, saveAuthTokens } from "../services/auth";

const visualBackground =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCDdaKiOQEZuHnIOVKNR1Wy0CV4gU6FMN_37nnMU34qQV3afV87DtUC-yPYIdFYhWVE3mKuJHyBxP8EsyGqTo9M32K5LwwfuBT8lznvbmELtvzHgrIg6weMI7vwLTB2PQfWAv2d-dsF2yLwGmoNEtOpEivcvLkviC9uw_dO3Qv4yvLwWK-EKtY9kjo5K2mb9vz-jurwbAyPjvCi9MGJmQjkjGgeB1vPVr7_YSMMB6wD39POVbak-dAmvo3vH-oz8vqkFXxfiD4Y5fc";

const registerBrand = {
  description: "Automação inteligente para criação de relatórios.",
  icon: "insights",
  imageUrl: visualBackground,
  title: "NextLevel",
  visual: "image",
};

const registerFields = [
  {
    autoComplete: "name",
    id: "register-name",
    label: "Nome completo",
    name: "name",
    placeholder: "Seu nome",
    type: "text",
  },
  {
    autoComplete: "email",
    id: "register-email",
    label: "E-mail",
    name: "email",
    placeholder: "seu@email.com",
    type: "email",
  },
];

const passwordFields = [
  {
    autoComplete: "new-password",
    id: "register-password",
    label: "Senha",
    name: "password",
    placeholder: "••••••••",
    type: "password",
  },
  {
    autoComplete: "new-password",
    id: "register-confirm-password",
    label: "Confirmar senha",
    name: "confirmPassword",
    placeholder: "••••••••",
    type: "password",
  },
];

export function RegisterPage({ goTo }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    const { checked, name, type, value } = event.target;
    setFormData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("As senhas informadas nao conferem.");
      return;
    }

    if (!formData.acceptedTerms) {
      setErrorMessage("Aceite os Termos de Uso e a Politica de Privacidade para continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const tokens = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      saveAuthTokens(tokens, true);
      goTo(ROUTES.chat);
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
    <AuthLayout
      alertMessage={errorMessage}
      alertTitle="Não foi possível criar a conta"
      brand={registerBrand}
      minHeightClassName="min-h-[640px]"
      onCloseAlert={() => setErrorMessage("")}
    >
        <div>
          <h2 className="mb-2 font-auth-headline text-auth-headline-lg leading-tight text-auth-on-surface">
            Criar conta
          </h2>

          <p className="font-auth-body text-auth-body-md text-auth-on-surface-variant">
            Preencha os dados para começar sua jornada.
          </p>
        </div>

        <form className="my-8 flex flex-col gap-5" onSubmit={handleSubmit}>
          {registerFields.map((field) => (
            <AuthFormField
              {...field}
              key={field.id}
              value={formData[field.name]}
              onChange={updateField}
              required
            />
          ))}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {passwordFields.map((field) => (
              <AuthFormField
                {...field}
                key={field.id}
                value={formData[field.name]}
                onChange={updateField}
                required
              />
            ))}
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-auth-outline-variant/20 bg-auth-surface-container-high/20 p-4">
            <input
              className="mt-1 rounded border-auth-outline-variant bg-transparent text-auth-primary focus:ring-auth-primary focus:ring-offset-auth-surface"
              id="terms"
              name="acceptedTerms"
              type="checkbox"
              checked={formData.acceptedTerms}
              onChange={updateField}
            />

            <label
              className="font-auth-label text-auth-label-sm leading-relaxed text-auth-on-surface-variant"
              htmlFor="terms"
            >
              Aceito os Termos de Uso e a Política de Privacidade
            </label>
          </div>

          <AuthSubmitButton
            isSubmitting={isSubmitting}
            label="Criar conta"
            loadingLabel="Criando conta..."
          />
        </form>

        <div className="mt-auto text-center">
          <p className="font-auth-body text-auth-body-md text-auth-on-surface-variant">
            Já tem uma conta?{" "}
            <button
              className="font-semibold text-auth-primary transition-colors hover:text-auth-primary-fixed-dim"
              type="button"
              onClick={() => goTo(ROUTES.login)}
            >
              Entrar
            </button>
          </p>
        </div>
    </AuthLayout>
  );
}
