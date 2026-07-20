"use client";

import { User, Phone, Mail, Building, FileText, CheckCircle, AlertTriangle, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { verificarCadastroCompleto, validarFormatoCampos } from "@/lib/validacao-cadastro";

interface Props {
  loja: any;
  onCadastroCompleto: () => void;
}

export default function CompletarCadastroObrigatorio({ loja, onCadastroCompleto }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dados, setDados] = useState({
    nome_completo: loja.nome_completo || "",
    telefone: loja.telefone || "",
    email: loja.email || "",
    empresa: loja.empresa || loja.nome || "",
    cnpj_cpf: loja.cnpj_cpf || ""
  });

  const formatarTelefone = (valor: string) => {
    let v = valor.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 10) return `(${v.substring(0, 2)}) ${v.substring(2, 3)} ${v.substring(3, 7)}-${v.substring(7)}`;
    else if (v.length > 6) return `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
    else if (v.length > 2) return `(${v.substring(0, 2)}) ${v.substring(2)}`;
    return v;
  };

  const formatarCnpjCpf = (valor: string) => {
    let v = valor.replace(/\D/g, "");
    if (v.length <= 11) {
      // CPF: 000.000.000-00
      if (v.length > 9) return `${v.substring(0, 3)}.${v.substring(3, 6)}.${v.substring(6, 9)}-${v.substring(9)}`;
      else if (v.length > 6) return `${v.substring(0, 3)}.${v.substring(3, 6)}.${v.substring(6)}`;
      else if (v.length > 3) return `${v.substring(0, 3)}.${v.substring(3)}`;
    } else {
      // CNPJ: 00.000.000/0000-00
      if (v.length > 14) v = v.substring(0, 14);
      if (v.length > 12) return `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5, 8)}/${v.substring(8, 12)}-${v.substring(12)}`;
      else if (v.length > 8) return `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5, 8)}/${v.substring(8)}`;
      else if (v.length > 5) return `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5)}`;
      else if (v.length > 2) return `${v.substring(0, 2)}.${v.substring(2)}`;
    }
    return v;
  };

  const validarCampos = () => {
    const { completo, camposFaltando } = verificarCadastroCompleto(dados);
    const { valido, erros } = validarFormatoCampos(dados);

    if (!completo) {
      setMessage(`❌ Preencha todos os campos obrigatórios: ${camposFaltando.join(', ')}`);
      return false;
    }

    if (!valido) {
      setMessage(`❌ ${erros.join('. ')}`);
      return false;
    }

    return true;
  };

  const salvarCadastro = async () => {
    if (!validarCampos()) return;

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from('lojas')
        .update({
          ...dados,
          cadastro_completo: true
        })
        .eq('id', loja.id);

      if (error) {
        throw new Error(error.message);
      }

      setMessage("✅ Cadastro completado com sucesso!");
      setTimeout(() => {
        onCadastroCompleto();
      }, 1500);

    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage(`❌ Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const fazerLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const { camposFaltando } = verificarCadastroCompleto(dados);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-700/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-red-500/40 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(239,68,68,0.3)]">
          
          {/* Header de Alerta */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(239,68,68,0.8)] mb-6 mx-auto">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-red-500 mb-4">⚠️ CADASTRO OBRIGATÓRIO</h1>
            <div className="bg-red-950/50 border border-red-500/30 rounded-xl p-4 text-red-300">
              <p className="font-bold mb-2">🚫 Acesso Bloqueado ao Sistema</p>
              <p className="text-sm">
                Para usar todas as funcionalidades e poder ter seus dados deletados com segurança, 
                você deve <strong>completar seu cadastro</strong> com todas as informações obrigatórias.
              </p>
            </div>
          </div>

          {/* Progresso */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-400">Progresso do Cadastro</span>
              <span className="text-sm font-bold text-amber-500">
                {5 - camposFaltando.length}/5 completos
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((5 - camposFaltando.length) / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Formulário */}
          <div className="space-y-6">
            
            {/* Nome Completo */}
            <div className="relative group">
              <label className="block text-sm font-medium mb-2 text-zinc-400">
                Nome Completo do Responsável *
                {camposFaltando.includes('nome_completo') && <span className="text-red-500 ml-2">⚠️ Obrigatório</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <User className={`h-5 w-5 ${camposFaltando.includes('nome_completo') ? 'text-red-500' : 'text-amber-500'} transition-colors`} />
                </div>
                <input 
                  type="text" 
                  value={dados.nome_completo}
                  onChange={(e) => setDados({...dados, nome_completo: e.target.value})}
                  placeholder="Seu nome completo"
                  className={`w-full bg-zinc-950/60 border text-zinc-100 text-sm rounded-xl focus:ring-2 block pl-12 p-4 outline-none transition-all ${
                    camposFaltando.includes('nome_completo') 
                      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                      : 'border-zinc-800 focus:ring-amber-500/50 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Telefone */}
              <div className="relative group">
                <label className="block text-sm font-medium mb-2 text-zinc-400">
                  Telefone/WhatsApp *
                  {camposFaltando.includes('telefone') && <span className="text-red-500 ml-2">⚠️ Obrigatório</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Phone className={`h-5 w-5 ${camposFaltando.includes('telefone') ? 'text-red-500' : 'text-amber-500'} transition-colors`} />
                  </div>
                  <input 
                    type="text" 
                    value={dados.telefone}
                    onChange={(e) => setDados({...dados, telefone: formatarTelefone(e.target.value)})}
                    placeholder="(00) 0 0000-0000"
                    maxLength={16}
                    className={`w-full bg-zinc-950/60 border text-zinc-100 text-sm rounded-xl focus:ring-2 block pl-12 p-4 outline-none transition-all ${
                      camposFaltando.includes('telefone') 
                        ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                        : 'border-zinc-800 focus:ring-amber-500/50 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="relative group">
                <label className="block text-sm font-medium mb-2 text-zinc-400">
                  E-mail de Contato *
                  {camposFaltando.includes('email') && <span className="text-red-500 ml-2">⚠️ Obrigatório</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Mail className={`h-5 w-5 ${camposFaltando.includes('email') ? 'text-red-500' : 'text-amber-500'} transition-colors`} />
                  </div>
                  <input 
                    type="email" 
                    value={dados.email}
                    onChange={(e) => setDados({...dados, email: e.target.value})}
                    placeholder="seu@email.com"
                    className={`w-full bg-zinc-950/60 border text-zinc-100 text-sm rounded-xl focus:ring-2 block pl-12 p-4 outline-none transition-all ${
                      camposFaltando.includes('email') 
                        ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                        : 'border-zinc-800 focus:ring-amber-500/50 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Nome da Empresa */}
            <div className="relative group">
              <label className="block text-sm font-medium mb-2 text-zinc-400">
                Nome da Empresa *
                {camposFaltando.includes('empresa') && <span className="text-red-500 ml-2">⚠️ Obrigatório</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Building className={`h-5 w-5 ${camposFaltando.includes('empresa') ? 'text-red-500' : 'text-amber-500'} transition-colors`} />
                </div>
                <input 
                  type="text" 
                  value={dados.empresa}
                  onChange={(e) => setDados({...dados, empresa: e.target.value})}
                  placeholder="Razão social ou nome fantasia"
                  className={`w-full bg-zinc-950/60 border text-zinc-100 text-sm rounded-xl focus:ring-2 block pl-12 p-4 outline-none transition-all ${
                    camposFaltando.includes('empresa') 
                      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                      : 'border-zinc-800 focus:ring-amber-500/50 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>

            {/* CNPJ/CPF */}
            <div className="relative group">
              <label className="block text-sm font-medium mb-2 text-zinc-400">
                CNPJ ou CPF *
                {camposFaltando.includes('cnpj_cpf') && <span className="text-red-500 ml-2">⚠️ Obrigatório</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FileText className={`h-5 w-5 ${camposFaltando.includes('cnpj_cpf') ? 'text-red-500' : 'text-amber-500'} transition-colors`} />
                </div>
                <input 
                  type="text" 
                  value={dados.cnpj_cpf}
                  onChange={(e) => setDados({...dados, cnpj_cpf: formatarCnpjCpf(e.target.value)})}
                  placeholder="00.000.000/0000-00 ou 000.000.000-00"
                  maxLength={18}
                  className={`w-full bg-zinc-950/60 border text-zinc-100 text-sm rounded-xl focus:ring-2 block pl-12 p-4 outline-none transition-all ${
                    camposFaltando.includes('cnpj_cpf') 
                      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                      : 'border-zinc-800 focus:ring-amber-500/50 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Mensagem */}
          {message && (
            <div className={`mt-6 text-sm font-medium text-center p-4 rounded-xl border ${
              message.includes('❌') 
                ? 'bg-red-950/50 border-red-500/30 text-red-400' 
                : 'bg-green-950/50 border-green-500/30 text-green-400'
            }`}>
              {message}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4 mt-8">
            <button 
              onClick={fazerLogout}
              className="flex-1 py-4 rounded-xl font-bold text-zinc-400 hover:bg-zinc-800/50 transition-colors border border-zinc-800"
            >
              Sair e Voltar Depois
            </button>
            <button 
              onClick={salvarCadastro}
              disabled={loading || camposFaltando.length > 0}
              className="flex-1 relative group"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-300 ${
                camposFaltando.length === 0 ? 'from-green-400 to-green-600' : 'from-gray-400 to-gray-600'
              }`}></div>
              <div className={`relative flex items-center justify-center gap-2 font-bold rounded-xl px-4 py-4 shadow-lg transform group-hover:-translate-y-1 active:translate-y-0 transition-all ${
                camposFaltando.length === 0 
                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' 
                  : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
              }`}>
                {loading ? (
                  "Salvando..."
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {camposFaltando.length === 0 ? "Completar Cadastro" : `Faltam ${camposFaltando.length} campos`}
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-400 text-sm">
            <p><strong>📋 Por que é obrigatório?</strong></p>
            <p>• Garantir segurança na deleção de dados</p>
            <p>• Cumprir requisitos de identificação</p>
            <p>• Oferecer suporte personalizado</p>
            <p>• Manter qualidade do serviço</p>
          </div>
        </div>
      </div>
    </div>
  );
}