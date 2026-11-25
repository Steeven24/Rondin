import { Logo } from "@/components/logo";

const FEATURES = [
  "Funciona en el celular, incluso sin señal",
  "Fotos de respaldo con fecha, hora y GPS",
  "Informe en Excel con un clic",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-wrap">
      <section className="flex flex-[1_1_420px] flex-col gap-10 bg-gradient-to-br from-brand-deep via-brand to-[#653a8c] px-8 py-12 text-[#dcdcf3] sm:px-14">
        <Logo />
        <div className="flex max-w-md flex-col gap-3.5">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-white">
            Relevamiento de locales, del Excel al informe.
          </h1>
          <p>Cada persona entra con su cuenta y ve solo lo que le toca.</p>
        </div>
        <ul className="flex max-w-md flex-col gap-3.5 text-[15px]">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-[1_1_420px] items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
      </section>
    </div>
  );
}
