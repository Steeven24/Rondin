import type { Metadata } from "next";
import { InstallApp } from "@/components/install-app";
import { LoginForms } from "./login-forms";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-semibold">Iniciar sesión</h2>
        <p className="text-sm text-muted">Te llevaremos a tu panel según tu rol.</p>
      </div>
      <LoginForms />
      <InstallApp />
    </>
  );
}
