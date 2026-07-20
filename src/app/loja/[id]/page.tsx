import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import LojaContent from "./loja-content";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  const { data: loja } = await supabase
    .from("lojas")
    .select("nome, logo_url")
    .eq("id", id)
    .single();

  const title = loja?.nome || "Loja";
  const description = `Confira os produtos disponíveis na ${loja?.nome || "loja"}`;
  const image = loja?.logo_url || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image && {
        images: [{ url: image, width: 800, height: 800, alt: title }],
      }),
    },
  };
}

export default function LojaPage() {
  return <LojaContent />;
}
