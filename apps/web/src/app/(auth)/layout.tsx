import { Logo } from "@/components/logo";

const FEATURES = [
  "Funciona en el celular, incluso sin señal",
  "Fotos de respaldo con fecha, hora y GPS",
  "Informe en Excel con un clic",
];

/** Phone: a compact brand header so the form is visible right away. Desktop: two halves. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <section className="flex flex-col gap-4 bg-gradient-to-br from-brand-deep via-brand to-[#653a8c] px-6 py-6 text-[#dcdcf3] md:flex-1 md:gap-10 md:px-14 md:py-12">
        <Logo />
        <div className="flex max-w-md flex-col gap-3.5">
          <h1 className="text-xl leading-tight font-semibold tracking-tight text-white md:text-4xl">
            Relevamiento de locales, del Excel al informe.
          </h1>
          <p className="hidden md:block">Cada persona entra con su cuenta y ve solo lo que le toca.</p>
        </div>
        <ul className="hidden max-w-md flex-col gap-3.5 text-[15px] md:flex">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      </section>
      {/* Extra bottom space so the install banner never covers the form. */}
      <section className="flex flex-1 justify-center px-6 pt-8 pb-28 md:items-center md:pt-12">
        <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
      </section>
    </div>
  );
}
