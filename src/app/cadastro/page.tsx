"use client";

import { User, Lock, ArrowRight, Store, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Cadastro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [nomeLoja, setNomeLoja] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1. Create User in Supabase Auth
      const origin = window.location.origin
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/dashboard`
        }
      });

      if (error) {
        setMessage("Erro: " + error.message);
        setLoading(false);
        return;
      }

      // 2. Se o usuário foi criado, criar a loja
      if (data.user) {
        const { error: lojaError } = await supabase
          .from('lojas')
          .insert({
            owner_id: data.user.id,
            nome: nomeLoja || 'Minha Loja',
            tema: 'dark-gold',
            hora_abertura: 9,
            hora_fechamento: 18,
            status: 'ativo',
            plano: 'pro',
            cadastro_completo: false
          });

        if (lojaError) {
          console.error('Erro ao criar loja:', lojaError);
          // Mesmo com erro na loja, a conta foi criada
          setMessage("✅ Conta criada! Confirme seu email para acessar.");
        } else {
          setMessage("✅ Sucesso! Conta e loja criadas. Confirme seu email para acessar.");
        }
      } else {
        setMessage("✅ Sucesso! Confirme seu email para ativar a conta.");
      }
    } catch (err) {
      console.error('Erro no cadastro:', err);
      setMessage("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* 3D Floating / Glowing Orbs in the background */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-700/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

      {/* Glassmorphism Card */}
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors mb-6 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="bg-zinc-900/30 backdrop-blur-2xl border border-zinc-700/40 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] flex flex-col items-center">
          
          <h2 className="text-3xl font-bold text-zinc-50 mb-2">Nova Loja</h2>
          <p className="text-zinc-400 mb-8 text-center text-sm">Crie sua conta para começar a usar o SaaS.</p>

          <form onSubmit={handleRegister} className="w-full space-y-4">
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Store className="h-5 w-5 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <input 
                type="text" 
                value={nomeLoja}
                onChange={(e) => setNomeLoja(e.target.value)}
                required
                placeholder="Nome da sua loja" 
                className="w-full bg-zinc-950/60 border border-zinc-800 text-zinc-100 text-sm rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 block pl-12 p-4 outline-none"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <User className="h-5 w-5 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="E-mail" 
                className="w-full bg-zinc-950/60 border border-zinc-800 text-zinc-100 text-sm rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 block pl-12 p-4 outline-none"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <input 
                type={mostrarSenha ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Senha (mínimo 6 caracteres)" 
                className="w-full bg-zinc-950/60 border border-zinc-800 text-zinc-100 text-sm rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 block pl-12 pr-12 p-4 outline-none"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-amber-500 transition-colors"
              >
                {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {message && (
              <div className="text-sm font-medium text-center p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-500">
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full relative group mt-4"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative flex items-center justify-center gap-2 bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-950 font-bold rounded-xl px-4 py-4 shadow-[0_0_15px_rgba(245,158,11,0.5)] transform group-hover:-translate-y-1 active:translate-y-0 transition-all">
                {loading ? "Criando..." : "Criar minha Conta"}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </form>

          <div className="mt-8 text-sm text-zinc-500">
            Já tem uma conta? <Link href="/login" className="text-amber-500 hover:underline font-semibold">Fazer login</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
