"use client";

import { Lock, Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AtualizarSenha() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionOk, setSessionOk] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionOk(true);
      }
      setChecking(false);
    });
  }, []);

  const handleAtualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha.length < 6) {
      setMessage("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setMessage("As senhas não conferem.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    if (error) {
      setMessage("Erro: " + error.message);
    } else {
      setMessage("✅ Senha atualizada com sucesso! Você já pode fazer login.");
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-500 font-bold gap-4">
        <Shield className="w-8 h-8 animate-pulse" />
        Verificando...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-700/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-zinc-900/30 backdrop-blur-2xl border border-zinc-700/40 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(245,158,11,0.8)] mb-8">
            <Lock className="w-10 h-10 text-zinc-950" />
          </div>

          <h2 className="text-3xl font-bold text-zinc-50 mb-2">Nova Senha</h2>
          <p className="text-zinc-400 mb-8 text-center text-sm">Defina uma nova senha para sua conta.</p>

          {!sessionOk ? (
            <div className="text-center space-y-4">
              <p className="text-red-400 text-sm">Link inválido ou expirado. Solicite um novo link de recuperação.</p>
              <Link href="/login" className="inline-flex items-center gap-2 text-amber-500 hover:underline font-semibold text-sm">
                <ArrowLeft className="w-4 h-4" /> Voltar para o Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleAtualizar} className="w-full space-y-5">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input type={mostrarSenha ? "text" : "password"} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required minLength={6} placeholder="Nova senha"
                  className="w-full bg-zinc-950/60 border border-zinc-800 text-zinc-100 text-sm rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 block pl-12 pr-12 p-4 transition-all outline-none shadow-inner" />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-amber-500 transition-colors">
                  {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input type={mostrarSenha ? "text" : "password"} value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required minLength={6} placeholder="Confirmar nova senha"
                  className="w-full bg-zinc-950/60 border border-zinc-800 text-zinc-100 text-sm rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 block pl-12 pr-12 p-4 transition-all outline-none shadow-inner" />
              </div>

              {message && (
                <div className={`text-sm font-medium text-center p-3 rounded-lg border ${message.includes("Erro") || message.includes("inválido") ? "bg-red-950/50 border-red-800 text-red-500" : "bg-zinc-950 border-zinc-800 text-amber-500"}`}>
                  {message}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative flex items-center justify-center gap-2 bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-950 font-bold rounded-xl px-4 py-4 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all">
                  {loading ? "Atualizando..." : "Atualizar Senha"}
                </div>
              </button>

              <div className="text-center mt-4">
                <Link href="/login" className="text-sm text-amber-500 hover:underline font-semibold">
                  <ArrowLeft className="w-4 h-4 inline mr-1" /> Voltar para o Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
