import type { Metadata } from "next";
import { ImportWizard } from "./import-wizard";

export const metadata: Metadata = { title: "Carga del Excel" };

export default function ImportPage() {
  return (
    <>
      <h1 className="text-[28px] font-semibold tracking-tight">Carga del Excel</h1>
      <ImportWizard />
    </>
  );
}
