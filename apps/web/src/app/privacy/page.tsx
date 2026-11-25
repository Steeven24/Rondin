import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Aviso de privacidad" };

const SECTIONS = [
  {
    title: "Responsable del tratamiento",
    body: "La institución u organización que coordina el relevamiento es responsable de los datos. Rondín es la herramienta con la que se registran.",
  },
  {
    title: "Datos que se tratan",
    body: "De los participantes: nombre, cédula y correo. De los locales visitados: RUC, nombre comercial, propietario, actividad, dirección, teléfono, número de registro anual, observaciones, fotos de la fachada y la ubicación GPS de la visita.",
  },
  {
    title: "Finalidad",
    body: "Organizar las visitas, comprobar que se realizaron y elaborar los informes del relevamiento. Los datos no se usan para otros fines ni se venden o ceden a terceros.",
  },
  {
    title: "Base legal",
    body: "Consentimiento del participante al crear su cuenta y la ejecución de la actividad encargada por la institución, conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador.",
  },
  {
    title: "Quién puede ver los datos",
    body: "Cada persona solo ve lo de su grupo: el miembro, los locales que tiene asignados; el líder, los de su grupo; y la coordinación, todo el relevamiento. Las fotos se guardan en un almacenamiento privado y se muestran con enlaces temporales.",
  },
  {
    title: "Conservación",
    body: "Los datos se conservan mientras dure el relevamiento y la entrega de informes. Al cerrarlo, la coordinación puede eliminar el relevamiento con todos sus locales, visitas y fotos.",
  },
  {
    title: "Tus derechos",
    body: "Puedes pedir acceso, rectificación, eliminación u oposición al tratamiento de tus datos a la coordinación del relevamiento.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      <Link href="/login" className="text-sm text-brand">← Volver</Link>
      <h1 className="text-3xl font-semibold">Aviso de privacidad</h1>
      {SECTIONS.map((section) => (
        <section key={section.title} className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold">{section.title}</h2>
          <p className="text-muted">{section.body}</p>
        </section>
      ))}
    </main>
  );
}
