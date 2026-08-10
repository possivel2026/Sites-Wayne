import { ModuleShell } from "@/components/module-shell";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default function ResetPasswordPage() {
  return <ModuleShell active="" eyebrow="SEGURANÇA DA CONTA" title="Redefina sua senha." description="Escolha uma senha nova e exclusiva para proteger sua conta."><ResetPasswordForm /></ModuleShell>;
}
