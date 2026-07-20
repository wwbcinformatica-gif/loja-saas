"use client";

import { Store, User, Lock, ArrowRight, Eye, EyeOff, Mail, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [loadingRecuperar, setLoadingRecuperar] = useState(false);
  const [msgRecuperar, setMsgRecuperar] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("loja_login");
    if (saved) {
      try {
        const { email: savedEmail, password: savedPassword } = JSON.parse(saved);
        setEmail(savedEmail || "");
        setPassword(savedPassword || "");
        setLembrar(true);
      } catch {}
    }

    // Verificar se há erro de callback na URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const confirmado = urlParams.get('confirmado');
    if (error === 'auth_callback_error') {
      setMessage("Erro na confirmação de email. Tente fazer login novamente.");
    }
    if (confirmado === 'true') {
      setMessage("✅ Conta criada com sucesso! Faça login para continuar.");
    }
  }, []);

  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingRecuperar(true);
    setMsgRecuperar("");

    const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperar, {
      redirectTo: `${window.location.origin}/atualizar-senha`,
    });

    if (error) {
      setMsgRecuperar("Erro: " + error.message);
    } else {
      setMsgRecuperar("✅ E-mail de recuperação enviado! Verifique sua caixa de entrada.");
    }
    setLoadingRecuperar(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      setMessage("Erro ao logar: " + error.message);
      setLoading(false);
      return;
    }

    if (lembrar) {
       localStorage.setItem("loja_login", JSON.stringify({ email, password }));
    } else {
       localStorage.removeItem("loja_login");
    }

    setMessage("✅ Login realizado com sucesso! Redirecionando...");
    
    // Redireciona para o painel
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* 3D Floating / Glowing Orbs in the background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-700/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

      {/* Glassmorphism Card */}
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors mb-6 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="bg-zinc-900/30 backdrop-blur-2xl border border-zinc-700/40 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] flex flex-col items-center transform transition-transform hover:scale-[1.01] duration-500">
          
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(245,158,11,0.8)] mb-8 transform -rotate-6 hover:rotate-12 transition-transform duration-500">
            <Store className="w-10 h-10 text-zinc-950" />
          </div>

          <h2 className="text-3xl font-bold text-zinc-50 mb-2">Bem-vindo</h2>
          <p className="text-zinc-400 mb-8 text-center text-sm">Acesse o painel de gestão da sua loja.</p>

          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <User className="h-5 w-5 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="E-mail da loja" 
                className="w-full bg-zinc-950/60 border border-zinc-800 text-zinc-100 text-sm rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 block pl-12 p-4 transition-all outline-none shadow-inner"
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
                placeholder="Sua senha secreta" 
                className="w-full bg-zinc-950/60 border border-zinc-800 text-zinc-100 text-sm rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 block pl-12 pr-12 p-4 transition-all outline-none shadow-inner"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-amber-500 transition-colors"
              >
                {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between w-full pb-2">
              <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
                <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/50 focus:ring-offset-0 cursor-pointer" />
                Lembrar de mim
              </label>
              <button type="button" onClick={() => setMostrarRecuperar(true)} className="text-xs text-amber-500 hover:text-amber-400 hover:underline font-medium transition-colors">Esqueceu a senha?</button>
            </div>

            {message && (
              <div className={`text-sm font-medium text-center p-3 rounded-lg border ${message.includes("Erro") ? "bg-red-950/50 border-red-800 text-red-500" : "bg-zinc-950 border-zinc-800 text-amber-500"}`}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative flex items-center justify-center gap-2 bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-950 font-bold rounded-xl px-4 py-4 shadow-[0_0_15px_rgba(245,158,11,0.5)] transform group-hover:-translate-y-1 active:translate-y-0 transition-all">
                {loading ? "Entrando..." : "Entrar no Painel"}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </form>

          <div className="mt-8 text-sm text-zinc-500">
            Ainda não é parceiro? <Link href="/cadastro" className="text-amber-500 hover:underline font-semibold">Cadastre sua loja</Link>
          </div>
        </div>
      </div>
      {/* Modal Recuperar Senha */}
      {mostrarRecuperar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setMostrarRecuperar(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-100">Recuperar Senha</h2>
              <button onClick={() => setMostrarRecuperar(false)} className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-400 mb-6">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
            <form onSubmit={handleRecuperarSenha} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500" />
                </div>
                <input type="email" value={emailRecuperar} onChange={(e) => setEmailRecuperar(e.target.value)} required placeholder="Seu e-mail"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-xl pl-12 p-4 outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>
              {msgRecuperar && (
                <div className={`text-sm font-medium text-center p-3 rounded-lg border ${msgRecuperar.includes("Erro") ? "bg-red-950/50 border-red-800 text-red-500" : "bg-zinc-950 border-zinc-800 text-amber-500"}`}>
                  {msgRecuperar}
                </div>
              )}
              <button type="submit" disabled={loadingRecuperar}
                className="w-full py-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 transition-all disabled:opacity-50">
                {loadingRecuperar ? "Enviando..." : "Enviar Link de Recuperação"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
