import Link from "next/link";
import { Store, HelpCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-50 p-6">
      <div className="flex flex-col items-center text-center space-y-6 max-w-lg">
        {/* Logo Icon */}
        <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.3)]">
          <Store className="w-10 h-10 text-zinc-950" />
        </div>
        
        {/* Texts */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Loja<span className="text-amber-500">SaaS</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          O sistema definitivo para gestão de lojas e serviços. Gerencie seus agendamentos, clientes e produtos em um só lugar.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col w-full sm:flex-row gap-4 pt-8">
          <Link href="/login" className="flex-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold py-3 px-6 rounded-lg transition-colors flex justify-center items-center">
            Sou Lojista (Entrar)
          </Link>
          <Link href="/demo" className="flex-1 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-zinc-300 font-medium py-3 px-6 rounded-lg transition-colors flex justify-center items-center">
            Ver Loja Demo
          </Link>
        </div>

        <Link href="/ajuda" className="mt-8 text-zinc-500 hover:text-amber-500 transition-colors flex items-center gap-2 text-sm font-medium">
          <HelpCircle className="w-4 h-4" /> Ajuda e Tutorial
        </Link>
      </div>
      
      {/* Footer hint */}
      <div className="absolute bottom-8 text-zinc-600 text-sm flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
        Servidor rodando e sendo programado ao vivo...
      </div>
    </main>
  );
}
