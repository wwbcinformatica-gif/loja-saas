"use client";

import { CheckCircle, ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ConfirmacaoEmail() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Confirmando seu email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            ✅ Email Confirmado!
          </h1>
          
          <p className="text-zinc-400 mb-6">
            Sua conta foi criada com sucesso. Agora você pode acessar nossa loja virtual e fazer seus agendamentos.
          </p>

          <div className="space-y-3">
            <Link 
              href="/login"
              className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-4 rounded-xl transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              Fazer Login
            </Link>
            
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              <Home className="w-5 h-5" />
              Voltar para Início
            </Link>
          </div>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-4">
          📧 Verifique sua caixa de entrada se precisar de mais alguma coisa
        </p>
      </div>
    </div>
  );
}