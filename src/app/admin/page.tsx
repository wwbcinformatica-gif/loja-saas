"use client";

import { LogOut, Users, Shield, Store, CheckCircle, XCircle, Search, ArrowLeft, Edit2, X, Phone, Mail, Globe, Plus, Trash2, Key, User, Building, FileText, Eye, EyeOff, Filter } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminPanelCompleto() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [abaSelecionada, setAbaSelecionada] = useState<"usuarios" | "lojas">("usuarios");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativo" | "bloqueado">("todos");
  const [filtroPlano, setFiltroPlano] = useState<"todos" | "free" | "basic" | "pro" | "premium">("todos");

  // Estados dos modais
  const [modalCriarUsuario, setModalCriarUsuario] = useState(false);
  const [modalEditarUsuario, setModalEditarUsuario] = useState<any>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);

  // Dados do formulário
  const [dadosCriacao, setDadosCriacao] = useState({
    email: '',
    password: '',
    nome_loja: '',
    nome_completo: '',
    telefone: '',
    email_contato: '',
    empresa: '',
    cnpj_cpf: '',
    plano: 'pro',
    status: 'ativo',
    valor_mensalidade: 49.90
  });

  const [dadosEdicao, setDadosEdicao] = useState({
    userId: '',
    lojaId: '',
    email: '',
    nova_senha: '',
    nome_loja: '',
    nome_completo: '',
    telefone: '',
    email_contato: '',
    empresa: '',
    cnpj_cpf: '',
    plano: 'pro',
    status: 'ativo',
    valor_mensalidade: 49.90
  });

  useEffect(() => {
    validarAcessoAdmin();
  }, []);

  const validarAcessoAdmin = async () => {
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      
      const isAdmin = user?.email?.toLowerCase() === 'wwbcinformatica@gmail.com';

      if (authErr || !user || !isAdmin) {
        setLoading(false);
        alert(`Acesso negado. Email: ${user?.email || 'não encontrado'}`);
        window.location.href = "/login";
        return;
      }
      
      setUser(user);
      await carregarUsuarios();
      setLoading(false);
    } catch (err) {
      console.error("Erro na validação:", err);
      setLoading(false);
      window.location.href = "/login";
    }
  };

  const carregarUsuarios = async () => {
    try {
      const response = await fetch('/api/admin/usuarios');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro desconhecido');
      }

      setUsuarios(result.usuarios || []);
      console.log(`✅ Carregados ${result.usuarios?.length || 0} usuários`);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      alert("Erro ao carregar usuários: " + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

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

  const criarUsuario = async () => {
    if (!dadosCriacao.email || !dadosCriacao.password || !dadosCriacao.nome_loja) {
      alert('Email, senha e nome da loja são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosCriacao),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro desconhecido');
      }

      await carregarUsuarios();
      setModalCriarUsuario(false);
      setDadosCriacao({
        email: '', password: '', nome_loja: '', nome_completo: '', telefone: '',
        email_contato: '', empresa: '', cnpj_cpf: '', plano: 'pro', status: 'ativo', valor_mensalidade: 49.90
      });
      alert(`✅ ${result.message}`);
      
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      alert(`❌ ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const editarUsuario = async () => {
    if (!dadosEdicao.userId || !dadosEdicao.lojaId) {
      alert('Dados do usuário são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosEdicao),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro desconhecido');
      }

      await carregarUsuarios();
      setModalEditarUsuario(null);
      alert(`✅ ${result.message}`);
      
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
      alert(`❌ ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const deletarUsuario = async (usuario: any) => {
    const nomeExibicao = usuario.loja?.nome || usuario.email;
    
    const confirmacao = confirm(
      `⚠️ ATENÇÃO! Você tem certeza que deseja DELETAR PERMANENTEMENTE o usuário "${nomeExibicao}"?\n\n` +
      `Esta ação irá:\n` +
      `• Remover o usuário do sistema de autenticação\n` +
      `• Deletar a loja e todos os dados relacionados\n` +
      `• Esta ação NÃO PODE ser desfeita!\n\n` +
      `Clique OK para continuar ou Cancelar para desistir.`
    );

    if (!confirmacao) return;

    const confirmacaoFinal = prompt(
      `Por segurança, digite "DELETAR" (em maiúsculas) para confirmar a exclusão do usuário "${nomeExibicao}":`
    );

    if (confirmacaoFinal !== "DELETAR") {
      alert("Operação cancelada. Texto de confirmação incorreto.");
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/usuarios', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: usuario.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro desconhecido');
      }

      await carregarUsuarios();
      alert(`✅ ${result.message}`);
      
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      alert(`❌ ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalEdicao = (usuario: any) => {
    setDadosEdicao({
      userId: usuario.id,
      lojaId: usuario.loja?.id || '',
      email: usuario.email,
      nova_senha: '',
      nome_loja: usuario.loja?.nome || '',
      nome_completo: usuario.loja?.nome_completo || '',
      telefone: usuario.loja?.telefone || '',
      email_contato: usuario.loja?.email || '',
      empresa: usuario.loja?.empresa || '',
      cnpj_cpf: usuario.loja?.cnpj_cpf || '',
      plano: usuario.loja?.plano || 'pro',
      status: usuario.loja?.status || 'ativo',
      valor_mensalidade: usuario.loja?.valor_mensalidade ?? 49.90
    });
    setModalEditarUsuario(usuario);
  };

  const fazerLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Filtros
  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchBusca = !busca || 
      (usuario.email?.toLowerCase().includes(busca.toLowerCase())) ||
      (usuario.loja?.nome?.toLowerCase().includes(busca.toLowerCase())) ||
      (usuario.loja?.nome_completo?.toLowerCase().includes(busca.toLowerCase()));

    const matchStatus = filtroStatus === 'todos' || usuario.loja?.status === filtroStatus;
    const matchPlano = filtroPlano === 'todos' || usuario.loja?.plano === filtroPlano;

    return matchBusca && matchStatus && matchPlano;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-amber-500 font-bold gap-4">
        <Shield className="w-12 h-12 animate-pulse" />
        Carregando Painel Mestre SaaS...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-10 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="bg-amber-500 p-2 rounded-lg shrink-0">
            <Shield className="w-6 h-6 text-zinc-950" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold uppercase tracking-widest leading-none">Painel Mestre <span className="text-amber-500">SaaS</span></h1>
            <p className="text-[10px] md:text-xs text-zinc-400">Gerenciamento Completo de Usuários e Sistema</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between w-full sm:w-auto gap-2 md:gap-4">
          <button 
            onClick={() => setModalCriarUsuario(true)}
            className="flex items-center gap-2 text-xs md:text-sm text-green-500 hover:text-green-400 transition-colors bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20 font-bold"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Novo Lojista</span><span className="sm:hidden">Novo</span>
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 text-xs md:text-sm text-zinc-400 hover:text-white transition-colors bg-zinc-800/50 sm:bg-transparent px-3 py-2 rounded-lg">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden xs:inline">Dashboard</span>
          </Link>
          <button onClick={fazerLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors text-xs md:text-sm font-bold border border-red-500/20 sm:border-0">
            <LogOut className="w-4 h-4" /> <span className="hidden xs:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-zinc-400 font-medium">Total Usuários</p>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-3xl font-bold">{usuarios.length}</h3>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-zinc-400 font-medium">Lojas Ativas</p>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-green-500">{usuarios.filter(u => u.loja?.status === 'ativo').length}</h3>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-zinc-400 font-medium">Lojas Bloqueadas</p>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-3xl font-bold text-red-500">{usuarios.filter(u => u.loja?.status === 'bloqueado').length}</h3>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-zinc-400 font-medium">Cadastros Completos</p>
              <Store className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-3xl font-bold text-amber-500">{usuarios.filter(u => u.loja?.cadastro_completo).length}</h3>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar por email, nome da loja ou responsável..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 pl-12 outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-zinc-100"
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <select 
              value={filtroStatus} 
              onChange={(e) => setFiltroStatus(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">✅ Ativo</option>
              <option value="bloqueado">🚫 Bloqueado</option>
            </select>
            
            <select 
              value={filtroPlano} 
              onChange={(e) => setFiltroPlano(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="todos">Todos os Planos</option>
                      <option value="free">🎁 Gratuito</option>
                      <option value="basic">📦 Basic</option>
                      <option value="pro">🚀 PRO</option>
                      <option value="premium">💎 Premium</option>
            </select>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-zinc-800/50 border-b border-zinc-700">
                <th className="p-4 font-bold text-sm text-zinc-300">Lojista/E-mail</th>
                <th className="p-4 font-bold text-sm text-zinc-300">Loja</th>
                <th className="p-4 font-bold text-sm text-zinc-300">Contato</th>
                <th className="p-4 font-bold text-sm text-zinc-300">Plano & Status</th>
                <th className="p-4 font-bold text-sm text-zinc-300">Cadastro</th>
                <th className="p-4 font-bold text-sm text-zinc-300 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="font-bold text-amber-400">{usuario.email}</p>
                      <p className="text-xs text-zinc-500">ID: {usuario.id.substring(0, 8)}...</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${usuario.email_confirmed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs">{usuario.email_confirmed ? 'Confirmado' : 'Não confirmado'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {usuario.loja ? (
                      <div className="space-y-1">
                        <p className="font-bold">{usuario.loja.nome}</p>
                        <p className="text-xs text-zinc-500">ID: {usuario.loja.id.substring(0, 8)}...</p>
                        <p className="text-xs">{(usuario.loja.valor_mensalidade ?? 49.90) === 0 ? '🎁 Gratuito' : `R$ ${usuario.loja.valor_mensalidade ?? 49.90}/mês`}</p>
                      </div>
                    ) : (
                      <span className="text-red-500 text-xs">Sem loja</span>
                    )}
                  </td>
                  <td className="p-4">
                    {usuario.loja ? (
                      <div className="text-sm space-y-1">
                        {usuario.loja.nome_completo && <p className="font-medium">{usuario.loja.nome_completo}</p>}
                        {usuario.loja.telefone && <p className="text-zinc-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {usuario.loja.telefone}</p>}
                        {usuario.loja.email && <p className="text-zinc-400 flex items-center gap-1"><Mail className="w-3 h-3" /> {usuario.loja.email}</p>}
                        {usuario.loja.empresa && <p className="text-zinc-400 flex items-center gap-1"><Building className="w-3 h-3" /> {usuario.loja.empresa}</p>}
                      </div>
                    ) : (
                      <span className="text-zinc-600 text-xs">Sem dados</span>
                    )}
                  </td>
                  <td className="p-4">
                    {usuario.loja ? (
                      <div className="space-y-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                          usuario.loja.plano === 'premium' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                          usuario.loja.plano === 'pro' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          usuario.loja.plano === 'free' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {usuario.loja.plano === 'premium' ? '💎 Premium' : usuario.loja.plano === 'pro' ? '🚀 PRO' : usuario.loja.plano === 'free' ? '🎁 Gratuito' : '📦 Basic'}
                        </span>
                        <div className="flex items-center gap-2">
                          {usuario.loja.status === 'ativo' ? (
                            <span className="flex items-center gap-1 text-green-500 text-xs">
                              <CheckCircle className="w-3 h-3" /> Ativo
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-500 text-xs">
                              <XCircle className="w-3 h-3" /> Bloqueado
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-600 text-xs">N/A</span>
                    )}
                  </td>
                  <td className="p-4">
                    {usuario.loja ? (
                      <div className="space-y-1">
                        <div className={`w-3 h-3 rounded-full ${usuario.loja.cadastro_completo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs">{usuario.loja.cadastro_completo ? 'Completo' : 'Incompleto'}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-600 text-xs">N/A</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2 flex-wrap">
                      <button 
                        onClick={() => abrirModalEdicao(usuario)}
                        className="px-3 py-2 rounded-lg font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Editar
                      </button>
                      <button 
                        onClick={() => deletarUsuario(usuario)}
                        className="px-3 py-2 rounded-lg font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-all flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500">
                    Nenhum usuário encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-zinc-600 text-xs border-t border-zinc-900 mt-auto">
        LojaSaaS Admin Panel &copy; 2026 - Painel Mestre Completo com CRUD de Usuários.
      </footer>

      {/* Modal Criar Usuário */}
      {modalCriarUsuario && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" /> Cadastrar Novo Lojista
              </h2>
              <button onClick={() => setModalCriarUsuario(false)} className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna 1: Dados de Acesso */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-500 border-b border-zinc-800 pb-2">🔐 Dados de Acesso</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-400">E-mail de Login *</label>
                  <input 
                    type="email" 
                    value={dadosCriacao.email} 
                    onChange={(e) => setDadosCriacao({...dadosCriacao, email: e.target.value})} 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="usuario@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-400">Senha *</label>
                  <div className="relative">
                    <input 
                      type={mostrarSenha ? "text" : "password"}
                      value={dadosCriacao.password} 
                      onChange={(e) => setDadosCriacao({...dadosCriacao, password: e.target.value})} 
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50 pr-12"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-amber-500"
                    >
                      {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-400">Nome da Loja *</label>
                  <input 
                    type="text" 
                    value={dadosCriacao.nome_loja} 
                    onChange={(e) => setDadosCriacao({...dadosCriacao, nome_loja: e.target.value})} 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="Ex: Minha Loja"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Plano</label>
                    <select 
                      value={dadosCriacao.plano} 
                      onChange={(e) => { const v = e.target.value; setDadosCriacao({...dadosCriacao, plano: v, valor_mensalidade: v === 'free' ? 0 : dadosCriacao.valor_mensalidade })} } 
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="free">🎁 Gratuito</option>
                      <option value="basic">📦 Basic</option>
                      <option value="pro">🚀 PRO</option>
                      <option value="premium">💎 Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Status</label>
                    <select 
                      value={dadosCriacao.status} 
                      onChange={(e) => setDadosCriacao({...dadosCriacao, status: e.target.value})} 
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="ativo">✅ Ativo</option>
                      <option value="bloqueado">🚫 Bloqueado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-400">Valor Mensalidade (R$)</label>
                  <input 
                    type="number" 
                    value={dadosCriacao.valor_mensalidade} 
                    onChange={(e) => setDadosCriacao({...dadosCriacao, valor_mensalidade: parseFloat(e.target.value) || 49.90})} 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Coluna 2: Dados da Loja */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-500 border-b border-zinc-800 pb-2">🏪 Dados da Loja</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-400">Nome Completo do Responsável</label>
                  <input 
                    type="text" 
                    value={dadosCriacao.nome_completo} 
                    onChange={(e) => setDadosCriacao({...dadosCriacao, nome_completo: e.target.value})} 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="Nome do responsável"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Telefone/WhatsApp</label>
                    <input 
                      type="text" 
                      value={dadosCriacao.telefone} 
                      onChange={(e) => setDadosCriacao({...dadosCriacao, telefone: formatarTelefone(e.target.value)})} 
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                      placeholder="(00) 0 0000-0000"
                      maxLength={16}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">E-mail de Contato</label>
                    <input 
                      type="email" 
                      value={dadosCriacao.email_contato} 
                      onChange={(e) => setDadosCriacao({...dadosCriacao, email_contato: e.target.value})} 
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                      placeholder="contato@loja.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-400">Nome da Empresa</label>
                  <input 
                    type="text" 
                    value={dadosCriacao.empresa} 
                    onChange={(e) => setDadosCriacao({...dadosCriacao, empresa: e.target.value})} 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="Razão social ou nome fantasia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-400">CNPJ ou CPF</label>
                  <input 
                    type="text" 
                    value={dadosCriacao.cnpj_cpf} 
                    onChange={(e) => setDadosCriacao({...dadosCriacao, cnpj_cpf: formatarCnpjCpf(e.target.value)})} 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="00.000.000/0000-00 ou 000.000.000-00"
                    maxLength={18}
                  />
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-amber-400 text-sm">
                  <p><strong>💡 Dica:</strong></p>
                  <p>• Campos em branco criarão usuário com cadastro incompleto</p>
                  <p>• Usuário será forçado a completar dados antes de usar sistema</p>
                  <p>• Email será confirmado automaticamente pelo admin</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setModalCriarUsuario(false)} 
                className="flex-1 py-3 rounded-lg font-bold text-zinc-400 hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={criarUsuario} 
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Lojista'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Usuário */}
      {modalEditarUsuario && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-500" /> Editar Usuário: {modalEditarUsuario.email}
              </h2>
              <button onClick={() => setModalEditarUsuario(null)} className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna 1: Dados de Acesso */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-500 border-b border-zinc-800 pb-2">🔐 Dados de Acesso</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-400">E-mail de Login</label>
                  <input 
                    type="email" 
                    value={dadosEdicao.email} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, email: e.target.value})} 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-400">Nova Senha (deixe vazio para manter)</label>
                  <div className="relative">
                    <input 
                      type={mostrarNovaSenha ? "text" : "password"}
                      value={dadosEdicao.nova_senha} 
                      onChange={(e) => setDadosEdicao({...dadosEdicao, nova_senha: e.target.value})} 
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50 pr-12"
                      placeholder="Nova senha (opcional)"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-amber-500"
                    >
                      {mostrarNovaSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-400">Nome da Loja</label>
                  <input 
                    type="text" 
                    value={dadosEdicao.nome_loja} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, nome_loja: e.target.value})} 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Plano</label>
                    <select 
                      value={dadosEdicao.plano} 
                      onChange={(e) => { const v = e.target.value; setDadosEdicao({...dadosEdicao, plano: v, valor_mensalidade: v === 'free' ? 0 : dadosEdicao.valor_mensalidade })} } 
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="free">🎁 Gratuito</option>
                      <option value="basic">📦 Basic</option>
                      <option value="pro">🚀 PRO</option>
                      <option value="premium">💎 Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Status</label>
                    <select 
                      value={dadosEdicao.status} 
                      onChange={(e) => setDadosEdicao({...dadosEdicao, status: e.target.value})} 
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="ativo">✅ Ativo</option>
                      <option value="bloqueado">🚫 Bloqueado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-400">Valor Mensalidade (R$)</label>
                  <input 
                    type="number" 
                    value={dadosEdicao.valor_mensalidade} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, valor_mensalidade: parseFloat(e.target.value) || 49.90})} 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Coluna 2: Dados da Loja */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-500 border-b border-zinc-800 pb-2">🏪 Dados da Loja</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-400">Nome Completo do Responsável</label>
                  <input 
                    type="text" 
                    value={dadosEdicao.nome_completo} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, nome_completo: e.target.value})} 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Telefone/WhatsApp</label>
                    <input 
                      type="text" 
                      value={dadosEdicao.telefone} 
                      onChange={(e) => setDadosEdicao({...dadosEdicao, telefone: formatarTelefone(e.target.value)})} 
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                      maxLength={16}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">E-mail de Contato</label>
                    <input 
                      type="email" 
                      value={dadosEdicao.email_contato} 
                      onChange={(e) => setDadosEdicao({...dadosEdicao, email_contato: e.target.value})} 
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-400">Nome da Empresa</label>
                  <input 
                    type="text" 
                    value={dadosEdicao.empresa} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, empresa: e.target.value})} 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-400">CNPJ ou CPF</label>
                  <input 
                    type="text" 
                    value={dadosEdicao.cnpj_cpf} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, cnpj_cpf: formatarCnpjCpf(e.target.value)})} 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    maxLength={18}
                  />
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-blue-400 text-sm">
                  <p><strong>ℹ️ Informações:</strong></p>
                  <p>• Alterações serão aplicadas imediatamente</p>
                  <p>• Cadastro será marcado como completo/incompleto automaticamente</p>
                  <p>• Deixe nova senha vazia para manter a atual</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setModalEditarUsuario(null)} 
                className="flex-1 py-3 rounded-lg font-bold text-zinc-400 hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={editarUsuario} 
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}