"use client";

import { LogOut, Calendar, CalendarDays, Users, Settings, Plus, Edit2, Trash2, Scissors, Clock, LayoutDashboard, UserCircle, X, TrendingUp, DollarSign, Briefcase, Eye, EyeOff, Shield, XCircle, Menu, Printer, ShoppingBag, HelpCircle, ClipboardList, FileText, RotateCcw, ArrowLeft, Package, Minus, ShoppingCart, Search, CreditCard, Trash, MinusCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [isMenuAberto, setIsMenuAberto] = useState(false);
  const [mostrarDetalhesClientes, setMostrarDetalhesClientes] = useState(false);
  const [mostrarDetalhesHoje, setMostrarDetalhesHoje] = useState(false);
  const [mostrarDetalhesPedidos, setMostrarDetalhesPedidos] = useState(false);
  const [mostrarDetalhesMes, setMostrarDetalhesMes] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loja, setLoja] = useState<any>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [mostrarReceita, setMostrarReceita] = useState(true);
  
   // Estados para Agendamento
    const [funcionarios, setFuncionarios] = useState<any[]>([]);
   const [agendamentos, setAgendamentos] = useState<any[]>([]);
   const [modalHora, setModalHora] = useState<string | null>(null);
   const [clienteSelecionado, setClienteSelecionado] = useState<string>("");
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<string>("");
  const [servicoSelecionado, setServicoSelecionado] = useState<string>("");
  const [dataAgenda, setDataAgenda] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dataEdicao, setDataEdicao] = useState<string>("");
  const [horaEdicao, setHoraEdicao] = useState<string>("");
  const [visualizacaoAgenda, setVisualizacaoAgenda] = useState<"dia" | "mes">("dia");

  // Estados para Modal
  const [modalCliente, setModalCliente] = useState<{ id?: string, nome: string, telefone: string, fromDevolucao?: boolean, email?: string, cpf?: string, cep?: string, estado?: string, endereco?: string, cidade?: string, bairro?: string, data_nascimento?: string, observacoes?: string } | null>(null);
  const [modalFuncionario, setModalFuncionario] = useState<{ id?: string, nome: string, telefone?: string, email?: string, endereco?: string, cidade?: string, bairro?: string, estado?: string, cep?: string, observacoes?: string, funcao?: string } | null>(null);

   // Serviços e Modal de Serviço
   const [servicos, setServicos] = useState<any[]>([]);
   const [modalServico, setModalServico] = useState<{ id?: string, nome: string, preco: number, duracao: number } | null>(null);
   const [modalEdicaoAgendamento, setModalEdicaoAgendamento] = useState<any>(null);
   const [uploadingLogo, setUploadingLogo] = useState(false);
   const [pagando, setPagando] = useState(false);

// Produtos
    const [produtos, setProdutos] = useState<any[]>([]);
    const [modalProduto, setModalProduto] = useState<{ id?: string, nome: string, preco: number, estoque: number, imagem_url?: string, categoria?: string, codigo_auto?: string, codigo_lojista?: string, codigo_barras?: string, unidade?: string, som_produto?: boolean, variacoes?: Array<{ ml: string, preco: number, estoque: number }> } | null>(null);
    const [uploadingProduto, setUploadingProduto] = useState(false);
    const [modalEstoque, setModalEstoque] = useState<{ produtoId: string, nome: string, quantidade: number, tipo: 'entrada' | 'saida' } | null>(null);
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [ordens, setOrdens] = useState<any[]>([]);
    const [orcamentos, setOrcamentos] = useState<any[]>([]);
    const [devolucoes, setDevolucoes] = useState<any[]>([]);
    const [modalOrdem, setModalOrdem] = useState<any>(null);
    const [modalOrcamento, setModalOrcamento] = useState<any>(null);
    const [modalDevolucao, setModalDevolucao] = useState<{ id?: string, produto_nome: string, cliente_nome: string, cliente_telefone: string, motivo: string, observacao: string, data_recolhimento: string, prazo_resolucao: number, tipo_resolucao: string, status: string, mensagem_lojista: string } | null>(null);
    const [vendasAprazo, setVendasAprazo] = useState<any[]>([]);
    const [modalVenda, setModalVenda] = useState<{ id?: string, cliente_nome: string, cliente_telefone: string, valor_total: number, valor_entrada: number, numero_parcelas: number, dias_intervalo: number | 'custom', dias_intervalo_custom?: number, data_primeiro_vencimento?: string, customizar_datas?: boolean, observacao: string, parcelas: Array<{ numero: number, valor: number, data_vencimento: string, data_pagamento: string | null, pago: boolean }>, desconto_percentual?: number, desconto_valor?: number, itens?: Array<{ nome: string, quantidade: number, preco: number, _sugerindo?: boolean }>, servicos?: Array<{ nome: string, valor: number, _sugerindo?: boolean }> } | null>(null);
    const [modalBuscaCliente, setModalBuscaCliente] = useState<{ onSelect: (c: any) => void; termo?: string } | null>(null);

// Frente de Caixa (PDV)
    const [pdvCarrinho, setPdvCarrinho] = useState<any[]>([]);
    const [pdvBusca, setPdvBusca] = useState('');
    const [pdvPagamento, setPdvPagamento] = useState('dinheiro');
    const [pdvProcessando, setPdvProcessando] = useState(false);
    const [pdvClienteNome, setPdvClienteNome] = useState('');
    const [pdvDescontoPercentual, setPdvDescontoPercentual] = useState(0);
    const [pdvDescontoValor, setPdvDescontoValor] = useState(0);
    const [pdvDinheiroRecebido, setPdvDinheiroRecebido] = useState(0);
    const [pdvVendasHoje, setPdvVendasHoje] = useState<any[]>([]);
    const [pdvUltimaVenda, setPdvUltimaVenda] = useState<any>(null);
    const [pdvAba, setPdvAba] = useState<'vender' | 'vendas'>('vender');
    const [pdvVendedorId, setPdvVendedorId] = useState<string>('');
    const pdvVendedorNome = useMemo(() => {
      if (!pdvVendedorId) return '';
      const func = funcionarios.find(f => f.id === pdvVendedorId);
      return func?.nome || '';
    }, [pdvVendedorId, funcionarios]);
    const pdvSubtotal = useMemo(() => pdvCarrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0), [pdvCarrinho]);
    const pdvTotal = useMemo(() => {
      let total = pdvSubtotal;
      if (pdvDescontoPercentual > 0) total -= total * (pdvDescontoPercentual / 100);
      if (pdvDescontoValor > 0) total -= pdvDescontoValor;
      return Math.max(0, total);
    }, [pdvSubtotal, pdvDescontoPercentual, pdvDescontoValor]);
    const pdvTroco = useMemo(() => pdvPagamento === 'dinheiro' ? Math.max(0, pdvDinheiroRecebido - pdvTotal) : 0, [pdvDinheiroRecebido, pdvTotal, pdvPagamento]);
    const pdvProdutosFiltrados = useMemo(() => {
      if (!pdvBusca.trim()) return [];
      const termo = pdvBusca.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return produtos.filter(p => {
        if (p.estoque <= 0) return false;
        const nome = (p.nome || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const codAuto = (p.codigo_auto || '').toLowerCase();
        const codLoj = (p.codigo_lojista || '').toLowerCase();
        const codBar = (p.codigo_barras || '').toLowerCase();
        return nome.includes(termo) || codAuto.includes(termo) || codLoj.includes(termo) || codBar.includes(termo);
      });
    }, [pdvBusca, produtos]);
    // Computed totals para Ordem de Serviço e Orçamento
    const ordemSubtotal = useMemo(() => {
      const itens = modalOrdem?.itens || [];
      const servicos = modalOrdem?.servicos || [];
      return itens.reduce((s: number, i: any) => s + (i.quantidade || 1) * (i.preco || 0), 0)
           + servicos.reduce((s: number, sv: any) => s + (sv.valor || 0), 0);
    }, [modalOrdem?.itens, modalOrdem?.servicos]);
    const ordemTotal = useMemo(() => {
      let total = ordemSubtotal;
      if (modalOrdem?.desconto_percentual > 0) total -= total * (modalOrdem.desconto_percentual / 100);
      if (modalOrdem?.desconto_valor > 0) total -= modalOrdem.desconto_valor;
      return Math.max(0, total);
    }, [ordemSubtotal, modalOrdem?.desconto_percentual, modalOrdem?.desconto_valor]);
    const orcSubtotal = useMemo(() => {
      const itens = modalOrcamento?.itens || [];
      const servicos = modalOrcamento?.servicos || [];
      return itens.reduce((s: number, i: any) => s + (i.quantidade || 1) * (i.preco || 0), 0)
           + servicos.reduce((s: number, sv: any) => s + (sv.valor || 0), 0);
    }, [modalOrcamento?.itens, modalOrcamento?.servicos]);
    const orcTotal = useMemo(() => {
      let total = orcSubtotal;
      if (modalOrcamento?.desconto_percentual > 0) total -= total * (modalOrcamento.desconto_percentual / 100);
      if (modalOrcamento?.desconto_valor > 0) total -= modalOrcamento.desconto_valor;
      return Math.max(0, total);
    }, [orcSubtotal, modalOrcamento?.desconto_percentual, modalOrcamento?.desconto_valor]);

    // Auto-cálculo do valor_total em Vendas a Prazo quando itens/serviços mudam
    useEffect(() => {
      if (modalVenda) {
        const sub = (modalVenda.itens || []).reduce((s: number, i: any) => s + (i.quantidade || 1) * (i.preco || 0), 0)
                 + (modalVenda.servicos || []).reduce((s: number, sv: any) => s + (sv.valor || 0), 0);
        if (sub > 0) {
          let total = sub;
          if (modalVenda.desconto_percentual) total -= total * (modalVenda.desconto_percentual / 100);
          if (modalVenda.desconto_valor) total -= modalVenda.desconto_valor;
          setModalVenda(v => v ? { ...v, valor_total: Math.max(0, total) } : v);
        }
      }
    }, [modalVenda?.itens, modalVenda?.servicos, modalVenda?.desconto_percentual, modalVenda?.desconto_valor]);

  const enviarNotificacaoWhatsApp = async (telefone: string, mensagem: string) => {
    try {
      await fetch('/api/notificacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefone, mensagem })
      });
    } catch (err) {
      console.error('Erro ao enviar notificação:', err);
    }
  };

  const carregarVariacoesProduto = async (produtoId: string) => {
    const { data: variacoes } = await supabase
      .from("produto_variacoes")
      .select("*")
      .eq("produto_id", produtoId);
    return variacoes || [];
  };

  const tocarNotificacao = (tipo = 'ding') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const volumeBase = (loja as any)?.volume_som || 0.5;
      const tocarTom = (freq: number, tipoOsc: OscillatorType, volume: number, inicio: number, duracao: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = tipoOsc;
        gain.gain.setValueAtTime(volume * volumeBase, inicio);
        gain.gain.exponentialRampToValueAtTime(0.001, inicio + duracao);
        osc.start(inicio);
        osc.stop(inicio + duracao);
      };
      switch(tipo) {
        case 'ding':
          tocarTom(880, "sine", 0.3, ctx.currentTime, 0.4);
          break;
        case 'tum':
          tocarTom(150, "sine", 0.4, ctx.currentTime, 0.6);
          break;
        case 'double':
          tocarTom(440, "triangle", 0.3, ctx.currentTime, 0.3);
          tocarTom(660, "triangle", 0.3, ctx.currentTime + 0.2, 0.3);
          break;
        case 'pop':
          tocarTom(600, "sine", 0.2, ctx.currentTime, 0.12);
          break;
        case 'boom':
          tocarTom(80, "sine", 0.5, ctx.currentTime, 0.8);
          break;
        case 'thud':
          tocarTom(100, "triangle", 0.35, ctx.currentTime, 0.15);
          break;
        case 'bass':
          tocarTom(60, "sine", 0.45, ctx.currentTime, 0.5);
          break;
        case 'knock':
          tocarTom(120, "sine", 0.3, ctx.currentTime, 0.1);
          tocarTom(120, "sine", 0.3, ctx.currentTime + 0.15, 0.1);
          break;
        case 'deep':
          tocarTom(50, "sine", 0.6, ctx.currentTime, 0.7);
          break;
        case 'clap':
          tocarTom(200, "square", 0.25, ctx.currentTime, 0.08);
          tocarTom(180, "square", 0.25, ctx.currentTime + 0.1, 0.08);
          tocarTom(160, "square", 0.25, ctx.currentTime + 0.2, 0.08);
          break;
        case 'hit':
          tocarTom(80, "triangle", 0.5, ctx.currentTime, 0.1);
          break;
        case 'tap':
          tocarTom(300, "sine", 0.2, ctx.currentTime, 0.05);
          break;
        case 'cello':
          tocarTom(220, "sawtooth", 0.2, ctx.currentTime, 0.3);
          tocarTom(165, "sawtooth", 0.2, ctx.currentTime + 0.15, 0.4);
          break;
        case 'viola':
          tocarTom(196, "triangle", 0.25, ctx.currentTime, 0.2);
          tocarTom(147, "triangle", 0.2, ctx.currentTime + 0.2, 0.25);
          break;
        case 'pluck':
          tocarTom(800, "sine", 0.15, ctx.currentTime, 0.03);
          tocarTom(1200, "sine", 0.1, ctx.currentTime + 0.05, 0.02);
          break;
        case 'chime':
          tocarTom(1047, "sine", 0.2, ctx.currentTime, 0.4);
          tocarTom(1319, "sine", 0.15, ctx.currentTime + 0.1, 0.3);
          break;
        default:
          tocarTom(880, "sine", 0.3, ctx.currentTime, 0.4);
      }
    } catch {}
  };

  const carregarPedidos = async () => {
    if (!loja) return;
    const { data: novosPedidos } = await supabase
      .from("pedidos")
      .select("*")
      .eq("loja_id", loja.id)
      .order("created_at", { ascending: false });
    if (novosPedidos) {
      const novoPrimeiro = novosPedidos[0]?.created_at;
      const antigoPrimeiro = pedidos[0]?.created_at;
      if ((loja as any)?.notificacao_sonora && novoPrimeiro && antigoPrimeiro && novoPrimeiro !== antigoPrimeiro) {
        tocarNotificacao((loja as any)?.som_pedido || 'ding');
      }
      setPedidos(novosPedidos);
    }
  };

  useEffect(() => {
    if (!loja) return;
    const intervalo = setInterval(carregarPedidos, 15000);
    return () => clearInterval(intervalo);
  }, [loja?.id, pedidos.length]);

  useEffect(() => {
    carregarDadosIniciais();

    // ================= REALTIME SUBSCRIPTION =================
    // Ouve mudanças na tabela de agendamentos em tempo real
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agendamentos' },
        (payload) => {
          console.log('Mudança detectada no banco!', payload);
          if (payload.eventType === 'INSERT' && (loja as any).som_agendamento_ativo) {
            tocarNotificacao((loja as any).som_agendamento || 'ding');
          }
          // Recarrega apenas os agendamentos para manter a tela atualizada
          recarregarAgendamentos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loja?.id]);

  // Global click sound on buttons
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if ((loja as any)?.som_clique_ativo && target.closest('button')) {
        tocarNotificacao((loja as any).som_clique || 'tap');
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [loja]);

  const recarregarAgendamentos = async () => {
    if (!loja) return;
    const { data: agData } = await supabase
      .from("agendamentos")
      .select("*, clientes(nome)")
      .eq("loja_id", loja.id);
    setAgendamentos(agData || []);
  };

  const carregarDadosIniciais = async () => {
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      let { data: lojaData } = await supabase.from("lojas").select("*").eq("owner_id", user.id).single();
      
      if (!lojaData) {
        const dataExpira = new Date();
        dataExpira.setDate(dataExpira.getDate() + 14);
        const { data: novaLoja } = await supabase.from("lojas").insert({ 
          owner_id: user.id, nome: "Minha Loja", tema: "dark-gold", hora_abertura: 9, hora_fechamento: 18,
          status: 'ativo', expira_em: dataExpira.toISOString(), plano: 'pro', valor_mensalidade: 49.90
        }).select().single();
        lojaData = novaLoja;
      }
      setLoja(lojaData);

      if (lojaData) {
        // Clientes
        const { data: clientesData } = await supabase.from("clientes").select("*").eq("loja_id", lojaData.id).order("created_at", { ascending: false });
        setClientes(clientesData || []);

        // Barbeiros
        const { data: funcionariosData } = await supabase.from("funcionarios").select("*").eq("loja_id", lojaData.id);
        if (funcionariosData && funcionariosData.length === 0) {
          const { data: novoBarbeiro } = await supabase.from("funcionarios").insert({ loja_id: lojaData.id, nome: "Funcionário Padrão" }).select().single();
          if (novoBarbeiro) setFuncionarios([novoBarbeiro]);
        } else {
          setFuncionarios(funcionariosData || []);
        }

        // Agendamentos
        const { data: agData } = await supabase.from("agendamentos").select("*, clientes(nome)").eq("loja_id", lojaData.id);
        setAgendamentos(agData || []);

        // Serviços Reais
        const { data: servData } = await supabase.from("servicos").select("*").eq("loja_id", lojaData.id);
        setServicos(servData || []);

// Produtos
        const { data: prodData } = await supabase.from("produtos").select("*").eq("loja_id", lojaData.id);
        setProdutos(prodData || []);

// Pedidos
        const { data: pedidosData } = await supabase.from("pedidos").select("*").eq("loja_id", lojaData.id).order("created_at", { ascending: false });
        setPedidos(pedidosData || []);

        // Ordens de Serviço
        const { data: ordensData } = await supabase.from("ordens_servico").select("*").eq("loja_id", lojaData.id).order("created_at", { ascending: false });
        setOrdens((ordensData || []).map((o: any) => {
          if (o.total == null || o.total === 0) {
            const subItens = (o.itens || []).reduce((s: number, i: any) => s + (i.quantidade || 1) * (i.preco || 0), 0);
            const subServ = (o.servicos || []).reduce((s: number, sv: any) => s + (sv.valor || 0), 0);
            let calc = subItens + subServ;
            if (o.desconto_percentual > 0) calc -= calc * (o.desconto_percentual / 100);
            if (o.desconto_valor > 0) calc -= o.desconto_valor;
            return { ...o, total: Math.max(0, calc) };
          }
          return o;
        }));

        // Orçamentos
        const { data: orcamentosData } = await supabase.from("orcamentos").select("*").eq("loja_id", lojaData.id).order("created_at", { ascending: false });
        setOrcamentos((orcamentosData || []).map((o: any) => {
          if (o.total == null || o.total === 0) {
            const subItens = (o.itens || []).reduce((s: number, i: any) => s + (i.quantidade || 1) * (i.preco || 0), 0);
            const subServ = (o.servicos || []).reduce((s: number, sv: any) => s + (sv.valor || 0), 0);
            let calc = subItens + subServ;
            if (o.desconto_percentual > 0) calc -= calc * (o.desconto_percentual / 100);
            if (o.desconto_valor > 0) calc -= o.desconto_valor;
            return { ...o, total: Math.max(0, calc) };
          }
          return o;
        }));

        // Devoluções
        const { data: devolucoesData } = await supabase.from("devolucoes").select("*").eq("loja_id", lojaData.id).order("created_at", { ascending: false });
        setDevolucoes(devolucoesData || []);
        // Vendas a Prazo
        const { data: vendasData } = await supabase.from("vendas_aprazo").select("*, venda_parcelas(*)").eq("loja_id", lojaData.id).order("created_at", { ascending: false });
        setVendasAprazo(vendasData || []);
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // ===================== CRUD CLIENTES =====================
  const formatarPreco = (valor: string) => {
    let v = valor.replace(/\D/g, "");
    if (v === "") return "";
    v = (parseInt(v) / 100).toFixed(2).replace(".", ",");
    return v;
  };

  const formatarTelefone = (valor: string) => {
    let v = valor.replace(/\D/g, ""); 
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 10) return `(${v.substring(0,2)}) ${v.substring(2,3)} ${v.substring(3,7)}-${v.substring(7)}`;
    else if (v.length > 6) return `(${v.substring(0,2)}) ${v.substring(2,6)}-${v.substring(6)}`;
    else if (v.length > 2) return `(${v.substring(0,2)}) ${v.substring(2)}`;
    else if (v.length > 0) return `(${v}`;
    return v;
  };

  const salvarCliente = async () => {
    if (!modalCliente?.nome || !modalCliente?.telefone) {
      alert("Por favor, preencha o Nome e o Celular. Ambos são obrigatórios!");
      return;
    }
    
    if(loja) {
      const camposBasicos = { nome: modalCliente.nome, telefone: modalCliente.telefone };
      const camposExtras = {
        email: modalCliente.email || null,
        cpf: modalCliente.cpf || null,
        cep: modalCliente.cep || null,
        estado: modalCliente.estado || null,
        endereco: modalCliente.endereco || null,
        cidade: modalCliente.cidade || null,
        bairro: modalCliente.bairro || null,
        data_nascimento: modalCliente.data_nascimento || null,
        observacoes: modalCliente.observacoes || null
      };

      if (modalCliente.id) {
        const { error: erroBasico } = await supabase.from("clientes").update(camposBasicos).eq("id", modalCliente.id);
        
        if (!erroBasico) {
          try {
            await supabase.from("clientes").update(camposExtras).eq("id", modalCliente.id);
          } catch (e) { console.log("Campos extras não existem ainda"); }
          
          const clienteAtualizado = { ...clientes.find(c => c.id === modalCliente.id), ...camposBasicos, ...camposExtras };
          setClientes(clientes.map(c => c.id === modalCliente.id ? clienteAtualizado : c));
          if (modalCliente?.fromDevolucao && modalDevolucao) {
            setModalDevolucao({ ...modalDevolucao, cliente_nome: modalCliente.nome, cliente_telefone: modalCliente.telefone });
          }
          setModalCliente(null);
        } else {
          alert("Erro ao editar: " + (erroBasico?.message || "Erro desconhecido"));
        }
      } else {
        const { data: novoCliente, error: erroInsert } = await supabase.from("clientes").insert({ loja_id: loja.id, ...camposBasicos }).select().single();
        
        if (!erroInsert && novoCliente) {
          try {
            await supabase.from("clientes").update(camposExtras).eq("id", novoCliente.id);
          } catch (e) { console.log("Campos extras não existem ainda"); }
          
          setClientes([novoCliente, ...clientes]);
          if (modalCliente?.fromDevolucao && modalDevolucao) {
            setModalDevolucao({ ...modalDevolucao, cliente_nome: novoCliente.nome, cliente_telefone: novoCliente.telefone });
          }
          if ((loja as any).som_cliente_ativo) tocarNotificacao((loja as any).som_cliente || 'ding');
          setModalCliente(null);
        } else {
          alert("Erro ao salvar cliente: " + (erroInsert?.message || "Erro desconhecido"));
        }
      }
    }
  };

  const excluirCliente = async (id: string) => {
    if(confirm("Tem certeza que deseja excluir este cliente?")) {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (!error) setClientes(clientes.filter(c => c.id !== id));
    }
  };

// ===================== CRUD FUNCIONARIOS =====================
        const salvarFuncionario = async () => {
      if (!modalFuncionario?.nome) {
        alert("O nome do funcionário é obrigatório!");
        return;
      }
      
      if(loja) {
        const dados = {
          nome: modalFuncionario.nome,
          telefone: modalFuncionario.telefone || null,
          email: modalFuncionario.email || null,
          endereco: modalFuncionario.endereco || null,
          cidade: modalFuncionario.cidade || null,
          bairro: modalFuncionario.bairro || null,
          estado: modalFuncionario.estado || null,
          cep: modalFuncionario.cep || null,
          observacoes: modalFuncionario.observacoes || null,
          funcao: modalFuncionario.funcao || null
        };
        if (modalFuncionario.id) {
          const { error } = await supabase.from("funcionarios").update(dados).eq("id", modalFuncionario.id);
          if (!error) {
            setFuncionarios(funcionarios.map(f => f.id === modalFuncionario.id ? { ...f, ...dados } : f));
            setModalFuncionario(null);
          } else {
            alert("Erro ao editar: " + (error?.message || "Erro desconhecido"));
          }
        } else {
          const { data: novoF, error } = await supabase.from("funcionarios").insert({ loja_id: loja.id, ...dados }).select().single();
          if (!error && novoF) {
            setFuncionarios([...funcionarios, novoF]);
            setModalFuncionario(null);
            if ((loja as any).som_funcionario_ativo) tocarNotificacao((loja as any).som_funcionario || 'pop');
          } else {
            alert("Erro ao salvar funcionário: " + (error?.message || "Erro desconhecido"));
          }
        }
      }
    };

   const excluirFuncionario = async (id: string) => {
     if(confirm("Excluir este funcionário? Ele será removido da agenda.")) {
        const { error } = await supabase.from("funcionarios").delete().eq("id", id);
       if (!error) {
          setFuncionarios(funcionarios.filter(f => f.id !== id));
        } else {
          alert("Erro ao excluir funcionário: " + (error?.message || "Erro desconhecido"));
       }
     }
   };

  // ===================== CRUD SERVIÇOS =====================
  const salvarServico = async () => {
    if (!modalServico?.nome || !modalServico?.preco || !modalServico?.duracao) {
      alert("Preencha Nome, Preço e Duração.");
      return;
    }

    if (loja) {
      if (modalServico.id) {
        const { error } = await supabase.from("servicos").update({ 
          nome: modalServico.nome, preco: modalServico.preco, duracao: modalServico.duracao 
        }).eq("id", modalServico.id);
        if (!error) {
          setServicos(servicos.map(s => s.id === modalServico.id ? { ...s, nome: modalServico.nome, preco: modalServico.preco, duracao: modalServico.duracao } : s));
          setModalServico(null);
        } else {
          alert("Erro ao atualizar serviço: " + (error?.message || "Erro desconhecido"));
        }
      } else {
        const { data: novoS, error } = await supabase.from("servicos").insert({ 
          loja_id: loja.id, nome: modalServico.nome, preco: modalServico.preco, duracao: modalServico.duracao 
        }).select().single();
        if (!error && novoS) {
          setServicos([...servicos, novoS]);
          setModalServico(null);
          if ((loja as any).som_servico_ativo) tocarNotificacao((loja as any).som_servico || 'pop');
        } else {
          alert("Erro ao cadastrar serviço: " + (error?.message || "Erro desconhecido"));
        }
      }
    }
  };

  const excluirServico = async (id: string) => {
    if (confirm("Excluir este serviço do catálogo?")) {
      const { error } = await supabase.from("servicos").delete().eq("id", id);
      if (!error) {
        setServicos(servicos.filter(s => s.id !== id));
      } else {
        alert("Erro ao excluir serviço: " + (error?.message || "Erro desconhecido"));
      }
    }
  };

  // ===================== AGENDAMENTOS =====================
  const confirmarAgendamento = async () => {
    if (!clienteSelecionado || !funcionarioSelecionado || !servicoSelecionado || !modalHora || !loja) {
      alert("Preencha todos os campos: Cliente, Profissional e Serviço.");
      return;
    }
    const [ano, mes, dia] = dataAgenda.split('-').map(Number);
    const [h, m] = modalHora.split(":").map(Number);
    const dataFake = new Date(ano, mes - 1, dia, h, m, 0, 0);

      const { data: novoAgendamento, error } = await supabase.from("agendamentos").insert({
        loja_id: loja.id,
        funcionario_id: funcionarioSelecionado,
        cliente_id: clienteSelecionado,
        data_hora: dataFake.toISOString(),
        servico: servicoSelecionado
      }).select("*, clientes(nome,telefone)").single();

    if (!error && novoAgendamento) {
      const cliente = novoAgendamento.clientes;
      const servicoNome = servicos.find(s => s.id === servicoSelecionado)?.nome || 'Serviço';
      
      if (cliente?.telefone) {
        const dataFormatada = new Date(dataFake).toLocaleDateString('pt-BR');
        const horaFormatada = new Date(dataFake).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const mensagem = `✅ *Agendamento Confirmado*\n\nOlá ${cliente.nome}!\nSeu horário foi confirmado.\n\n📅 *Serviço:* ${servicoNome}\n🕐 *Data:* ${dataFormatada} às ${horaFormatada}\n🏪 *Loja:* ${loja.nome}\n\nAguardamos você!`;
        enviarNotificacaoWhatsApp(cliente.telefone, mensagem);
      }
      
      setAgendamentos([...agendamentos, novoAgendamento]);
       setModalHora(null);
       setClienteSelecionado("");
       setFuncionarioSelecionado("");
       setServicoSelecionado("");
    } else {
      alert("Erro ao agendar: " + (error?.message || "Erro desconhecido"));
    }
  };

  const salvarAgendamentoEditado = async () => {
    if (!modalEdicaoAgendamento || !loja) return;
    const novaDataHora = new Date(dataEdicao || modalEdicaoAgendamento.data_hora.split('T')[0]);
    const [h, m] = (horaEdicao || new Date(modalEdicaoAgendamento.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })).split(":");
    novaDataHora.setHours(parseInt(h), parseInt(m), 0, 0);

      const { error } = await supabase.from("agendamentos").update({
        funcionario_id: funcionarioSelecionado || modalEdicaoAgendamento.funcionario_id,
        servico: servicoSelecionado || modalEdicaoAgendamento.servico,
        data_hora: novaDataHora.toISOString()
      }).eq("id", modalEdicaoAgendamento.id);
    
    if (!error) {
       setAgendamentos(agendamentos.map(a => a.id === modalEdicaoAgendamento.id ? { 
         ...a, 
        funcionario_id: funcionarioSelecionado || modalEdicaoAgendamento.funcionario_id,
         servico: servicoSelecionado || modalEdicaoAgendamento.servico,
         data_hora: novaDataHora.toISOString()
       } : a));
       setModalEdicaoAgendamento(null);
       setFuncionarioSelecionado("");
       setServicoSelecionado("");
       setDataEdicao("");
       setHoraEdicao("");
    } else {
      alert("Erro ao atualizar agendamento: " + error.message);
    }
  };

  const excluirAgendamento = async (id: string) => {
    if(confirm("Cancelar este agendamento?")) {
      const { error } = await supabase.from("agendamentos").delete().eq("id", id);
      if (!error) setAgendamentos(agendamentos.filter(a => a.id !== id));
    }
  };

// ===================== CRUD PRODUTOS =====================
  const salvarProduto = async () => {
    if (!modalProduto?.nome) {
      alert("Preencha o Nome do produto.");
      return;
    }
    const temVariacoes = modalProduto.variacoes && modalProduto.variacoes.some(v => v.ml && v.ml.trim() !== "");
    if (!temVariacoes && !modalProduto?.preco) {
      alert("Preencha o Preço ou adicione Variações.");
      return;
    }
    if (loja) {
      const codigoAuto = modalProduto.codigo_auto || String(produtos.length + 1).padStart(4, '0');
      if (modalProduto.id) {
        const { error } = await supabase.from("produtos").update({ 
          nome: modalProduto.nome, preco: modalProduto.preco, estoque: modalProduto.estoque, imagem_url: modalProduto.imagem_url,
          categoria: modalProduto.categoria || '', unidade: modalProduto.unidade || 'UN',
          codigo_auto: modalProduto.codigo_auto || null, codigo_lojista: modalProduto.codigo_lojista || null, codigo_barras: modalProduto.codigo_barras || null
        }).eq("id", modalProduto.id);
        if (!error) {
          await supabase.from("produto_variacoes").delete().eq("produto_id", modalProduto.id);
          if (modalProduto.variacoes && modalProduto.variacoes.length > 0) {
            const variacoesParaSalvar = modalProduto.variacoes
              .filter(v => v.ml && v.ml.trim() !== "")
              .map(v => ({
                produto_id: modalProduto.id,
                ml: v.ml,
                preco: v.preco,
                estoque: v.estoque || 0
              }));
            if (variacoesParaSalvar.length > 0) {
              await supabase.from("produto_variacoes").insert(variacoesParaSalvar);
            }
          }
          const { data: prodAtualizado } = await supabase.from("produtos").select("*").eq("id", modalProduto.id).single();
          if (prodAtualizado) setProdutos(produtos.map(p => p.id === modalProduto.id ? prodAtualizado : p));
          setModalProduto(null);
        }
      } else {
        const { data: novoP, error } = await supabase.from("produtos").insert({ 
          loja_id: loja.id, nome: modalProduto.nome, preco: modalProduto.preco, estoque: modalProduto.estoque || 0, imagem_url: modalProduto.imagem_url,
          categoria: modalProduto.categoria || '', unidade: modalProduto.unidade || 'UN',
          codigo_auto: codigoAuto, codigo_lojista: modalProduto.codigo_lojista || null, codigo_barras: modalProduto.codigo_barras || null
        }).select().single();
        if (!error && novoP) {
          if (modalProduto.variacoes && modalProduto.variacoes.length > 0) {
            const variacoesParaSalvar = modalProduto.variacoes
              .filter(v => v.ml && v.ml.trim() !== "")
              .map(v => ({
                produto_id: novoP.id,
                ml: v.ml,
                preco: v.preco,
                estoque: v.estoque || 0
              }));
            if (variacoesParaSalvar.length > 0) {
              await supabase.from("produto_variacoes").insert(variacoesParaSalvar);
            }
          }
          setProdutos([...produtos, novoP]);
          setModalProduto(null);
          if ((loja as any).som_produto_ativo) tocarNotificacao((loja as any).som_produto || 'pop');
        } else {
          alert("Erro ao salvar produto. Verifique se a tabela 'produtos' existe no seu banco.");
        }
      }
    }
  };

  const handleUploadFotoProduto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingProduto(true);
      const file = e.target.files?.[0];
      if (!file || !loja || !modalProduto) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `prod-${loja.id}-${Date.now()}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('produtos') 
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error(uploadError.message || 'Erro ao fazer upload');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('produtos')
        .getPublicUrl(fileName);

      setModalProduto({ ...modalProduto, imagem_url: publicUrl });
    } catch (error: any) {
      console.error('Erro completo:', error);
      alert("Erro no upload: " + (error.message || 'Verifique se o bucket existe'));
    } finally {
      setUploadingProduto(false);
    }
  };

  const excluirProduto = async (id: string) => {
    if (confirm("Remover este produto do estoque?")) {
      await supabase.from("produto_variacoes").delete().eq("produto_id", id);
      const { error } = await supabase.from("produtos").delete().eq("id", id);
      if (!error) setProdutos(produtos.filter(p => p.id !== id));
    }
  };

  const ajustarEstoque = async () => {
    if (!modalEstoque || modalEstoque.quantidade < 1) return;
    const produto = produtos.find(p => p.id === modalEstoque.produtoId);
    if (!produto) return;
    const delta = modalEstoque.tipo === 'entrada' ? modalEstoque.quantidade : -modalEstoque.quantidade;
    const novoEstoque = Math.max(0, (produto.estoque || 0) + delta);
    const { error } = await supabase.from("produtos").update({ estoque: novoEstoque }).eq("id", modalEstoque.produtoId);
    if (!error) {
      setProdutos(produtos.map(p => p.id === modalEstoque.produtoId ? { ...p, estoque: novoEstoque } : p));
      setModalEstoque(null);
    }
  };

  // ===================== FRENTE DE CAIXA (PDV) =====================

  const adicionarAoCarrinho = (produto: any) => {
    setPdvCarrinho(prev => {
      const existente = prev.find(item => item.id === produto.id);
      if (existente) {
        return prev.map(item => item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item);
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  const alterarQtdCarrinho = (idx: number, delta: number) => {
    setPdvCarrinho(prev => {
      const novo = [...prev];
      const item = { ...novo[idx] };
      item.quantidade = Math.max(1, item.quantidade + delta);
      novo[idx] = item;
      return novo;
    });
  };

  const removerDoCarrinho = (idx: number) => {
    setPdvCarrinho(prev => prev.filter((_, i) => i !== idx));
  };

  const carregarVendasHoje = async () => {
    if (!loja) return;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .eq("loja_id", loja.id)
      .gte("created_at", hoje.toISOString())
      .order("created_at", { ascending: false });
    if (data) setPdvVendasHoje(data);
  };

  const finalizarVendaPDV = async () => {
    if (pdvCarrinho.length === 0) { alert("Adicione produtos ao carrinho."); return; }
    setPdvProcessando(true);
    try {
      // 1. Registrar pedido
      const { data: pedido, error: errPedido } = await supabase.from("pedidos").insert({
        loja_id: loja.id,
        cliente_nome: pdvClienteNome.trim() || "Balcão",
        cliente_telefone: "",
        vendedor_nome: pdvVendedorNome || null,
        total: pdvTotal,
        desconto: (pdvDescontoPercentual > 0 || pdvDescontoValor > 0) ? pdvDescontoValor : null,
        desconto_percentual: pdvDescontoPercentual > 0 ? pdvDescontoPercentual : null,
        status: "pago",
        forma_pagamento: pdvPagamento,
        itens: pdvCarrinho.map((item: any) => ({
          produto_id: item.id,
          nome: item.nome,
          preco: item.preco,
          quantidade: item.quantidade,
          codigo_auto: item.codigo_auto || null,
          codigo_lojista: item.codigo_lojista || null
        })),
        created_at: new Date().toISOString()
      }).select().single();

      if (errPedido) throw errPedido;

      // 2. Baixar estoque
      for (const item of pdvCarrinho) {
        await supabase.from("produtos").update({
          estoque: Math.max(0, (item.estoque || 0) - item.quantidade)
        }).eq("id", item.id);
      }

      // 3. Recarregar produtos
      const { data: prodAtualizados } = await supabase.from("produtos").select("*").eq("loja_id", loja.id);
      if (prodAtualizados) setProdutos(prodAtualizados);

      // 4. Guardar última venda para impressão
      setPdvUltimaVenda({ ...pedido, carrinho: pdvCarrinho, desconto_valor: pdvDescontoValor, desconto_percentual: pdvDescontoPercentual, cliente_nome: pdvClienteNome.trim() || "Balcão", vendedor_nome: pdvVendedorNome });

      // 5. Limpar carrinho
      setPdvCarrinho([]);
      setPdvBusca('');
      setPdvDescontoPercentual(0);
      setPdvDescontoValor(0);
      setPdvDinheiroRecebido(0);
      setPdvClienteNome('');

      // 6. Recarregar vendas do dia
      await carregarVendasHoje();

      if ((loja as any).som_produto_ativo) tocarNotificacao((loja as any).som_produto || 'pop');

      // 7. Perguntar se quer imprimir
      if (confirm(`✅ Venda finalizada! Total: ${f(pdvTotal)}\n\nDeseja imprimir o cupom?`)) {
        imprimirCupomPDV(pedido);
      }
    } catch (err: any) {
      alert("Erro ao finalizar venda: " + err.message);
    } finally {
      setPdvProcessando(false);
    }
  };

  const cancelarVendaPDV = async (venda: any) => {
    if (!confirm(`Tem certeza que deseja CANCELAR esta venda de ${f(venda.total)}?\n\nO estoque será estornado.`)) return;
    try {
      // 1. Reverter estoque
      const itens = venda.itens || [];
      for (const item of itens) {
        const qtd = item.quantidade || 1;
        const { data: prod } = await supabase.from("produtos").select("estoque").eq("id", item.produto_id).single();
        if (prod) {
          await supabase.from("produtos").update({
            estoque: (prod.estoque || 0) + qtd
          }).eq("id", item.produto_id);
        }
      }

      // 2. Marcar pedido como cancelado
      await supabase.from("pedidos").update({ status: "cancelado" }).eq("id", venda.id);

      // 3. Recarregar
      const { data: prodAtualizados } = await supabase.from("produtos").select("*").eq("loja_id", loja.id);
      if (prodAtualizados) setProdutos(prodAtualizados);
      await carregarVendasHoje();

      alert("Venda cancelada e estoque estornado.");
    } catch (err: any) {
      alert("Erro ao cancelar venda: " + err.message);
    }
  };

  const imprimirCupomPDV = (venda: any, formato: 'a4' | 'termico' = 'termico') => {
    const lojaNome = loja?.nome || "Loja";
    const data = new Date(venda.created_at || new Date()).toLocaleString('pt-BR');
    const itens = venda.itens || venda.carrinho || [];
    const cliente = venda.cliente_nome || "Balcão";
    const vendedor = venda.vendedor_nome || '';
    const pagamento = venda.forma_pagamento || pdvPagamento;
    const total = venda.total || 0;
    const descPercentual = venda.desconto_percentual || 0;
    const descValor = venda.desconto_valor || venda.desconto || 0;

    const labelPag: Record<string, string> = {
      dinheiro: "Dinheiro", credito: "Cartão Crédito", debito: "Cartão Débito", pix: "PIX", outro: "Outro"
    };

    const linhasItens = itens.map((item: any) => {
      const qtd = item.quantidade || 1;
      const preco = item.preco || 0;
      const nome = item.nome || "Produto";
      if (formato === 'termico') {
        return `${nome}\n${qtd}x ${f(preco)}${' '.repeat(10)}${f(preco * qtd)}`;
      }
      return `<tr><td style="padding:4px 8px">${qtd}x</td><td style="padding:4px 8px">${nome}</td><td style="padding:4px 8px;text-align:right">${f(preco)}</td><td style="padding:4px 8px;text-align:right">${f(preco * qtd)}</td></tr>`;
    }).join(formato === 'termico' ? '\n' : '');

    const estiloTermico = `
      @page { margin: 0; size: 80mm auto; }
      body { font-family: 'Courier New', monospace; font-size: 12px; width: 72mm; margin: 0 auto; padding: 4mm 0; color: #000; }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .line { border-top: 1px dashed #000; margin: 4px 0; }
      .item { display: flex; justify-content: space-between; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 2px 0; }
      .total { font-size: 16px; font-weight: bold; }
      @media print { body { color: #000 !important; } }
    `;

    const estiloA4 = `
      @page { margin: 15mm; size: A4; }
      body { font-family: Arial, sans-serif; font-size: 14px; color: #333; }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .line { border-top: 2px solid #333; margin: 8px 0; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; }
      th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
      th { background: #f5f5f5; }
      .total { font-size: 20px; font-weight: bold; }
      .footer { margin-top: 24px; text-align: center; font-size: 12px; color: #666; }
    `;

    const htmlTermico = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Cupom</title><style>${estiloTermico}</style></head><body>
<div class="center bold" style="font-size:16px">${lojaNome}</div>
<div class="center">${loja.site || ''}</div>
<div class="line"></div>
<p>${data}</p>
<p>Cliente: ${cliente}</p>
<p>Pagamento: ${labelPag[pagamento] || pagamento}</p>
${vendedor ? `<p>Vendedor: ${vendedor}</p>` : ''}
<div class="line"></div>
${linhasItens}
<div class="line"></div>
${descPercentual > 0 ? `<p>Desconto (${descPercentual}%): -${f(total * descPercentual / 100)}</p>` : ''}
${descValor > 0 ? `<p>Desconto: -${f(descValor)}</p>` : ''}
<p class="total">TOTAL: ${f(total)}</p>
<div class="line"></div>
${pagamento === 'dinheiro' && pdvTroco > 0 ? `<p>Troco: ${f(pdvTroco)}</p>` : ''}
<div class="center">Obrigado pela preferência!</div>
</body></html>`;

    const htmlA4 = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Cupom Fiscal</title><style>${estiloA4}</style></head><body>
<div class="center bold" style="font-size:22px">${lojaNome}</div>
<div class="center">${loja.site || ''} | ${loja.telefone || ''}</div>
<div class="line"></div>
<p><strong>Data:</strong> ${data}</p>
<p><strong>Cliente:</strong> ${cliente}</p>
<p><strong>Pagamento:</strong> ${labelPag[pagamento] || pagamento}</p>
${vendedor ? `<p><strong>Vendedor:</strong> ${vendedor}</p>` : ''}
<div class="line"></div>
<table><thead><tr><th>Qtd</th><th>Produto</th><th>Valor Un.</th><th>Subtotal</th></tr></thead><tbody>
${linhasItens}
</tbody></table>
${descPercentual > 0 ? `<p style="text-align:right"><strong>Desconto (${descPercentual}%):</strong> -${f(total * descPercentual / 100)}</p>` : ''}
${descValor > 0 ? `<p style="text-align:right"><strong>Desconto:</strong> -${f(descValor)}</p>` : ''}
<p style="text-align:right;font-size:20px"><strong>TOTAL: ${f(total)}</strong></p>
${pagamento === 'dinheiro' && pdvTroco > 0 ? `<p style="text-align:right"><strong>Troco:</strong> ${f(pdvTroco)}</p>` : ''}
<div class="line"></div>
<div class="footer">Obrigado pela preferência!<br/>Emissão: ${new Date().toLocaleString('pt-BR')}</div>
</body></html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(formato === 'termico' ? htmlTermico : htmlA4);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  };

  // Carregar vendas do dia ao entrar na aba
  useEffect(() => {
    if (activeTab === "frente_caixa") {
      carregarVendasHoje();
    }
  }, [activeTab]);

  // ===================== VENDAS A PRAZO =====================

  const salvarVenda = async () => {
    if (!modalVenda?.cliente_nome || modalVenda.numero_parcelas < 1) { alert("Preencha o nome e pelo menos 1 parcela."); return; }
    try {
      const restante = modalVenda.valor_total - (modalVenda.valor_entrada || 0);
      const valorParcela = restante / modalVenda.numero_parcelas;

      let parcelas;
      if (modalVenda.customizar_datas && modalVenda.parcelas && modalVenda.parcelas.length > 0) {
        parcelas = modalVenda.parcelas;
      } else if (modalVenda.dias_intervalo === 'custom' && modalVenda.data_primeiro_vencimento) {
        const dataPrimeira = new Date(modalVenda.data_primeiro_vencimento);
        const diasIntervalo = modalVenda.dias_intervalo_custom || 30;
        parcelas = Array.from({ length: modalVenda.numero_parcelas }, (_, i) => {
          const venc = new Date(dataPrimeira);
          venc.setDate(venc.getDate() + i * diasIntervalo);
          return { numero: i + 1, valor: valorParcela, data_vencimento: venc.toISOString().split('T')[0], pago: false };
        });
      } else {
        const intervaloDias = typeof modalVenda.dias_intervalo === 'number' ? modalVenda.dias_intervalo : (parseInt(modalVenda.dias_intervalo as any) || 30);
        parcelas = Array.from({ length: modalVenda.numero_parcelas }, (_, i) => {
          const venc = new Date();
          venc.setDate(venc.getDate() + (i + 1) * intervaloDias);
          return { numero: i + 1, valor: valorParcela, data_vencimento: venc.toISOString().split('T')[0], pago: false };
        });
      }

      if (modalVenda.id) {
        const { error } = await supabase.from("vendas_aprazo").update({ cliente_nome: modalVenda.cliente_nome, cliente_telefone: modalVenda.cliente_telefone, valor_total: modalVenda.valor_total, valor_entrada: modalVenda.valor_entrada || 0, numero_parcelas: modalVenda.numero_parcelas, dias_intervalo: typeof modalVenda.dias_intervalo === 'number' ? modalVenda.dias_intervalo : parseInt(modalVenda.dias_intervalo as any) || 30, desconto_percentual: modalVenda.desconto_percentual || null, desconto_valor: modalVenda.desconto_valor || null, observacao: modalVenda.observacao }).eq("id", modalVenda.id);
        if (!error) {
          await supabase.from("venda_parcelas").delete().eq("venda_id", modalVenda.id);
          await supabase.from("venda_parcelas").insert(parcelas.map(p => ({ ...p, venda_id: modalVenda.id })));
          setVendasAprazo(vendasAprazo.map(v => v.id === modalVenda.id ? { ...v, ...modalVenda, parcelas } : v));
          setModalVenda(null);
        }
      } else {
        const { data: nova, error } = await supabase.from("vendas_aprazo").insert({ loja_id: loja.id, cliente_nome: modalVenda.cliente_nome, cliente_telefone: modalVenda.cliente_telefone, valor_total: modalVenda.valor_total, valor_entrada: modalVenda.valor_entrada || 0, numero_parcelas: modalVenda.numero_parcelas, dias_intervalo: typeof modalVenda.dias_intervalo === 'number' ? modalVenda.dias_intervalo : parseInt(modalVenda.dias_intervalo as any) || 30, desconto_percentual: modalVenda.desconto_percentual || null, desconto_valor: modalVenda.desconto_valor || null, observacao: modalVenda.observacao }).select().single();
        if (!error && nova) {
          await supabase.from("venda_parcelas").insert(parcelas.map(p => ({ ...p, venda_id: nova.id })));
          setVendasAprazo([{ ...nova, venda_parcelas: parcelas.map((p, i) => ({ ...p, id: `temp-${i}`, venda_id: nova.id })) }, ...vendasAprazo]);
          setModalVenda(null);
        }
      }
    } catch (err: any) { alert("Erro: " + err.message); }
  };

  const baixarParcela = async (parcelaId: string, vendaId: string) => {
    const hoje = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from("venda_parcelas").update({ pago: true, data_pagamento: hoje }).eq("id", parcelaId);
    if (!error) {
      setVendasAprazo(vendasAprazo.map(v => v.id === vendaId ? { ...v, venda_parcelas: (v.venda_parcelas || []).map((p: any) => p.id === parcelaId ? { ...p, pago: true, data_pagamento: hoje } : p) } : v));
    }
  };

  const estornarParcela = async (parcelaId: string, vendaId: string) => {
    const { error } = await supabase.from("venda_parcelas").update({ pago: false, data_pagamento: null }).eq("id", parcelaId);
    if (!error) {
      setVendasAprazo(vendasAprazo.map(v => v.id === vendaId ? { ...v, venda_parcelas: (v.venda_parcelas || []).map((p: any) => p.id === parcelaId ? { ...p, pago: false, data_pagamento: null } : p) } : v));
    }
  };

  const excluirVenda = async (id: string) => {
    if (confirm("Excluir esta venda a prazo?")) {
      await supabase.from("venda_parcelas").delete().eq("venda_id", id);
      const { error } = await supabase.from("vendas_aprazo").delete().eq("id", id);
      if (!error) setVendasAprazo(vendasAprazo.filter(v => v.id !== id));
    }
  };

  const formatarData = (data: string) => {
    if (!data) return '-';
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  // ===================== CRUD ORDENS DE SERVIÇO =====================
  const salvarOrdem = async () => {
    if (!modalOrdem?.cliente_nome) {
      alert("O nome do cliente é obrigatório!");
      return;
    }
    if (loja) {
      if (modalOrdem.id) {
        const { error } = await supabase.from("ordens_servico").update({
          cliente_nome: modalOrdem.cliente_nome,
          cliente_cpf: modalOrdem.cliente_cpf || null,
          cliente_endereco: modalOrdem.cliente_endereco || null,
          cliente_fone: modalOrdem.cliente_fone || null,
          cliente_cidade: modalOrdem.cliente_cidade || null,
          cliente_bairro: modalOrdem.cliente_bairro || null,
          cliente_estado: modalOrdem.cliente_estado || null,
          cliente_cep: modalOrdem.cliente_cep || null,
          placa: modalOrdem.placa || null,
          marca: modalOrdem.marca || null,
          modelo: modalOrdem.modelo || null,
          cor: modalOrdem.cor || null,
          produto: modalOrdem.produto || null,
          situacao: modalOrdem.situacao || 'aberto',
          data_emissao: modalOrdem.data_emissao || new Date().toISOString(),
          data_entrega: modalOrdem.data_entrega || null,
          itens: modalOrdem.itens || [],
          servicos: modalOrdem.servicos || [],
          total: ordemTotal,
          desconto_percentual: modalOrdem.desconto_percentual || null,
          desconto_valor: modalOrdem.desconto_valor || null,
          forma_pagamento: modalOrdem.forma_pagamento || null,
          observacoes: modalOrdem.observacoes || null
        }).eq("id", modalOrdem.id);
        if (!error) {
          setOrdens(ordens.map(o => o.id === modalOrdem.id ? { ...o, ...modalOrdem, total: ordemTotal } : o));
          setModalOrdem(null);
        } else alert("Erro ao editar: " + (error?.message || "Erro desconhecido"));
      } else {
        const { data: novaOrdem, error } = await supabase.from("ordens_servico").insert({
          loja_id: loja.id,
          cliente_nome: modalOrdem.cliente_nome,
          cliente_cpf: modalOrdem.cliente_cpf || null,
          cliente_endereco: modalOrdem.cliente_endereco || null,
          cliente_fone: modalOrdem.cliente_fone || null,
          cliente_cidade: modalOrdem.cliente_cidade || null,
          cliente_bairro: modalOrdem.cliente_bairro || null,
          cliente_estado: modalOrdem.cliente_estado || null,
          cliente_cep: modalOrdem.cliente_cep || null,
          placa: modalOrdem.placa || null,
          marca: modalOrdem.marca || null,
          modelo: modalOrdem.modelo || null,
          cor: modalOrdem.cor || null,
          produto: modalOrdem.produto || null,
          situacao: modalOrdem.situacao || 'aberto',
          data_emissao: modalOrdem.data_emissao || new Date().toISOString(),
          data_entrega: modalOrdem.data_entrega || null,
          itens: modalOrdem.itens || [],
          servicos: modalOrdem.servicos || [],
          total: ordemTotal,
          desconto_percentual: modalOrdem.desconto_percentual || null,
          desconto_valor: modalOrdem.desconto_valor || null,
          forma_pagamento: modalOrdem.forma_pagamento || null,
          observacoes: modalOrdem.observacoes || null
        }).select().single();
        if (!error && novaOrdem) {
          setOrdens([novaOrdem, ...ordens]);
          if ((loja as any).som_ordem_ativo) tocarNotificacao((loja as any).som_ordem || 'ding');
          setModalOrdem(null);
        } else alert("Erro ao salvar: " + (error?.message || "Erro desconhecido"));
      }
    }
  };

  const excluirOrdem = async (id: string) => {
    if (confirm("Excluir esta ordem de serviço?")) {
      const { error } = await supabase.from("ordens_servico").delete().eq("id", id);
      if (!error) setOrdens(ordens.filter(o => o.id !== id));
    }
  };

  const imprimirConteudo = (html: string) => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.onafterprint = () => win.close();
      setTimeout(() => win.print(), 500);
    } else {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.write(html);
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 500);
      }
    }
  };

  const gerarHtmlImpressao = (titulo: string, conteudo: string) => `
    <html><head><title>${titulo}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Courier New', Courier, monospace; padding: 20px; max-width: 800px; margin: auto; color: #222; font-size: 13px; line-height: 1.5; }
      .nf-header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 16px; }
      .nf-header h1 { font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #000; }
      .nf-header p { font-size: 11px; color: #444; margin-top: 4px; }
      .nf-header .cnpj { font-size: 10px; color: #666; }
      .nf-title { text-align: center; font-size: 16px; font-weight: bold; margin: 16px 0; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #222; padding: 6px; }
      .nf-info { margin: 12px 0; padding: 10px; border: 1px dashed #999; background: #fafafa; font-size: 12px; }
      .nf-info p { margin: 3px 0; }
      .nf-info strong { display: inline-block; min-width: 80px; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px; }
      th { border: 1px solid #222; padding: 6px 8px; text-align: left; background: #222; color: #fff; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
      td { border: 1px solid #ccc; padding: 6px 8px; }
      .nf-total { text-align: right; font-size: 16px; font-weight: bold; margin-top: 12px; padding-top: 8px; border-top: 2px solid #222; }
      .nf-footer { text-align: center; font-size: 10px; color: #888; margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 12px; }
      .nf-obs { margin: 12px 0; padding: 10px; border: 1px dashed #999; background: #f5f5f5; font-size: 12px; }
      .nf-status { display: inline-block; padding: 2px 10px; font-weight: bold; font-size: 11px; border: 1px solid; margin: 4px 0; }
      .btn-fechar { display: block; width: 100%; padding: 12px; margin: 20px 0; background: #222; color: #fff; border: none; font-family: 'Courier New', monospace; font-size: 14px; font-weight: bold; cursor: pointer; text-transform: uppercase; letter-spacing: 2px; }
      .btn-fechar:hover { background: #444; }
      @media print { .btn-fechar { display: none; } }
    </style></head>
    <body>
      <button class="btn-fechar" onclick="window.close()">✕ Fechar / Voltar</button>
      <div class="nf-header">
        <h1>${(loja as any)?.empresa || loja?.nome}</h1>
        ${(loja as any)?.cnpj_cpf ? `<p class="cnpj">CNPJ/CPF: ${(loja as any)?.cnpj_cpf}</p>` : ''}
        ${(loja as any)?.telefone ? `<p>Tel: ${(loja as any)?.telefone}</p>` : ''}
        ${(loja as any)?.email ? `<p>${(loja as any)?.email}</p>` : ''}
        ${(loja as any)?.site ? `<p>${(loja as any)?.site}</p>` : ''}
      </div>
      <div class="nf-title">${titulo}</div>
      ${conteudo}
      <div class="nf-footer">${(loja as any)?.empresa || loja?.nome} — ${new Date().toLocaleString('pt-BR')}</div>
    </body></html>`;

  const f = (v: any) => {
    try {
      const num = Number(v ?? 0);
      if (isNaN(num)) return 'R$ 0,00';
      return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    } catch { return 'R$ 0,00'; }
  };

  const imprimirOrdem = (ordem: any) => {
    const win = window.open("", "_blank");
    if (!win) return;
    const itensHtml = (ordem.itens || []).map((i: any) => `<tr><td style="text-align:center;width:50px">${i.quantidade}x</td><td>${i.nome}</td><td style="text-align:right;width:120px">${f(i.preco)}</td></tr>`).join("");
    const servicosHtml = (ordem.servicos || []).map((s: any) => `<tr><td style="text-align:center">1x</td><td>${s.nome}</td><td style="text-align:right">${f(s.preco)}</td></tr>`).join("");
    const statusClass = `nf-status ${ordem.situacao === 'concluido' || ordem.situacao === 'entregue' ? 'color:#16a34a;border-color:#16a34a' : ordem.situacao === 'cancelado' ? 'color:#dc2626;border-color:#dc2626' : 'color:#ca8a04;border-color:#ca8a04'}`;
    const conteudo = `
      <div class="nf-status" style="${statusClass}">${(ordem.situacao || 'ABERTO').replace('_', ' ').toUpperCase()}</div>
      <div class="nf-info">
        <p><strong>OS Nº:</strong> ${ordem.id?.slice(0,8).toUpperCase()}</p>
        <p><strong>Emissão:</strong> ${new Date(ordem.data_emissao).toLocaleDateString('pt-BR')}</p>
        ${ordem.data_entrega ? `<p><strong>Previsão:</strong> ${new Date(ordem.data_entrega).toLocaleDateString('pt-BR')}</p>` : ''}
        <p><strong>Cliente:</strong> ${ordem.cliente_nome}</p>
        ${ordem.cliente_cpf ? `<p><strong>CPF:</strong> ${ordem.cliente_cpf}</p>` : ''}
        ${ordem.cliente_fone ? `<p><strong>Telefone:</strong> ${ordem.cliente_fone}</p>` : ''}
        ${ordem.cliente_endereco ? `<p><strong>Endereço:</strong> ${ordem.cliente_endereco}</p>` : ''}
        ${ordem.cliente_cidade ? `<p><strong>Cidade:</strong> ${ordem.cliente_cidade}</p>` : ''}
        ${ordem.placa ? `<p><strong>Placa:</strong> ${ordem.placa}</p>` : ''}
        ${ordem.marca ? `<p><strong>Marca/Modelo:</strong> ${ordem.marca} ${ordem.modelo || ''}</p>` : ''}
      </div>
      ${itensHtml ? `<table><thead><tr><th>Qtd</th><th>Produto / Serviço</th><th>Valor</th></tr></thead><tbody>${itensHtml}${servicosHtml}</tbody></table>` : ''}
      ${ordem.observacoes ? `<div class="nf-obs"><strong>Observações:</strong><br>${ordem.observacoes}</div>` : ''}
      ${ordem.desconto_percentual > 0 && ordem.desconto_valor > 0 ? `<div class="nf-total" style="font-size:14px;color:#666">Subtotal: ${f(ordem.total + ordem.desconto_valor)}</div>` : ''}
      ${ordem.desconto_percentual > 0 ? `<div class="nf-total" style="font-size:14px;color:#ea580c">Desconto: ${ordem.desconto_percentual}%</div>` : ''}
      ${ordem.desconto_valor > 0 ? `<div class="nf-total" style="font-size:14px;color:#ea580c">Desconto: -${f(ordem.desconto_valor)}</div>` : ''}
      <div class="nf-total">Total: ${f(ordem.total)}</div>
    `;
    win.document.write(gerarHtmlImpressao(`ORDEM DE SERVIÇO #${ordem.id?.slice(0,8).toUpperCase()}`, conteudo));
    win.document.close();
    win.onafterprint = () => win.close();
    setTimeout(() => win.print(), 500);
  };

  // ===================== CRUD ORÇAMENTOS =====================
  const salvarOrcamento = async () => {
    if (!modalOrcamento?.cliente_nome) {
      alert("O nome do cliente é obrigatório!");
      return;
    }
    if (loja) {
      if (modalOrcamento.id) {
        const { error } = await supabase.from("orcamentos").update({
          cliente_nome: modalOrcamento.cliente_nome,
          cliente_cpf: modalOrcamento.cliente_cpf || null,
          cliente_endereco: modalOrcamento.cliente_endereco || null,
          cliente_cidade: modalOrcamento.cliente_cidade || null,
          cliente_bairro: modalOrcamento.cliente_bairro || null,
          cliente_estado: modalOrcamento.cliente_estado || null,
          cliente_cep: modalOrcamento.cliente_cep || null,
          cliente_fone: modalOrcamento.cliente_fone || null,
          vendedor: modalOrcamento.vendedor || null,
          validade: modalOrcamento.validade ?? 7,
          data_emissao: modalOrcamento.data_emissao || new Date().toISOString(),
          observacoes: modalOrcamento.observacoes || null,
          itens: modalOrcamento.itens || [],
          servicos: modalOrcamento.servicos || [],
          total: orcTotal,
          desconto_percentual: modalOrcamento.desconto_percentual || null,
          desconto_valor: modalOrcamento.desconto_valor || null,
          forma_pagamento: modalOrcamento.forma_pagamento || null
        }).eq("id", modalOrcamento.id);
        if (!error) {
          setOrcamentos(orcamentos.map(o => o.id === modalOrcamento.id ? { ...o, ...modalOrcamento, total: orcTotal } : o));
          setModalOrcamento(null);
        } else alert("Erro ao editar: " + (error?.message || "Erro desconhecido"));
      } else {
        const { data: novoOrcamento, error } = await supabase.from("orcamentos").insert({
          loja_id: loja.id,
          cliente_nome: modalOrcamento.cliente_nome,
          cliente_cpf: modalOrcamento.cliente_cpf || null,
          cliente_endereco: modalOrcamento.cliente_endereco || null,
          cliente_cidade: modalOrcamento.cliente_cidade || null,
          cliente_bairro: modalOrcamento.cliente_bairro || null,
          cliente_estado: modalOrcamento.cliente_estado || null,
          cliente_cep: modalOrcamento.cliente_cep || null,
          cliente_fone: modalOrcamento.cliente_fone || null,
          vendedor: modalOrcamento.vendedor || null,
          validade: modalOrcamento.validade ?? 7,
          data_emissao: modalOrcamento.data_emissao || new Date().toISOString(),
          observacoes: modalOrcamento.observacoes || null,
          itens: modalOrcamento.itens || [],
          servicos: modalOrcamento.servicos || [],
          total: orcTotal,
          desconto_percentual: modalOrcamento.desconto_percentual || null,
          desconto_valor: modalOrcamento.desconto_valor || null,
          forma_pagamento: modalOrcamento.forma_pagamento || null
        }).select().single();
        if (!error && novoOrcamento) {
          setOrcamentos([novoOrcamento, ...orcamentos]);
          if ((loja as any).som_orcamento_ativo) tocarNotificacao((loja as any).som_orcamento || 'ding');
          setModalOrcamento(null);
        } else alert("Erro ao salvar: " + (error?.message || "Erro desconhecido"));
      }
    }
  };

  const excluirOrcamento = async (id: string) => {
    if (confirm("Excluir este orçamento?")) {
      const { error } = await supabase.from("orcamentos").delete().eq("id", id);
      if (!error) setOrcamentos(orcamentos.filter(o => o.id !== id));
    }
  };

  const excluirDevolucao = async (id: string) => {
    if (confirm("Excluir esta devolução?")) {
      const { error } = await supabase.from("devolucoes").delete().eq("id", id);
      if (!error) setDevolucoes(devolucoes.filter(d => d.id !== id));
    }
  };

  const salvarDevolucao = async () => {
    if (!modalDevolucao || !loja) return;
    if (!modalDevolucao.cliente_nome?.trim()) {
      alert("Preencha o nome do cliente.");
      return;
    }
    if (!modalDevolucao.cliente_telefone?.trim()) {
      alert("Preencha o telefone do cliente.");
      return;
    }
    if (!modalDevolucao.produto_nome?.trim()) {
      alert("Preencha o nome do produto.");
      return;
    }
    if (!modalDevolucao.motivo?.trim()) {
      alert("Preencha o motivo da devolução.");
      return;
    }
    try {
      const dados = {
        loja_id: loja.id,
        produto_nome: modalDevolucao.produto_nome,
        cliente_nome: modalDevolucao.cliente_nome,
        cliente_telefone: modalDevolucao.cliente_telefone,
        motivo: modalDevolucao.motivo,
        observacao: modalDevolucao.observacao,
        data_recolhimento: modalDevolucao.data_recolhimento || null,
        prazo_resolucao: modalDevolucao.prazo_resolucao,
        tipo_resolucao: modalDevolucao.tipo_resolucao,
        status: modalDevolucao.status,
        mensagem_lojista: modalDevolucao.mensagem_lojista,
      };
      if (modalDevolucao.id) {
        const { error } = await supabase.from("devolucoes").update(dados).eq("id", modalDevolucao.id);
        if (!error) {
          setDevolucoes(devolucoes.map(d => d.id === modalDevolucao.id ? { ...d, ...dados } : d));
          setModalDevolucao(null);
        } else alert("Erro ao editar: " + error.message);
      } else {
        const { data, error } = await supabase.from("devolucoes").insert(dados).select().single();
        if (!error && data) {
          setDevolucoes([data, ...devolucoes]);
          if ((loja as any).som_devolucao_ativo) tocarNotificacao((loja as any).som_devolucao || 'tum');
          setModalDevolucao(null);
        } else alert("Erro ao salvar: " + (error?.message || "Erro desconhecido"));
      }
    } catch (err: any) {
      alert("Erro: " + err.message);
    }
  };

  const alterarStatusDevolucao = async (id: string, novoStatus: string) => {
    const { error } = await supabase.from("devolucoes").update({ status: novoStatus }).eq("id", id);
    if (!error) setDevolucoes(devolucoes.map(d => d.id === id ? { ...d, status: novoStatus } : d));
  };

  const imprimirOrcamento = (orcamento: any) => {
    const win = window.open("", "_blank");
    if (!win) return;
    const dataValidade = new Date(orcamento.data_emissao);
    dataValidade.setDate(dataValidade.getDate() + (orcamento.validade || 7));
    const itensHtml = (orcamento.itens || []).map((i: any) => `<tr><td style="text-align:center;width:50px">${i.quantidade}x</td><td>${i.nome}</td><td style="text-align:right;width:120px">${f(i.preco)}</td></tr>`).join("");
    const servicosHtml = (orcamento.servicos || []).map((s: any) => `<tr><td style="text-align:center">1x</td><td>${s.nome}</td><td style="text-align:right">${f(s.valor)}</td></tr>`).join("");
    const conteudo = `
      <div class="nf-info">
        <p><strong>Orçamento Nº:</strong> ${orcamento.id?.slice(0,8).toUpperCase()}</p>
        <p><strong>Cliente:</strong> ${orcamento.cliente_nome}</p>
        ${orcamento.cliente_cpf ? `<p><strong>CPF:</strong> ${orcamento.cliente_cpf}</p>` : ''}
        ${orcamento.cliente_endereco ? `<p><strong>Endereço:</strong> ${orcamento.cliente_endereco}</p>` : ''}
        ${orcamento.cliente_cidade ? `<p><strong>Cidade:</strong> ${orcamento.cliente_cidade}</p>` : ''}
        ${orcamento.vendedor ? `<p><strong>Vendedor:</strong> ${orcamento.vendedor}</p>` : ''}
        <p><strong>Emissão:</strong> ${new Date(orcamento.data_emissao).toLocaleDateString('pt-BR')}</p>
        <p><strong>Validade:</strong> ${dataValidade.toLocaleDateString('pt-BR')}</p>
      </div>
      ${itensHtml || servicosHtml ? `<table><thead><tr><th>Qtd</th><th>Produto / Serviço</th><th>Valor</th></tr></thead><tbody>${itensHtml}${servicosHtml}</tbody></table>` : ''}
      ${orcamento.forma_pagamento ? `<div class="nf-obs"><strong>Forma de Pagamento:</strong> ${orcamento.forma_pagamento}</div>` : ''}
      ${orcamento.observacoes ? `<div class="nf-obs"><strong>Observações:</strong><br>${orcamento.observacoes}</div>` : ''}
      ${orcamento.desconto_percentual > 0 || orcamento.desconto_valor > 0 ? `<div class="nf-total" style="font-size:14px;color:#ea580c">Desconto: ${orcamento.desconto_percentual > 0 ? orcamento.desconto_percentual + '% ' : ''}${orcamento.desconto_valor > 0 ? '- ' + f(orcamento.desconto_valor) : ''}</div>` : ''}
      <div class="nf-total">Total: ${f(orcamento.total)}</div>
    `;
    win.document.write(gerarHtmlImpressao(`ORÇAMENTO #${orcamento.id?.slice(0,8).toUpperCase()}`, conteudo));
    win.document.close();
    win.onafterprint = () => win.close();
    setTimeout(() => win.print(), 500);
  };

    // ===================== CONFIGURAÇÕES =====================
    const salvarConfiguracoes = async () => {
      if (!loja) return;
      
      const camposBasicos: any = {
        nome: loja.nome,
        tema: loja.tema,
        hora_abertura: loja.hora_abertura,
        hora_fechamento: loja.hora_fechamento,
        logo_url: loja.logo_url,
        nome_completo: (loja as any).nome_completo,
        telefone: (loja as any).telefone,
        email: (loja as any).email,
        site: (loja as any).site,
        empresa: (loja as any).empresa,
        cnpj_cpf: (loja as any).cnpj_cpf,
        mensagem_ticker: (loja as any).mensagem_ticker,
        notificacao_sonora: (loja as any).notificacao_sonora,
        som_pedido: (loja as any).som_pedido || 'ding',
        volume_som: (loja as any).volume_som || 0.5,
        som_loja_virtual: (loja as any).som_loja_virtual || false,
        som_adicionar: (loja as any).som_adicionar || 'ding',
        som_remover: (loja as any).som_remover || 'tap',
        modulo_agenda: (loja as any).modulo_agenda !== false,
        modulo_servicos: (loja as any).modulo_servicos !== false,
        modulo_produtos: (loja as any).modulo_produtos !== false,
        modulo_pedidos: (loja as any).modulo_pedidos !== false,
        modulo_ordens: (loja as any).modulo_ordens !== false,
        modulo_orcamentos: (loja as any).modulo_orcamentos !== false,
        modulo_funcionarios: (loja as any).modulo_funcionarios !== false,
        modulo_devolucoes: (loja as any).modulo_devolucoes !== false,
        modulo_vendas_aprazo: (loja as any).modulo_vendas_aprazo !== false,
        modulo_frente_caixa: (loja as any).modulo_frente_caixa !== false,
        tom_tema: (loja as any)?.tom_tema || 'original',
        pix_recebimento: (loja as any).pix_recebimento || '',
        link_pagamento: (loja as any).link_pagamento || '',
        qr_code_url: (loja as any).qr_code_url || ''
      };

      // Sound fields
      Object.assign(camposBasicos, {
        som_agendamento: (loja as any).som_agendamento || 'double',
        som_agendamento_ativo: (loja as any).som_agendamento_ativo === true,
        som_orcamento: (loja as any).som_orcamento || 'ding',
        som_orcamento_ativo: (loja as any).som_orcamento_ativo === true,
        som_ordem: (loja as any).som_ordem || 'ding',
        som_ordem_ativo: (loja as any).som_ordem_ativo === true,
        som_devolucao: (loja as any).som_devolucao || 'tum',
        som_devolucao_ativo: (loja as any).som_devolucao_ativo === true,
        som_cliente: (loja as any).som_cliente || 'ding',
        som_cliente_ativo: (loja as any).som_cliente_ativo === true,
        som_produto: (loja as any).som_produto || 'pop',
        som_produto_ativo: (loja as any).som_produto_ativo === true,
        som_servico: (loja as any).som_servico || 'pop',
        som_servico_ativo: (loja as any).som_servico_ativo === true,
        som_funcionario: (loja as any).som_funcionario || 'pop',
        som_funcionario_ativo: (loja as any).som_funcionario_ativo === true,
        som_clique: (loja as any).som_clique || 'tap',
        som_clique_ativo: (loja as any).som_clique_ativo === true
      });

      let { error } = await supabase.from("lojas").update(camposBasicos).eq("id", loja.id);

      if (error) {
        alert("Erro ao salvar: " + error.message);
        return;
      }

      try {
        await supabase.from("lojas").update({
          cadastro_completo: (loja as any).cadastro_completo || false
        }).eq("id", loja.id);
      } catch (e) { console.log("cadastro_completo not exists"); }

      alert("Configurações salvas e aplicadas a toda plataforma!");
    };

    const fazerLogout = async () => {
      await supabase.auth.signOut();
      router.push("/login");
    };

    const imprimirRelatorio = () => {
      const win = window.open("", "_blank");
      if (!win) return;
      let corpo = "", titulo = "", subTitulo = "";
      if (activeTab === "clientes") {
        titulo = "RELATÓRIO DE CLIENTES";
        subTitulo = `Total: ${clientes.length} clientes`;
        corpo = `<table><thead><tr><th>Nome</th><th>Telefone</th></tr></thead><tbody>${clientes.map(c => `<tr><td>${c.nome}</td><td>${c.telefone || "-"}</td></tr>`).join("")}</tbody></table>`;
      } else if (activeTab === "servicos") {
        titulo = "RELATÓRIO DE SERVIÇOS";
        subTitulo = `Total: ${servicos.length} serviços`;
        corpo = `<table><thead><tr><th>Serviço</th><th>Duração</th><th>Valor</th></tr></thead><tbody>${servicos.map(s => `<tr><td>${s.nome}</td><td style="text-align:center">${s.duracao} min</td><td style="text-align:right">${f(s.preco)}</td></tr>`).join("")}</tbody></table>`;
      } else if (activeTab === "produtos") {
        titulo = "RELATÓRIO DE PRODUTOS";
        subTitulo = `Total: ${produtos.length} produtos`;
        corpo = `<table><thead><tr><th>Produto</th><th>Valor</th><th>Estoque</th></tr></thead><tbody>${produtos.map(p => `<tr><td>${p.nome}</td><td style="text-align:right">${f(p.preco)}</td><td style="text-align:center">${p.estoque}</td></tr>`).join("")}</tbody></table>`;
      } else if (activeTab === "devolucoes") {
        titulo = "RELATÓRIO DE DEVOLUÇÕES";
        subTitulo = `Total: ${devolucoes.length} devoluções`;
        corpo = `<table><thead><tr><th>Cliente</th><th>Telefone</th><th>Produto</th><th>Motivo</th><th>Status</th><th>Data</th></tr></thead><tbody>${devolucoes.map(d => `<tr><td>${d.cliente_nome}</td><td>${d.cliente_telefone || '-'}</td><td>${d.produto_nome || '-'}</td><td>${d.motivo ? d.motivo.substring(0,20) + '...' : '-'}</td><td style="text-align:center; font-weight:bold; color:${d.status === 'resolvido' ? 'green' : d.status === 'cancelado' ? 'red' : d.status === 'recolhido' ? 'blue' : 'orange'}">${d.status?.toUpperCase()}</td><td style="text-align:center">${new Date(d.created_at).toLocaleDateString('pt-BR')}</td></tr>`).join("")}</tbody></table>`;
      } else if (activeTab === "vendas_aprazo") {
        titulo = "RELATÓRIO DE VENDAS A PRAZO";
        subTitulo = `Total: ${vendasAprazo.length} vendas | ${vendasAprazo.reduce((s, v) => s + (v.valor_total || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
        corpo = vendasAprazo.map(v => `<div style="margin-bottom:16px; border-bottom:1px solid #ccc; padding-bottom:12px"><strong>${v.cliente_nome}</strong> ${v.cliente_telefone ? '- ' + v.cliente_telefone : ''}<br/>Total: ${Number(v.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ${(v.valor_entrada || 0) > 0 ? '| Entrada: ' + Number(v.valor_entrada).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''} | ${v.numero_parcelas}x de ${Number((v.valor_total - (v.valor_entrada || 0)) / v.numero_parcelas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} a cada ${v.dias_intervalo || 30}d<br/><small>${(v.venda_parcelas || []).map((p: any) => `${p.numero}ª ${formatarData(p.data_vencimento)} ${p.pago ? '✅' + (p.data_pagamento ? ' ' + formatarData(p.data_pagamento) : '') : '⏳'}`).join(' | ')}</small></div>`).join('');
      } else {
        titulo = "RELATÓRIO GERAL";
        subTitulo = `Clientes: ${clientes.length} | Serviços: ${servicos.length} | Produtos: ${produtos.length}`;
        corpo = `<div class="nf-info" style="text-align:center"><p><strong>${loja?.nome}</strong></p><p>${new Date().toLocaleDateString('pt-BR')}</p><p style="margin-top:8px">${subTitulo}</p></div>`;
      }
      win.document.write(gerarHtmlImpressao(titulo, corpo));
      win.document.close();
      win.onafterprint = () => win.close();
      setTimeout(() => win.print(), 500);
    };

    // ===================== LOGO UPLOAD =====================
    const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        setUploadingLogo(true);
        const file = e.target.files?.[0];
        if (!file || !loja) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${loja.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName);

        setLoja({ ...loja, logo_url: publicUrl });
        
        // Salva automaticamente para evitar que o usuário esqueça
        await supabase.from("lojas").update({ logo_url: publicUrl }).eq("id", loja.id);
        
        alert("Logotipo atualizado com sucesso!");
      } catch (error: any) {
        alert("Erro no upload: " + error.message);
      } finally {
        setUploadingLogo(false);
      }
    };

    const [uploadingQR, setUploadingQR] = useState(false);

    const handleUploadQR = async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        setUploadingQR(true);
        const file = e.target.files?.[0];
        if (!file || !loja) return;
        const fileExt = file.name.split('.').pop();
        const fileName = `qr-${loja.id}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
        setLoja({ ...loja, qr_code_url: publicUrl });
        await supabase.from("lojas").update({ qr_code_url: publicUrl }).eq("id", loja.id);
        alert("QR Code atualizado com sucesso!");
      } catch (error: any) {
        alert("Erro no upload: " + error.message);
      } finally {
        setUploadingQR(false);
      }
    };

    // ===================== PAGAMENTO =====================
    const iniciarPagamento = async () => {
      try {
        setPagando(true);
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lojaId: loja.id, lojaNome: loja.nome })
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert("Erro ao gerar link de pagamento: " + (data.error || "Tente novamente"));
        }
      } catch (err) {
        alert("Não foi possível conectar ao Mercado Pago. Verifique sua internet.");
      } finally {
        setPagando(false);
      }
    };

     // Processar dados para o gráfico
     const dadosGrafico = useMemo(() => {
       const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
       
       const base = Array.from({ length: 7 }, (_, i) => {
         const d = new Date();
         d.setDate(d.getDate() - (6 - i));
         return {
           dia: dias[(d.getDay() + 6) % 7],
           data: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
           valor: 0,
           originalDate: d
         };
       });

       agendamentos.forEach(ag => {
         const dataAg = new Date(ag.data_hora);
         const item = base.find(b => b.originalDate.toDateString() === dataAg.toDateString());
         if (item) {
           item.valor += 40; 
         }
       });

       return base;
     }, [agendamentos]);

    if (loading || !loja) {
      return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-500 font-bold">Carregando dados da nuvem...</div>;
    }

    // TELA DE BLOQUEIO PARA O LOJISTA (Ignora se for o Super Admin para evitar "auto-lock")
    const hoje = new Date();
    const expirado = loja.expira_em ? new Date(loja.expira_em) < hoje : false;

    if ((loja.status === 'bloqueado' || expirado) && user?.email !== 'wwbcinformatica@gmail.com' && loja.plano !== 'free') {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-red-500">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{expirado ? "Assinatura Expirada" : "Acesso Suspenso"}</h1>
          <p className="text-zinc-400 max-w-md mb-8">
            {expirado 
              ? "Sua assinatura mensal chegou ao fim. Realize o pagamento para continuar usando a plataforma sem interrupções."
              : "Sua conta foi bloqueada pelo administrador. Regularize sua situação para voltar a atender seus clientes."}
          </p>
          
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button 
              onClick={iniciarPagamento}
              disabled={pagando}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
               {pagando ? "Gerando Link Seguro..." : `Pagar Mensalidade (R$ ${(loja as any)?.valor_mensalidade || 49.90},00)`}
            </button>
            
            <button onClick={fazerLogout} className="text-zinc-500 hover:text-white text-sm font-medium underline">
              Sair da Conta
            </button>
          </div>
        </div>
      );
    }

    const modulosAtivos: Record<string, boolean> = {
      agenda: (loja as any)?.modulo_agenda !== false,
      servicos: (loja as any)?.modulo_servicos !== false,
      produtos: (loja as any)?.modulo_produtos !== false,
      pedidos: (loja as any)?.modulo_pedidos !== false,
      ordens: (loja as any)?.modulo_ordens !== false,
      orcamentos: (loja as any)?.modulo_orcamentos !== false,
      funcionarios: (loja as any)?.modulo_funcionarios !== false,
      devolucoes: (loja as any)?.modulo_devolucoes !== false,
      vendas_aprazo: (loja as any)?.modulo_vendas_aprazo !== false,
    };
    const tabsVisiveis = ["visao-geral", "agenda", "clientes", "servicos", "produtos", "pedidos", "ordens", "orcamentos", "devolucoes", "vendas_aprazo", "frente_caixa", "loja", "funcionarios", "configuracoes"].filter(t => ["visao-geral", "clientes", "loja", "configuracoes"].includes(t) || modulosAtivos[t] !== false);
    if (!tabsVisiveis.includes(activeTab)) { setTimeout(() => setActiveTab("visao-geral"), 0); }

    const temasBase = {
      "dark-gold": { bgMain: "bg-zinc-950", bgSidebar: "bg-zinc-900", textMain: "text-zinc-50", textMuted: "text-zinc-400", border: "border-zinc-800", card: "bg-zinc-900" },
      "clean-apple": { bgMain: "bg-slate-50", bgSidebar: "bg-white", textMain: "text-slate-900", textMuted: "text-slate-500", border: "border-slate-200", card: "bg-white" },
      "vintage": { bgMain: "bg-[#f4f1ea]", bgSidebar: "bg-[#e8e4d9]", textMain: "text-[#2c1810]", textMuted: "text-[#6b5c51]", border: "border-[#d1c8b8]", card: "bg-[#fcfbf9]" },
      "neon": { bgMain: "bg-[#09090b]", bgSidebar: "bg-[#18181b]", textMain: "text-white", textMuted: "text-zinc-400", border: "border-fuchsia-900/50", card: "bg-[#18181b] shadow-[0_0_15px_rgba(217,70,239,0.1)]" },
      "rosa-claro": { bgMain: "bg-[#fff5f7]", bgSidebar: "bg-[#fff5f7]", textMain: "text-rose-900", textMuted: "text-rose-400", border: "border-rose-100", card: "bg-white" },
      "azul-bebe": { bgMain: "bg-[#f0f7ff]", bgSidebar: "bg-[#f0f7ff]", textMain: "text-blue-900", textMuted: "text-blue-400", border: "border-blue-100", card: "bg-white" },
      "verde-palha": { bgMain: "bg-[#f8f9f0]", bgSidebar: "bg-[#f8f9f0]", textMain: "text-emerald-900", textMuted: "text-emerald-400", border: "border-emerald-100", card: "bg-white" },
      "verde-menta": { bgMain: "bg-[#f0faf5]", bgSidebar: "bg-[#f0faf5]", textMain: "text-emerald-900", textMuted: "text-emerald-400", border: "border-emerald-200", card: "bg-white" },
      "lilas-suave": { bgMain: "bg-[#f8f5ff]", bgSidebar: "bg-[#f8f5ff]", textMain: "text-purple-900", textMuted: "text-purple-400", border: "border-purple-200", card: "bg-white" },
      "coral": { bgMain: "bg-[#fff8f7]", bgSidebar: "bg-[#fff8f7]", textMain: "text-rose-900", textMuted: "text-rose-400", border: "border-rose-200", card: "bg-white" },
      "cinza-elegante": { bgMain: "bg-zinc-50", bgSidebar: "bg-white", textMain: "text-zinc-900", textMuted: "text-zinc-500", border: "border-zinc-200", card: "bg-white" },
      "rose-gold": { bgMain: "bg-[#fdf8f6]", bgSidebar: "bg-[#fff5f2]", textMain: "text-rose-900", textMuted: "text-rose-300", border: "border-rose-200", card: "bg-white" }
    };
    const acentosTema: Record<string, Record<string, { accent: string; bgAccent: string; hoverAccent: string }>> = {
      "dark-gold": {
        original: { accent: "text-amber-500", bgAccent: "bg-amber-500", hoverAccent: "hover:bg-amber-600" },
        verde: { accent: "text-emerald-500", bgAccent: "bg-emerald-500", hoverAccent: "hover:bg-emerald-600" },
         roxo: { accent: "text-violet-500", bgAccent: "bg-violet-500", hoverAccent: "hover:bg-violet-600" },
      },
      "clean-apple": {
        original: { accent: "text-blue-600", bgAccent: "bg-blue-600", hoverAccent: "hover:bg-blue-700" },
        rosa: { accent: "text-rose-500", bgAccent: "bg-rose-500", hoverAccent: "hover:bg-rose-600" },
         verde: { accent: "text-teal-500", bgAccent: "bg-teal-500", hoverAccent: "hover:bg-teal-600" },
      },
      "vintage": {
        original: { accent: "text-[#8b0000]", bgAccent: "bg-[#8b0000]", hoverAccent: "hover:bg-[#660000]" },
        verde: { accent: "text-[#2c5530]", bgAccent: "bg-[#2c5530]", hoverAccent: "hover:bg-[#1e3d22]" },
         azul: { accent: "text-[#2c4a6e]", bgAccent: "bg-[#2c4a6e]", hoverAccent: "hover:bg-[#1e3350]" },
      },
      "neon": {
        original: { accent: "text-fuchsia-500", bgAccent: "bg-fuchsia-600", hoverAccent: "hover:bg-fuchsia-700" },
        ciano: { accent: "text-cyan-400", bgAccent: "bg-cyan-600", hoverAccent: "hover:bg-cyan-700" },
        rosa: { accent: "text-pink-500", bgAccent: "bg-pink-600", hoverAccent: "hover:bg-pink-700" },
      },
      "rosa-claro": {
        original: { accent: "text-rose-500", bgAccent: "bg-rose-500", hoverAccent: "hover:bg-rose-600" },
        coral: { accent: "text-coral-500", bgAccent: "bg-orange-500", hoverAccent: "hover:bg-orange-600" },
        lavanda: { accent: "text-purple-400", bgAccent: "bg-purple-400", hoverAccent: "hover:bg-purple-500" },
      },
      "azul-bebe": {
        original: { accent: "text-blue-500", bgAccent: "bg-blue-500", hoverAccent: "hover:bg-blue-600" },
        ceu: { accent: "text-sky-500", bgAccent: "bg-sky-500", hoverAccent: "hover:bg-sky-600" },
        indigo: { accent: "text-indigo-500", bgAccent: "bg-indigo-500", hoverAccent: "hover:bg-indigo-600" },
      },
      "verde-palha": {
        original: { accent: "text-emerald-600", bgAccent: "bg-emerald-600", hoverAccent: "hover:bg-emerald-700" },
        teal: { accent: "text-teal-600", bgAccent: "bg-teal-600", hoverAccent: "hover:bg-teal-700" },
        lima: { accent: "text-lime-600", bgAccent: "bg-lime-600", hoverAccent: "hover:bg-lime-700" },
      },
      "verde-menta": {
        original: { accent: "text-emerald-500", bgAccent: "bg-emerald-500", hoverAccent: "hover:bg-emerald-600" },
        teal: { accent: "text-teal-500", bgAccent: "bg-teal-500", hoverAccent: "hover:bg-teal-600" },
        ciano: { accent: "text-cyan-500", bgAccent: "bg-cyan-500", hoverAccent: "hover:bg-cyan-600" },
      },
      "lilas-suave": {
        original: { accent: "text-purple-500", bgAccent: "bg-purple-500", hoverAccent: "hover:bg-purple-600" },
        violeta: { accent: "text-violet-500", bgAccent: "bg-violet-500", hoverAccent: "hover:bg-violet-600" },
        fucsia: { accent: "text-fuchsia-500", bgAccent: "bg-fuchsia-500", hoverAccent: "hover:bg-fuchsia-600" },
      },
      "coral": {
        original: { accent: "text-rose-500", bgAccent: "bg-rose-500", hoverAccent: "hover:bg-rose-600" },
        laranja: { accent: "text-orange-500", bgAccent: "bg-orange-500", hoverAccent: "hover:bg-orange-600" },
        rosa: { accent: "text-pink-500", bgAccent: "bg-pink-500", hoverAccent: "hover:bg-pink-600" },
      },
      "cinza-elegante": {
        original: { accent: "text-zinc-700", bgAccent: "bg-zinc-700", hoverAccent: "hover:bg-zinc-800" },
        azul: { accent: "text-blue-700", bgAccent: "bg-blue-700", hoverAccent: "hover:bg-blue-800" },
        verde: { accent: "text-emerald-700", bgAccent: "bg-emerald-700", hoverAccent: "hover:bg-emerald-800" },
      },
      "rose-gold": {
        original: { accent: "text-rose-400", bgAccent: "bg-gradient-to-r from-rose-300 to-amber-300", hoverAccent: "hover:brightness-90" },
        dourado: { accent: "text-amber-400", bgAccent: "bg-gradient-to-r from-amber-300 to-yellow-300", hoverAccent: "hover:brightness-90" },
        pink: { accent: "text-pink-400", bgAccent: "bg-gradient-to-r from-pink-300 to-rose-300", hoverAccent: "hover:brightness-90" },
      }
    };
    const temaKey = (loja.tema as keyof typeof temasBase) || "dark-gold";
    const variacao = (loja as any)?.tom_tema || "original";
    const acento = acentosTema[temaKey]?.[variacao] || acentosTema[temaKey]?.original || { accent: "text-amber-500", bgAccent: "bg-amber-500", hoverAccent: "hover:bg-amber-600" };
    const t = { ...temasBase[temaKey], ...acento };

    return (
      <div className={`min-h-screen flex transition-colors duration-500 relative ${t.bgMain} ${t.textMain}`}>
        
        {/* ================= MOBILE TOP BAR ================= */}
        <div className={`md:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-50 border-b backdrop-blur-md shadow-lg ${t.bgSidebar} ${t.border}`}>
          {/* Lojista: logo + nome */}
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center font-bold shrink-0 overflow-hidden ${t.bgAccent} border-current`}>
              {loja.logo_url ? (
                <img src={loja.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xs font-black uppercase">{loja.nome.substring(0, 2)}</span>
              )}
            </div>

          </div>
        </div>

        {/* ================= MODAIS ================= */}
        {modalCliente && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-[60] p-2 sm:p-4 overflow-y-auto">
            <div className={`p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${t.card} ${t.border} border my-4`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{modalCliente.id ? "Editar Cliente" : "Novo Cliente"}</h2>
                <button onClick={() => setModalCliente(null)} className={`p-1 rounded-md hover:bg-black/10 ${t.textMuted}`}><X className="w-5 h-5"/></button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <div className="flex-[2]">
                  <label className={`block text-sm font-medium mb-1 ${t.textMuted}`}>Nome Completo <span className="text-red-500">*</span></label>
                  <input type="text" value={modalCliente.nome} onChange={(e) => setModalCliente({ ...modalCliente, nome: e.target.value })} className={`w-full border rounded-lg p-2 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Ex: Carlos Silva" />
                </div>
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-1 ${t.textMuted}`}>WhatsApp / Celular <span className="text-red-500">*</span></label>
                  <input type="text" value={modalCliente.telefone} onChange={(e) => setModalCliente({ ...modalCliente, telefone: formatarTelefone(e.target.value) })} className={`w-full border rounded-lg p-2 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="(00) 0 0000-0000" maxLength={16} />
                </div>
              </div>
              {(loja as any).cadastro_completo && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="sm:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${t.textMuted}`}>Email</label>
                    <input type="email" value={modalCliente.email || ''} onChange={(e) => setModalCliente({ ...modalCliente, email: e.target.value })} className={`w-full border rounded-lg p-2 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="email@exemplo.com" />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${t.textMuted}`}>UF</label>
                    <select 
                      value={modalCliente.estado || ''} 
                      onChange={(e) => setModalCliente({ ...modalCliente, estado: e.target.value })}
                      className={`w-full border rounded-lg p-2 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`}
                    >
                      <option value="">Selecione</option>
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className={`block text-sm font-medium mb-1 ${t.textMuted}`}>CPF/CNPJ</label>
                    <input 
                      type="text" 
                      value={modalCliente.cpf || ''} 
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        const formatted = val.length <= 11 
                          ? val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4').replace(/\.(\d{3})\.(\d{3})-(\d{2})$/, '.$1.$3-$4')
                          : val.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, '$1.$2.$3/$4-$5').replace(/\.(\d{3})\.(\d{3})\/(\d{4})-(\d{2})$/, '.$1.$3.$4-$5');
                        setModalCliente({ ...modalCliente, cpf: formatted });
                      }} 
                      className={`w-full border rounded-lg p-2 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} 
                      placeholder="CPF ou CNPJ" 
                      maxLength={18} 
                    />
                  </div>
                  <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div className="sm:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${t.textMuted}`}>CEP</label>
                      <input 
                        type="text" 
                        value={modalCliente.cep || ''} 
                        onChange={async (e) => {
                          const val = e.target.value;
                          setModalCliente({ ...modalCliente, cep: val });
                          const cep = val.replace(/\D/g, '');
                          if (cep.length === 8) {
                            try {
                              const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                              const data = await res.json();
                              if (!data.erro) {
                                setModalCliente({
                                  ...modalCliente,
                                  cep: cep.replace(/(\d{5})(\d{3})/, '$1-$2'),
                                  endereco: `${data.logradouro || ''}${data.complemento ? ', ' + data.complemento : ''}`,
                                  bairro: data.bairro || '',
                                  cidade: data.localidade || '',
                                  estado: data.uf || ''
                                });
                              }
                            } catch (err) { console.log('CEP error', err); }
                          }
                        }}
                        className={`w-full border rounded-lg p-2 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} 
                        placeholder="00000-000" 
                        maxLength={9} 
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className={`block text-sm font-medium mb-1 ${t.textMuted}`}>Bairro</label>
                      <input type="text" value={modalCliente.bairro || ''} onChange={(e) => setModalCliente({ ...modalCliente, bairro: e.target.value })} className={`w-full border rounded-lg p-2 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Bairro" />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label className={`block text-sm font-medium mb-1 ${t.textMuted}`}>Endereço</label>
                    <input type="text" value={modalCliente.endereco || ''} onChange={(e) => setModalCliente({ ...modalCliente, endereco: e.target.value })} className={`w-full border rounded-lg p-2 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Rua, número, complemento" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${t.textMuted}`}>Cidade</label>
                    <input type="text" value={modalCliente.cidade || ''} onChange={(e) => setModalCliente({ ...modalCliente, cidade: e.target.value })} className={`w-full border rounded-lg p-2 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Cidade" />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${t.textMuted}`}>Nascimento</label>
                    <input type="date" value={modalCliente.data_nascimento || ''} onChange={(e) => setModalCliente({ ...modalCliente, data_nascimento: e.target.value })} className={`w-full border rounded-lg p-2 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                  </div>
                  <div className="sm:col-span-3">
                    <label className={`block text-sm font-medium mb-1 ${t.textMuted}`}>Observações</label>
                    <textarea value={modalCliente.observacoes || ''} onChange={(e) => setModalCliente({ ...modalCliente, observacoes: e.target.value })} className={`w-full border rounded-lg p-2 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Observações..." rows={1} />
                  </div>
                </div>
              )}
              <button onClick={salvarCliente} className={`w-full font-bold px-4 py-2 rounded-lg text-white transition-colors shadow-lg ${t.bgAccent} ${t.hoverAccent}`}>
                {modalCliente.id ? "Salvar Alterações" : "Salvar Cliente na Base"}
              </button>
            </div>
          </div>
        )}

        {modalFuncionario && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className={`p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${t.card} ${t.border} border`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{modalFuncionario.id ? "Editar Funcionário" : "Novo Funcionário"}</h2>
                <button onClick={() => setModalFuncionario(null)} className={`p-1 rounded-md hover:bg-black/10 ${t.textMuted}`}><X className="w-5 h-5"/></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Nome do Profissional <span className="text-red-500">*</span></label>
                  <input type="text" value={modalFuncionario.nome} onChange={(e) => setModalFuncionario({ ...modalFuncionario, nome: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Nome do funcionário" />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Telefone</label>
                  <input type="text" value={modalFuncionario.telefone || ''} onChange={(e) => setModalFuncionario({ ...modalFuncionario, telefone: formatarTelefone(e.target.value) })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="(00) 0 0000-0000" maxLength={16} />
                </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>E-mail</label>
                    <input type="email" value={modalFuncionario.email || ''} onChange={(e) => setModalFuncionario({ ...modalFuncionario, email: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="email@exemplo.com" />
                  </div>
                <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-dashed border-zinc-600">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={modalFuncionario.funcao === 'caixa'} onChange={(e) => setModalFuncionario({ ...modalFuncionario, funcao: e.target.checked ? 'caixa' : '' })} className="sr-only peer" />
                    <div className="w-10 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                  <div>
                    <p className="text-sm font-bold">🧾 Operador de Caixa</p>
                    <p className={`text-[10px] ${t.textMuted}`}>Marcar se este funcionário trabalha no Frente de Caixa (PDV)</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>CEP</label>
                    <input type="text" value={modalFuncionario.cep || ''} onChange={async (e) => {
                      const val = e.target.value;
                      setModalFuncionario({ ...modalFuncionario, cep: val });
                      const cep = val.replace(/\D/g, '');
                      if (cep.length === 8) {
                        try {
                          const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                          const data = await res.json();
                          if (!data.erro) {
                            setModalFuncionario({ ...modalFuncionario, cep: cep.replace(/(\d{5})(\d{3})/, '$1-$2'), endereco: `${data.logradouro || ''}${data.complemento ? ', ' + data.complemento : ''}`, bairro: data.bairro || '', cidade: data.localidade || '', estado: data.uf || '' });
                          }
                        } catch (err) {}
                      }
                    }} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="00000-000" maxLength={9} />
                  </div>
                  <div className="w-20">
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>UF</label>
                    <select value={modalFuncionario.estado || ''} onChange={(e) => setModalFuncionario({ ...modalFuncionario, estado: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`}>
                      <option value="">UF</option>
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Endereço</label>
                  <input type="text" value={modalFuncionario.endereco || ''} onChange={(e) => setModalFuncionario({ ...modalFuncionario, endereco: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Rua, número" />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Bairro</label>
                  <input type="text" value={modalFuncionario.bairro || ''} onChange={(e) => setModalFuncionario({ ...modalFuncionario, bairro: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Bairro" />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Cidade</label>
                  <input type="text" value={modalFuncionario.cidade || ''} onChange={(e) => setModalFuncionario({ ...modalFuncionario, cidade: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Cidade" />
                </div>
                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Observações</label>
                  <textarea rows={3} value={modalFuncionario.observacoes || ''} onChange={(e) => setModalFuncionario({ ...modalFuncionario, observacoes: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Observações adicionais..." />
                </div>
              </div>
              <button onClick={salvarFuncionario} className={`w-full font-bold px-6 py-3 rounded-lg text-white transition-colors shadow-lg ${t.bgAccent} ${t.hoverAccent}`}>
                {modalFuncionario.id ? "Atualizar Funcionário" : "Adicionar Funcionário"}
              </button>
            </div>
          </div>
        )}

        {modalServico && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className={`p-8 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${t.card} ${t.border} border`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{modalServico.id ? "Editar Serviço" : "Novo Serviço"}</h2>
                <button onClick={() => setModalServico(null)} className={`p-1 rounded-md hover:bg-black/10 ${t.textMuted}`}><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Nome do Serviço</label>
                  <input type="text" value={modalServico.nome} onChange={(e) => setModalServico({ ...modalServico, nome: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Ex: Degradê Navalhado" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Preço (R$)</label>
                    <input type="text" value={modalServico.preco || ""} onChange={(e) => setModalServico({ ...modalServico, preco: parseFloat(e.target.value.replace(",", ".")) || 0 })} placeholder="0,00" className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                  </div>
                  <div className="flex-1">
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Duração (min)</label>
                    <input type="number" value={modalServico.duracao || ''} onChange={(e) => setModalServico({ ...modalServico, duracao: Number(e.target.value) })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                  </div>
                </div>
              </div>
              <button onClick={salvarServico} className={`w-full font-bold px-6 py-3 rounded-lg text-white transition-colors shadow-lg ${t.bgAccent} ${t.hoverAccent}`}>
                {modalServico.id ? "Salvar Alterações" : "Adicionar ao Catálogo"}
              </button>
            </div>
          </div>
        )}

        {modalHora && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className={`p-8 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${t.card} ${t.border} border`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Agendar para {modalHora}</h2>
                <button onClick={() => setModalHora(null)} className={`p-1 rounded-md hover:bg-black/10 ${t.textMuted}`}><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Selecione o Cliente</label>
                  <select value={clienteSelecionado} onChange={(e) => setClienteSelecionado(e.target.value)} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`}>
                    <option value="">-- Escolha um cliente --</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome} {c.telefone ? `- ${c.telefone}` : ''}</option>)}
                  </select>
                </div>
                 <div>
                   <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Selecione o Profissional</label>
                  <select value={funcionarioSelecionado} onChange={(e) => setFuncionarioSelecionado(e.target.value)} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`}>
                     {funcionarios.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                 </select>
                 </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Selecione o Serviço</label>
                  <select value={servicoSelecionado} onChange={(e) => setServicoSelecionado(e.target.value)} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`}>
                    <option value="">-- Qual o serviço? --</option>
                    {servicos.map(s => <option key={s.id} value={s.nome}>{s.nome} - {f(s.preco)}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={confirmarAgendamento} className={`w-full font-bold px-6 py-3 rounded-lg text-white transition-colors shadow-lg ${t.bgAccent} ${t.hoverAccent}`}>
                Confirmar Agendamento
              </button>
            </div>
          </div>
        )}

        {modalEdicaoAgendamento && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className={`p-8 rounded-xl shadow-2xl w-full max-w-md ${t.card} ${t.border} border overflow-y-auto max-h-[90vh]`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Editar Agendamento</h2>
                <button onClick={() => setModalEdicaoAgendamento(null)} className={`p-1 rounded-md hover:bg-black/10 ${t.textMuted}`}><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4 mb-6">
                <p className="text-sm font-bold opacity-60 italic">Cliente: {modalEdicaoAgendamento.clientes?.nome}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Mudar Data</label>
                    <input type="date" defaultValue={modalEdicaoAgendamento.data_hora.split('T')[0]} onChange={(e) => setDataEdicao(e.target.value)} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain} color-scheme-dark`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Mudar Horário</label>
                    <select defaultValue={new Date(modalEdicaoAgendamento.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} onChange={(e) => setHoraEdicao(e.target.value)} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`}>
                      {(() => { const slots = []; for (let i = loja.hora_abertura; i < loja.hora_fechamento; i++) { slots.push(`${i.toString().padStart(2, '0')}:00`); slots.push(`${i.toString().padStart(2, '0')}:30`); } slots.push(`${loja.hora_fechamento.toString().padStart(2, '0')}:00`); return slots.map(s => <option key={s} value={s}>{s}</option>); })()}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Trocar Profissional</label>
                  <select defaultValue={modalEdicaoAgendamento.funcionario_id} onChange={(e) => setFuncionarioSelecionado(e.target.value)} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`}>
                    {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Mudar Serviço</label>
                  <select defaultValue={modalEdicaoAgendamento.servico} onChange={(e) => setServicoSelecionado(e.target.value)} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`}>
                    {servicos.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={salvarAgendamentoEditado} className={`w-full font-bold px-6 py-3 rounded-lg text-white transition-colors shadow-lg ${t.bgAccent} ${t.hoverAccent}`}>
                Salvar Alterações
              </button>
            </div>
          </div>
        )}

        {/* ================= SIDEBAR DESKTOP ================= */}
        <aside className={`w-64 border-r p-6 flex flex-col hidden md:flex ${t.bgSidebar} ${t.border}`}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center font-bold shrink-0 overflow-hidden shadow-md ${t.bgAccent} border-current`}>
                {loja.logo_url ? (
                  <img src={loja.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-sm font-black uppercase">{loja.nome.substring(0, 2)}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className={`font-black text-base leading-tight truncate ${t.textMain}`}>{loja.nome}</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${t.accent}`}>Plano Pro</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 pt-3 border-t ${t.border}`}>
              <div className="flex-1"/><span className={`text-[9px] font-black uppercase tracking-[0.2em] opacity-40 ${t.textMuted}`}>Powered by</span>
              <span className={`text-[11px] font-black uppercase tracking-widest ${t.accent} opacity-70`}>WBC</span>
            </div>
            <div className="flex gap-2 mt-4 mb-2">
              <Link href="/ajuda" target="_blank" className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg font-bold text-blue-400 hover:bg-blue-500/10 transition-all text-sm"><HelpCircle className="w-4 h-4" /> Ajuda</Link>
              <button onClick={fazerLogout} className="flex-1 flex items-center justify-center gap-2 p-2 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-bold"><LogOut className="w-4 h-4" /> Sair</button>
            </div>
          </div>
          <nav className="flex-1 space-y-2">
            {tabsVisiveis.map((tab) => (
              <button key={tab} onClick={() => tab === "loja" ? window.open(`/loja/${loja.id}`, '_blank') : setActiveTab(tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === tab ? `${t.bgAccent} text-white shadow-lg` : `${t.textMuted} hover:${t.textMain} hover:bg-black/5`}`}>
                {tab === "visao-geral" && <><LayoutDashboard className="w-5 h-5" /> Visão Geral</>}
                {tab === "agenda" && <><Calendar className="w-5 h-5" /> Agenda Diária</>}
                {tab === "clientes" && <><Users className="w-5 h-5" /> Clientes</>}
                {tab === "servicos" && <><Briefcase className="w-5 h-5" /> Serviços</>}
                {tab === "produtos" && <><TrendingUp className="w-5 h-5" /> Estoque / Produtos</>}
                {tab === "pedidos" && <><ShoppingBag className="w-5 h-5" /> Pedidos{pedidos.length > 0 ? <span className={`ml-auto text-[10px] font-bold ${activeTab === "pedidos" ? 'text-white' : t.accent}`}>{pedidos.length}</span> : null}</>}
                {tab === "ordens" && <><ClipboardList className="w-5 h-5" /> Ordens de Serviço</>}
                {tab === "orcamentos" && <><FileText className="w-5 h-5" /> Orçamentos</>}
                {tab === "devolucoes" && <><RotateCcw className="w-5 h-5" /> Devoluções</>}
                {tab === "vendas_aprazo" && <><DollarSign className="w-5 h-5" /> Vendas a Prazo</>}
                {tab === "frente_caixa" && <><ShoppingCart className="w-5 h-5" /> Frente de Caixa</>}
                {tab === "loja" && <><ShoppingBag className="w-5 h-5" /> 🛒 Minha Loja</>}
                {tab === "funcionarios" && <><UserCircle className="w-5 h-5" /> Funcionários</>}
                {tab === "configuracoes" && <><Settings className="w-5 h-5" /> Configurações</>}
              </button>
            ))}
            {user?.email === 'wwbcinformatica@gmail.com' && (
              <div className="pt-8 mt-8 border-t border-zinc-800">
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 font-bold px-4">Administração Mestre</p>
                <Link href="/admin" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-amber-500 hover:bg-amber-500/10 transition-all border border-amber-500/20">
                  <Shield className="w-5 h-5" /> Painel Mestre SaaS
                </Link>
              </div>
            )}
          </nav>
          
        </aside>

        {/* ================= MOBILE BOTTOM NAV ================= */}
        <nav className={`fixed bottom-0 left-0 right-0 md:hidden flex justify-around items-center p-3 border-t z-40 backdrop-blur-md ${t.bgSidebar} ${t.border} pb-6`}>
          {[{ id: "visao-geral", icon: LayoutDashboard, label: "Início" }, { id: "agenda", icon: Calendar, label: "Agenda" }, { id: "clientes", icon: Users, label: "Clientes" }, { id: "servicos", icon: Briefcase, label: "Serviços" }, { id: "funcionarios", icon: UserCircle, label: "Equipe" }, { id: "produtos", icon: TrendingUp, label: "Produtos" }, { id: "frente_caixa", icon: ShoppingCart, label: "PDV" }, { id: "loja", icon: ShoppingBag, label: "Loja", action: "external" }, { id: "mais", icon: Menu, label: "Mais" }].filter(item => item.id !== "funcionarios" || (loja as any)?.modulo_funcionarios !== false).filter(item => item.id !== "frente_caixa" || (loja as any)?.modulo_frente_caixa !== false).map((item) => (
            <button key={item.id} onClick={() => item.id === "mais" ? setIsMenuAberto(true) : item.id === "loja" ? window.open(`/loja/${loja.id}`, '_blank') : setActiveTab(item.id)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? t.accent : t.textMuted}`}>
              <item.icon className="w-6 h-6" /><span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* ================= MOBILE MENU OVERLAY ================= */}
        {isMenuAberto && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-end animate-in fade-in duration-300">
            <div className={`w-4/5 h-full p-8 shadow-2xl flex flex-col slide-in-from-right animate-in duration-500 ${t.bgSidebar} ${t.border} border-l`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold shrink-0 overflow-hidden ${t.bgAccent} border-current`}>
                    {loja.logo_url ? <img src={loja.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-white text-xs font-black uppercase">{loja.nome.substring(0, 2)}</span>}
                  </div>
                  <div><p className={`font-black text-base leading-tight ${t.textMain}`}>{loja.nome}</p><p className={`text-[9px] font-black uppercase tracking-widest opacity-40 ${t.textMuted}`}>by WBC</p></div>
                </div>
                <button onClick={() => setIsMenuAberto(false)} className={t.textMuted}><X className="w-8 h-8" /></button>
              </div>
              <div className="flex gap-2 mb-4">
                <button onClick={fazerLogout} className="flex-1 flex items-center justify-center gap-2 p-3 text-red-400 font-bold bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-all text-sm"><LogOut className="w-5 h-5" /> Sair</button>
                <Link href="/ajuda" target="_blank" onClick={() => setIsMenuAberto(false)} className="flex-1 flex items-center justify-center gap-2 p-3 text-blue-400 font-bold bg-blue-500/10 rounded-xl hover:bg-blue-500/20 transition-all text-sm"><HelpCircle className="w-5 h-5" /> Ajuda</Link>
              </div>
              <nav className="flex-1 space-y-2">
                <button onClick={() => { setActiveTab("produtos"); setIsMenuAberto(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-sm ${activeTab === "produtos" ? `${t.bgAccent} text-white` : `${t.textMain} bg-white/5`}`}><TrendingUp className="w-5 h-5" /> Gestão de Produtos</button>
                <button onClick={() => window.open(`/loja/${loja.id}`, '_blank')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-sm ${t.textMain} bg-white/5`}><ShoppingBag className="w-5 h-5" /> Minha Loja</button>
                <button onClick={() => { setActiveTab("pedidos"); setIsMenuAberto(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-sm ${activeTab === "pedidos" ? `${t.bgAccent} text-white` : `${t.textMain} bg-white/5`}`}><ShoppingBag className="w-5 h-5" /> Pedidos Recebidos</button>
                <button onClick={() => { setActiveTab("ordens"); setIsMenuAberto(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-sm ${activeTab === "ordens" ? `${t.bgAccent} text-white` : `${t.textMain} bg-white/5`}`}><ClipboardList className="w-5 h-5" /> Ordens de Serviço</button>
                <button onClick={() => { setActiveTab("orcamentos"); setIsMenuAberto(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-sm ${activeTab === "orcamentos" ? `${t.bgAccent} text-white` : `${t.textMain} bg-white/5`}`}><FileText className="w-5 h-5" /> Orçamentos</button>
                {modulosAtivos.devolucoes !== false && (
                  <button onClick={() => { setActiveTab("devolucoes"); setIsMenuAberto(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-sm ${activeTab === "devolucoes" ? `${t.bgAccent} text-white` : `${t.textMain} bg-white/5`}`}><RotateCcw className="w-5 h-5" /> Devoluções</button>
                )}
                {modulosAtivos.vendas_aprazo !== false && (
                  <button onClick={() => { setActiveTab("vendas_aprazo"); setIsMenuAberto(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-sm ${activeTab === "vendas_aprazo" ? `${t.bgAccent} text-white` : `${t.textMain} bg-white/5`}`}><DollarSign className="w-5 h-5" /> Vendas a Prazo</button>
                )}
                {modulosAtivos.frente_caixa !== false && (
                  <button onClick={() => { setActiveTab("frente_caixa"); setIsMenuAberto(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-sm ${activeTab === "frente_caixa" ? `${t.bgAccent} text-white` : `${t.textMain} bg-white/5`}`}><ShoppingCart className="w-5 h-5" /> Frente de Caixa (PDV)</button>
                )}
                {modulosAtivos.funcionarios !== false && (
                  <button onClick={() => { setActiveTab("funcionarios"); setIsMenuAberto(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-sm ${activeTab === "funcionarios" ? `${t.bgAccent} text-white` : `${t.textMain} bg-white/5`}`}><UserCircle className="w-5 h-5" /> Equipe</button>
                )}
                <button onClick={() => { setActiveTab("configuracoes"); setIsMenuAberto(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-sm ${activeTab === "configuracoes" ? `${t.bgAccent} text-white` : `${t.textMain} bg-white/5`}`}><Settings className="w-5 h-5" /> Configurações</button>
                {user?.email === 'wwbcinformatica@gmail.com' && (
                  <div className="pt-3 mt-3 border-t border-white/10">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3 font-bold">Acesso Root</p>
                    <Link href="/admin" onClick={() => setIsMenuAberto(false)} className="w-full flex items-center gap-3 p-3 rounded-xl font-bold text-amber-500 border border-amber-500/20 bg-amber-500/5 text-sm"><Shield className="w-5 h-5" /> Painel Mestre</Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}

        {/* ================= MODAL PRODUTO ================= */}
        {modalProduto && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className={`p-8 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${t.card} ${t.border} border`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{modalProduto.id ? "Editar Produto" : "Novo Produto no Estoque"}</h2>
                <button onClick={() => setModalProduto(null)} className={`p-1 rounded-md hover:bg-black/10 ${t.textMuted}`}><X className="w-5 h-5"/></button>
              </div>
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Foto do Produto</label>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-zinc-700 bg-black/10">
                  <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center font-bold ${t.bgSidebar} ${t.accent} border-current overflow-hidden shadow-lg`}>
                    {modalProduto.imagem_url ? <img src={modalProduto.imagem_url} alt="Produto" className="w-full h-full object-cover" /> : <Plus className="w-6 h-6 opacity-20" />}
                  </div>
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={handleUploadFotoProduto} disabled={uploadingProduto} className="hidden" id="prod-upload" />
                    <label htmlFor="prod-upload" className={`inline-block px-4 py-2 rounded-lg font-bold text-xs cursor-pointer transition-all shadow-md ${uploadingProduto ? 'bg-zinc-700 opacity-50 cursor-not-allowed' : `${t.bgAccent} text-white hover:${t.hoverAccent} active:scale-95`}`}>{uploadingProduto ? "Subindo..." : "Selecionar Foto"}</label>
                  </div>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Nome do Produto</label>
                  <input type="text" value={modalProduto.nome} onChange={(e) => setModalProduto({ ...modalProduto, nome: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Ex: Pomada Efeito Matte" />
                </div>
                <div className="mb-3">
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Código Auto</label>
                  <input type="text" value={modalProduto.codigo_auto || ''} onChange={(e) => setModalProduto({ ...modalProduto, codigo_auto: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain} bg-zinc-800/30`} placeholder="Gerado automático" readOnly />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>SKU (Código do Lojista)</label>
                    <input type="text" value={modalProduto.codigo_lojista || ''} onChange={(e) => setModalProduto({ ...modalProduto, codigo_lojista: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Ex: SKU-001" />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>EAN (Código de Barras)</label>
                    <input type="text" value={modalProduto.codigo_barras || ''} onChange={(e) => setModalProduto({ ...modalProduto, codigo_barras: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Ex: 7891234567890" />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Categoria</label>
                  <input type="text" value={modalProduto.categoria || ''} onChange={(e) => setModalProduto({ ...modalProduto, categoria: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Ex: Cosméticos, Acessórios, etc" list="categorias-list" />
                  <datalist id="categorias-list">
                    {[...new Set(produtos.map(p => p.categoria).filter(Boolean))].map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Variações (ML)</label>
                  <p className={`text-[10px] mb-2 ${t.textMuted}`}>Preencha cada tamanho com ML, Preço e Estoque</p>
                  {modalProduto.variacoes && modalProduto.variacoes.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {modalProduto.variacoes.map((v, idx) => (
                        <div key={idx} className="flex gap-2 items-end">
                          <div className="flex-1 min-w-0">
                            <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>ML</label>
                            <input type="text" value={v.ml} onChange={(e) => { const novas = [...(modalProduto.variacoes || [])]; novas[idx] = { ...novas[idx], ml: e.target.value }; setModalProduto({ ...modalProduto, variacoes: novas }); }} placeholder="Ex: 50" className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Preço (R$)</label>
                            <input type="text" value={v.preco || ''} onChange={(e) => { const novas = [...(modalProduto.variacoes || [])]; novas[idx] = { ...novas[idx], preco: parseFloat(e.target.value.replace(",", ".")) || 0 }; setModalProduto({ ...modalProduto, variacoes: novas }); }} placeholder="Ex: 49,90" className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Estoque</label>
                            <input type="number" value={v.estoque || ''} onChange={(e) => { const novas = [...(modalProduto.variacoes || [])]; novas[idx] = { ...novas[idx], estoque: parseInt(e.target.value) || 0 }; setModalProduto({ ...modalProduto, variacoes: novas }); }} placeholder="Ex: 10" className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                          </div>
                          <button type="button" onClick={() => { const novas = (modalProduto.variacoes || []).filter((_, i) => i !== idx); setModalProduto({ ...modalProduto, variacoes: novas }); }} className="text-red-500 hover:text-red-700 p-2 mb-0">✕</button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <button type="button" onClick={() => setModalProduto({ ...modalProduto, variacoes: [...(modalProduto.variacoes || []), { ml: '', preco: 0, estoque: 0 }] })} className={`text-sm font-medium ${t.accent} hover:underline`}>+ Adicionar variação</button>
                </div>
                {(!modalProduto.variacoes || modalProduto.variacoes.length === 0 || modalProduto.variacoes.every(v => !v.ml)) ? (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Preço de Venda (R$)</label>
                    <input type="text" value={modalProduto.preco || ""} onChange={(e) => setModalProduto({ ...modalProduto, preco: parseFloat(e.target.value.replace(",", ".")) || 0 })} placeholder="0,00" className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                  </div>
                  <div className="w-24">
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Unidade</label>
                    <select value={modalProduto.unidade || 'UN'} onChange={(e) => setModalProduto({ ...modalProduto, unidade: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`}>
                      <option value="UN">UN</option><option value="KG">KG</option><option value="L">L</option><option value="ML">ML</option><option value="CM">CM</option><option value="KIT">KIT</option><option value="PC">PC</option><option value="CX">CX</option><option value="FD">FD</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Qtd em Estoque</label>
                    <input type="number" value={modalProduto.estoque || ''} onChange={(e) => setModalProduto({ ...modalProduto, estoque: Number(e.target.value) })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                  </div>
                </div>
                ) : (
                  <p className={`text-xs ${t.textMuted} italic`}>Preço e estoque são definidos por variação acima.</p>
                )}

              </div>
              <button onClick={salvarProduto} className={`w-full font-bold px-6 py-3 rounded-lg text-white transition-colors shadow-lg ${t.bgAccent} ${t.hoverAccent}`}>{modalProduto.id ? "Salvar Alterações" : "Cadastrar Produto"}</button>
            </div>
          </div>
        )}

        {/* ================= MODAL AJUSTE DE ESTOQUE ================= */}
        {modalEstoque && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className={`p-6 rounded-xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto ${t.card} ${t.border} border`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Ajustar Estoque</h2>
                <button onClick={() => setModalEstoque(null)} className={`p-1 rounded-md hover:bg-black/10 ${t.textMuted}`}><X className="w-5 h-5"/></button>
              </div>
              <p className={`text-sm mb-4 ${t.textMuted}`}>{modalEstoque.nome}</p>
              <p className={`text-xs mb-3 ${t.textMuted}`}>Estoque atual: <strong className={t.textMain}>{produtos.find(p => p.id === modalEstoque.produtoId)?.estoque || 0}</strong></p>
              <div className="flex gap-2 mb-4">
                <button onClick={() => setModalEstoque({...modalEstoque, tipo: 'entrada'})} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${modalEstoque.tipo === 'entrada' ? 'bg-green-500 text-white' : 'bg-black/10'}`}>Entrada</button>
                <button onClick={() => setModalEstoque({...modalEstoque, tipo: 'saida'})} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${modalEstoque.tipo === 'saida' ? 'bg-red-500 text-white' : 'bg-black/10'}`}>Saída</button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => setModalEstoque({...modalEstoque, quantidade: Math.max(1, modalEstoque.quantidade - 1)})} className="w-10 h-10 rounded-lg bg-black/10 flex items-center justify-center font-bold text-lg"><Minus className="w-4 h-4" /></button>
                <input type="number" min="1" value={modalEstoque.quantidade} onChange={(e) => setModalEstoque({...modalEstoque, quantidade: Math.max(1, parseInt(e.target.value) || 1)})} className={`w-full text-center text-2xl font-bold border rounded-lg p-3 outline-none ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                <button onClick={() => setModalEstoque({...modalEstoque, quantidade: modalEstoque.quantidade + 1})} className="w-10 h-10 rounded-lg bg-black/10 flex items-center justify-center font-bold text-lg"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={ajustarEstoque} className={`w-full font-bold py-3 rounded-lg text-white transition-colors shadow-lg ${modalEstoque.tipo === 'entrada' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                {modalEstoque.tipo === 'entrada' ? `+${modalEstoque.quantidade} Dar Entrada` : `-${modalEstoque.quantidade} Dar Saída`}
              </button>
            </div>
          </div>
        )}

        {/* ================= MODAL VENDA A PRAZO ================= */}
        {modalVenda && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className={`p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${t.card} ${t.border} border`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{modalVenda.id ? "Editar Venda" : "Nova Venda a Prazo"}</h2>
                <button onClick={() => setModalVenda(null)} className={`p-1 rounded-md hover:bg-black/10 ${t.textMuted}`}><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <label className={`block text-xs font-medium mb-1 ${t.textMuted}`}>Nome do Cliente *</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input type="text" value={modalVenda.cliente_nome} onChange={(e) => {
                        const val = e.target.value;
                        setModalVenda({...modalVenda, cliente_nome: val});
                        const encontrado = clientes.find(c => c.nome === val);
                        if (encontrado) {
                          setModalVenda({...modalVenda, cliente_nome: val, cliente_telefone: encontrado.telefone || ''});
                        }
                      }} onFocus={(e) => e.target.select()} className={`w-full border rounded-lg p-3 outline-none text-sm ${t.bgSidebar} ${t.border} ${t.textMain} ${modalVenda.cliente_nome ? 'pr-8' : ''}`} placeholder="Nome" />
                      {modalVenda.cliente_nome && (
                        <button type="button" onClick={() => setModalVenda({...modalVenda, cliente_nome: '', cliente_telefone: ''})} className={`absolute right-2 top-1/2 -translate-y-1/2 ${t.textMuted} hover:text-white text-lg leading-none`}>×</button>
                      )}
                    </div>
                    <button type="button" onClick={() => setModalBuscaCliente({ onSelect: (c: any) => setModalVenda({...modalVenda, cliente_nome: c.nome, cliente_telefone: c.telefone || ''}), termo: '' })} className={`px-3 py-2 rounded-lg border ${t.border} ${t.textMuted} hover:bg-white/10 text-sm`} title="Buscar cliente">🔍</button>
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${t.textMuted}`}>WhatsApp</label>
                  <input type="text" value={modalVenda.cliente_telefone} onChange={(e) => setModalVenda({...modalVenda, cliente_telefone: formatarTelefone(e.target.value)})} className={`w-full border rounded-lg p-3 outline-none text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="(00) 0 0000-0000" maxLength={16} />
                </div>

                {/* Produtos */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${t.textMuted}`}>Produtos</label>
                  <p className={`text-[10px] mb-2 ${t.textMuted}`}>Adicione produtos com quantidade e preço</p>
                  {modalVenda.itens && modalVenda.itens.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {modalVenda.itens.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-end">
                          <div className="flex-1 relative">
                            <input type="text" value={item.nome} onChange={(e) => { const novos = [...modalVenda.itens!]; novos[idx] = { ...novos[idx], nome: e.target.value, _sugerindo: true }; setModalVenda({ ...modalVenda, itens: novos }); }} onBlur={() => { const novos = [...modalVenda.itens!]; novos[idx] = { ...novos[idx], _sugerindo: false }; setTimeout(() => setModalVenda({ ...modalVenda, itens: novos }), 200); }} placeholder="Produto" className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                            {(item as any)._sugerindo && item.nome?.length > 0 && produtos.filter((p: any) => p.nome.toLowerCase().includes(item.nome.toLowerCase())).length > 0 && (
                              <div className={`absolute z-50 mt-1 w-full border rounded-lg shadow-2xl max-h-36 overflow-y-auto ${t.card} ${t.border}`} style={{ top: '100%' }}>
                                {produtos.filter((p: any) => p.nome.toLowerCase().includes(item.nome.toLowerCase())).slice(0, 4).map((p: any) => (
                                  <button key={p.id} type="button" onMouseDown={() => { const novos = [...modalVenda.itens!]; novos[idx] = { nome: p.nome, quantidade: 1, preco: p.preco || 0, _sugerindo: false }; setModalVenda({ ...modalVenda, itens: novos }); }} className={`w-full text-left px-3 py-2 text-sm font-medium hover:bg-white/5 border-b last:border-0 ${t.border} ${t.textMain}`}>
                                    {p.nome} <span className={`text-xs ${t.textMuted}`}>{f(p.preco)}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="w-16">
                            <input type="number" value={item.quantidade || 1} onChange={(e) => { const novos = [...modalVenda.itens!]; novos[idx] = { ...novos[idx], quantidade: parseInt(e.target.value) || 1 }; setModalVenda({ ...modalVenda, itens: novos }); }} className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} min="1" />
                          </div>
                          <div className="w-24">
                            <input type="number" value={item.preco || ''} onChange={(e) => { const novos = [...modalVenda.itens!]; novos[idx] = { ...novos[idx], preco: parseFloat(e.target.value) || 0 }; setModalVenda({ ...modalVenda, itens: novos }); }} className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="R$" />
                          </div>
                          <button type="button" onClick={() => { const novos = modalVenda.itens!.filter((_: any, i: number) => i !== idx); setModalVenda({ ...modalVenda, itens: novos }); }} className="text-red-500 hover:text-red-700 p-2">✕</button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <button type="button" onClick={() => setModalVenda({ ...modalVenda, itens: [...(modalVenda.itens || []), { nome: '', quantidade: 1, preco: 0 }] })} className={`text-sm font-medium ${t.accent} hover:underline`}>+ Adicionar produto</button>
                </div>

                {/* Serviços */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${t.textMuted}`}>Serviços</label>
                  <p className={`text-[10px] mb-2 ${t.textMuted}`}>Adicione serviços com valor</p>
                  {modalVenda.servicos && modalVenda.servicos.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {modalVenda.servicos.map((sv: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-end">
                          <div className="flex-1 relative">
                            <input type="text" value={sv.nome} onChange={(e) => { const novos = [...modalVenda.servicos!]; novos[idx] = { ...novos[idx], nome: e.target.value, _sugerindo: true }; setModalVenda({ ...modalVenda, servicos: novos }); }} onBlur={() => { const novos = [...modalVenda.servicos!]; novos[idx] = { ...novos[idx], _sugerindo: false }; setTimeout(() => setModalVenda({ ...modalVenda, servicos: novos }), 200); }} placeholder="Serviço" className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                            {(sv as any)._sugerindo && sv.nome?.length > 0 && servicos.filter((s: any) => s.nome.toLowerCase().includes(sv.nome.toLowerCase())).length > 0 && (
                              <div className={`absolute z-50 mt-1 w-full border rounded-lg shadow-2xl max-h-36 overflow-y-auto ${t.card} ${t.border}`} style={{ top: '100%' }}>
                                {servicos.filter((s: any) => s.nome.toLowerCase().includes(sv.nome.toLowerCase())).slice(0, 4).map((s: any) => (
                                  <button key={s.id} type="button" onMouseDown={() => { const novos = [...modalVenda.servicos!]; novos[idx] = { nome: s.nome, valor: s.preco || 0, _sugerindo: false }; setModalVenda({ ...modalVenda, servicos: novos }); }} className={`w-full text-left px-3 py-2 text-sm font-medium hover:bg-white/5 border-b last:border-0 ${t.border} ${t.textMain}`}>
                                    {s.nome} <span className={`text-xs ${t.textMuted}`}>{f(s.preco)}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="w-24">
                            <input type="number" value={sv.valor || ''} onChange={(e) => { const novos = [...modalVenda.servicos!]; novos[idx] = { ...novos[idx], valor: parseFloat(e.target.value) || 0 }; setModalVenda({ ...modalVenda, servicos: novos }); }} className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="R$" />
                          </div>
                          <button type="button" onClick={() => { const novos = modalVenda.servicos!.filter((_: any, i: number) => i !== idx); setModalVenda({ ...modalVenda, servicos: novos }); }} className="text-red-500 hover:text-red-700 p-2">✕</button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <button type="button" onClick={() => setModalVenda({ ...modalVenda, servicos: [...(modalVenda.servicos || []), { nome: '', valor: 0 }] })} className={`text-sm font-medium ${t.accent} hover:underline`}>+ Adicionar serviço</button>
                </div>

                {/* Total Calculado + Entrada + Parcelas */}
                <div className={`p-3 rounded-lg ${t.bgSidebar} space-y-2`}>
                  <div className="flex justify-between text-sm font-bold">
                    <span className={t.textMuted}>Subtotal (produtos + serviços)</span>
                    <span className="text-green-500">{f((modalVenda.itens || []).reduce((s: number, i: any) => s + (i.quantidade || 1) * (i.preco || 0), 0) + (modalVenda.servicos || []).reduce((s: number, sv: any) => s + (sv.valor || 0), 0))}</span>
                  </div>
                  {(modalVenda.desconto_percentual || 0) > 0 || (modalVenda.desconto_valor || 0) > 0 ? (
                    <div className="flex justify-between text-xs">
                      <span className="text-red-400">Desconto {modalVenda.desconto_percentual ? `(${modalVenda.desconto_percentual}%)` : ''}</span>
                      <span className="text-red-400">-{f((modalVenda.itens || []).reduce((s: number, i: any) => s + (i.quantidade || 1) * (i.preco || 0), 0) + (modalVenda.servicos || []).reduce((s: number, sv: any) => s + (sv.valor || 0), 0) - modalVenda.valor_total)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-base font-black border-t pt-2">
                    <span>Valor Total</span>
                    <span className="text-green-500">{f(modalVenda.valor_total)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.textMuted}`}>Valor Total (R$) *</label>
                    <input type="number" step="0.01" value={modalVenda.valor_total || ''} onChange={(e) => setModalVenda({...modalVenda, valor_total: parseFloat(e.target.value) || 0})} className={`w-full border rounded-lg p-3 outline-none text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="0,00" />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.textMuted}`}>Entrada (R$)</label>
                    <input type="number" step="0.01" value={modalVenda.valor_entrada || ''} onChange={(e) => setModalVenda({...modalVenda, valor_entrada: Math.min(parseFloat(e.target.value) || 0, modalVenda.valor_total)})} className={`w-full border rounded-lg p-3 outline-none text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="0,00" />
                  </div>
                </div>

                {/* Descontos */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.textMuted}`}>Desconto (%)</label>
                    <input type="number" min="0" max="100" step="0.5" value={modalVenda.desconto_percentual || ''} onChange={(e) => {
                      const val = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                      const sub = (modalVenda.itens || []).reduce((s: number, i: any) => s + (i.quantidade || 1) * (i.preco || 0), 0) + (modalVenda.servicos || []).reduce((s: number, sv: any) => s + (sv.valor || 0), 0);
                      const descValor = sub * (val / 100);
                      setModalVenda({...modalVenda, desconto_percentual: val, valor_total: Math.max(0, sub - descValor - (modalVenda.desconto_valor || 0))});
                    }} className={`w-full border rounded-lg p-3 outline-none text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="0%" />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.textMuted}`}>Desconto (R$)</label>
                    <input type="number" min="0" step="0.5" value={modalVenda.desconto_valor || ''} onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      const sub = (modalVenda.itens || []).reduce((s: number, i: any) => s + (i.quantidade || 1) * (i.preco || 0), 0) + (modalVenda.servicos || []).reduce((s: number, sv: any) => s + (sv.valor || 0), 0);
                      const comPercentual = sub - sub * ((modalVenda.desconto_percentual || 0) / 100);
                      setModalVenda({...modalVenda, desconto_valor: val, valor_total: Math.max(0, comPercentual - val)});
                    }}
                      className={`w-full border rounded-lg p-3 outline-none text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="0,00" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.textMuted}`}>Parcelas *</label>
                    <input type="number" min="1" max="60" value={modalVenda.numero_parcelas} onChange={(e) => {
                      const n = Math.max(1, parseInt(e.target.value) || 1);
                      if (modalVenda.customizar_datas) {
                        const novas = [...modalVenda.parcelas];
                        while (novas.length < n) {
                          const ultima = novas.length > 0 ? novas[novas.length - 1] : null;
                          const venc = ultima ? new Date(ultima.data_vencimento) : new Date();
                          venc.setDate(venc.getDate() + 30);
                          novas.push({ numero: novas.length + 1, valor: 0, data_vencimento: venc.toISOString().split('T')[0], data_pagamento: null, pago: false });
                        }
                        const ajustadas = novas.slice(0, n).map((p, i) => ({ ...p, numero: i + 1 }));
                        setModalVenda({...modalVenda, numero_parcelas: n, parcelas: ajustadas });
                      } else {
                        setModalVenda({...modalVenda, numero_parcelas: n});
                      }
                    }} className={`w-full border rounded-lg p-3 outline-none text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.textMuted}`}>Intervalo (dias)</label>
                    <select value={modalVenda.dias_intervalo} onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        const parcelas = Array.from({ length: modalVenda.numero_parcelas }, (_, i) => {
                          const venc = new Date();
                          venc.setDate(venc.getDate() + (i + 1) * 30);
                          const valorParcela = (modalVenda.valor_total - (modalVenda.valor_entrada || 0)) / modalVenda.numero_parcelas;
                          return { numero: i + 1, valor: valorParcela, data_vencimento: venc.toISOString().split('T')[0], data_pagamento: null, pago: false };
                        });
                        setModalVenda({...modalVenda, dias_intervalo: 'custom', dias_intervalo_custom: 30, data_primeiro_vencimento: '', customizar_datas: true, parcelas});
                      } else {
                        setModalVenda({...modalVenda, dias_intervalo: parseInt(val), customizar_datas: false, parcelas: []});
                      }
                    }} className={`w-full border rounded-lg p-3 outline-none text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`}>
                      <option value="15">15 dias</option>
                      <option value="30">30 dias</option>
                      <option value="45">45 dias</option>
                      <option value="60">60 dias</option>
                      <option value="90">90 dias</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                </div>
                {modalVenda.dias_intervalo === 'custom' && !modalVenda.customizar_datas && (
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.textMuted}`}>Data da Primeira Parcela</label>
                    <input type="date" value={modalVenda.data_primeiro_vencimento || ''} onChange={(e) => setModalVenda({...modalVenda, data_primeiro_vencimento: e.target.value})} className={`w-full border rounded-lg p-3 outline-none text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                  </div>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <label className={`flex items-center gap-2 text-xs font-medium mb-1 ${t.textMuted}`}>
                    <input type="checkbox" checked={modalVenda.customizar_datas || false} onChange={(e) => {
                      const checked = e.target.checked;
                      if (checked && modalVenda.parcelas.length === 0) {
                        const intervalo = typeof modalVenda.dias_intervalo === 'number' ? modalVenda.dias_intervalo : (modalVenda.dias_intervalo_custom || 30);
                        const parcelas = Array.from({ length: modalVenda.numero_parcelas }, (_, i) => {
                          const venc = new Date();
                          venc.setDate(venc.getDate() + (i + 1) * intervalo);
                          const valorParcela = (modalVenda.valor_total - (modalVenda.valor_entrada || 0)) / modalVenda.numero_parcelas;
                          return { numero: i + 1, valor: valorParcela, data_vencimento: venc.toISOString().split('T')[0], data_pagamento: null, pago: false };
                        });
                        setModalVenda({...modalVenda, customizar_datas: checked, parcelas});
                      } else {
                        setModalVenda({...modalVenda, customizar_datas: checked});
                      }
                    }} className="rounded" />
                    Definir data de cada parcela
                  </label>
                </div>
                {modalVenda.customizar_datas && modalVenda.parcelas.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <p className={`text-xs font-semibold ${t.textMuted}`}>Datas das Parcelas:</p>
                    {modalVenda.parcelas.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`text-xs font-medium w-6 ${t.textMuted}`}>{p.numero}ª</span>
                        <input type="date" value={p.data_vencimento} onChange={(e) => {
                          const novas = [...modalVenda.parcelas];
                          novas[i] = { ...novas[i], data_vencimento: e.target.value };
                          setModalVenda({...modalVenda, parcelas: novas});
                        }} className={`flex-1 border rounded-lg p-2 outline-none text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                        <span className={`text-xs font-medium ${t.textMuted}`}>{f(p.valor)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {modalVenda.valor_total > 0 && modalVenda.numero_parcelas > 0 && (
                  <>
                    <p className={`text-xs ${t.textMuted}`}>
                      Entrada: <strong className={t.textMain}>{f(modalVenda.valor_entrada || 0)}</strong>
                      {modalVenda.valor_entrada > 0 && ` (${((modalVenda.valor_entrada / modalVenda.valor_total) * 100).toFixed(0)}%)`}
                    </p>
                    <p className={`text-xs ${t.textMuted}`}>
                      {modalVenda.numero_parcelas}x de <strong className={t.textMain}>{f((modalVenda.valor_total - (modalVenda.valor_entrada || 0)) / modalVenda.numero_parcelas)}</strong>
                      {modalVenda.valor_entrada > 0 && modalVenda.dias_intervalo !== 'custom' && ` a cada ${modalVenda.dias_intervalo}d`}
                    </p>
                  </>
                )}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${t.textMuted}`}>Observação</label>
                  <textarea value={modalVenda.observacao} onChange={(e) => setModalVenda({...modalVenda, observacao: e.target.value})} rows={2} className={`w-full border rounded-lg p-3 outline-none text-sm resize-none ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Opcional" />
                </div>
              </div>
              <button onClick={salvarVenda} className={`w-full font-bold py-3 rounded-lg text-white transition-colors shadow-lg ${t.bgAccent} ${t.hoverAccent}`}>
                {modalVenda.id ? "Salvar Alterações" : "Registrar Venda"}
              </button>
            </div>
          </div>
        )}

        {/* ================= MODAL ORDEM DE SERVIÇO ================= */}
        {modalOrdem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className={`p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${t.card} ${t.border} border`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{modalOrdem.id ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}</h2>
                <button onClick={() => setModalOrdem(null)} className={`p-1 rounded-md hover:bg-black/10 ${t.textMuted}`}><X className="w-5 h-5"/></button>
              </div>

              {/* Resumo do Cliente - Read Only */}
              {modalOrdem.cliente_nome && (
                <div className={`p-4 rounded-lg mb-6 ${t.bgSidebar} ${t.border} border`}>
                  <p className={`text-sm font-medium ${t.textMain}`}>
                    <span className={t.textMuted}>Cliente:</span> {modalOrdem.cliente_nome}
                  </p>
                  {modalOrdem.cliente_cpf && <p className={`text-sm ${t.textMuted}`}>CPF: {modalOrdem.cliente_cpf}</p>}
                  {modalOrdem.cliente_endereco && <p className={`text-sm ${t.textMuted}`}>Endereço: {modalOrdem.cliente_endereco}{modalOrdem.cliente_bairro && `, ${modalOrdem.cliente_bairro}`}{modalOrdem.cliente_cidade && `, ${modalOrdem.cliente_cidade}`}</p>}
                </div>
              )}

              <div className="space-y-4 mb-6">
                {/* Cliente */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Nome do Cliente <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input type="text" value={modalOrdem.cliente_nome} onChange={(e) => {
                        const val = e.target.value;
                        setModalOrdem({ ...modalOrdem, cliente_nome: val });
                        const encontrado = clientes.find(c => c.nome === val);
                        if (encontrado) {
                          setModalOrdem({ ...modalOrdem, cliente_nome: val, cliente_cpf: encontrado.cpf || '', cliente_fone: encontrado.telefone || '', cliente_endereco: encontrado.endereco || '', cliente_cidade: encontrado.cidade || '', cliente_bairro: encontrado.bairro || '', cliente_estado: encontrado.estado || '', cliente_cep: encontrado.cep || '' });
                        }
                      }} onFocus={(e) => e.target.select()} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain} ${modalOrdem.cliente_nome ? 'pr-10' : ''}`} placeholder="Digite para buscar..." />
                      {modalOrdem.cliente_nome && (
                        <button type="button" onClick={() => setModalOrdem({ ...modalOrdem, cliente_nome: '', cliente_cpf: '', cliente_fone: '', cliente_endereco: '', cliente_cidade: '', cliente_bairro: '', cliente_estado: '', cliente_cep: '' })} className={`absolute right-2 top-1/2 -translate-y-1/2 ${t.textMuted} hover:text-white text-lg leading-none`}>×</button>
                      )}
                    </div>
                    <button type="button" onClick={() => setModalBuscaCliente({ onSelect: (c) => { setModalOrdem({ ...modalOrdem, cliente_nome: c.nome, cliente_cpf: c.cpf || '', cliente_fone: c.telefone || '', cliente_endereco: c.endereco || '', cliente_cidade: c.cidade || '', cliente_bairro: c.bairro || '', cliente_estado: c.estado || '', cliente_cep: c.cep || '' }); }})} className={`px-3 py-2 rounded-lg border ${t.border} ${t.textMuted} hover:bg-white/10 text-sm`} title="Buscar cliente">🔍</button>
                    <button onClick={() => setModalCliente({ nome: "", telefone: "", email: "", cpf: "", endereco: "", cidade: "", bairro: "", estado: "", cep: "", data_nascimento: "", observacoes: "" })} className={`px-3 py-2 rounded-lg border ${t.border} ${t.textMuted} hover:bg-white/10 text-sm`} title="Novo cliente">+</button>
                  </div>
                </div>

                {/* Datas e Situação */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Data de Emissão</label>
                    <input type="date" value={modalOrdem.data_emissao || new Date().toISOString().split('T')[0]} onChange={(e) => setModalOrdem({ ...modalOrdem, data_emissao: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Previsão de Entrega</label>
                    <input type="date" value={modalOrdem.data_entrega || ''} onChange={(e) => setModalOrdem({ ...modalOrdem, data_entrega: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Situação</label>
                    <select value={modalOrdem.situacao || 'aberto'} onChange={(e) => setModalOrdem({ ...modalOrdem, situacao: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`}>
                      <option value="aberto">Aberto</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="concluido">Concluído</option>
                      <option value="entregue">Entregue</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                {/* Marca, Modelo, Cor, Placa */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Marca</label>
                    <input type="text" value={modalOrdem.marca || ''} onChange={(e) => setModalOrdem({ ...modalOrdem, marca: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Ex: Ford" />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Modelo</label>
                    <input type="text" value={modalOrdem.modelo || ''} onChange={(e) => setModalOrdem({ ...modalOrdem, modelo: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Ex: Fiesta" />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Cor</label>
                    <input type="text" value={modalOrdem.cor || ''} onChange={(e) => setModalOrdem({ ...modalOrdem, cor: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Ex: Prata" />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Placa</label>
                    <input type="text" value={modalOrdem.placa || ''} onChange={(e) => setModalOrdem({ ...modalOrdem, placa: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="AAA-0000" />
                  </div>
                </div>

                {/* Itens / Produtos */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Itens / Produtos</label>
                  <p className={`text-[10px] mb-2 ${t.textMuted}`}>Adicione produtos com quantidade e preço</p>
                  {modalOrdem.itens && modalOrdem.itens.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {modalOrdem.itens.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-end">
                          <div className="flex-1 relative">
                            <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Produto</label>
                            <input type="text" value={item.nome} onChange={(e) => { const novos = [...modalOrdem.itens]; novos[idx] = { ...novos[idx], nome: e.target.value, _sugerindo: true }; setModalOrdem({ ...modalOrdem, itens: novos }); }} onBlur={() => { const novos = [...modalOrdem.itens]; novos[idx] = { ...novos[idx], _sugerindo: false }; setTimeout(() => setModalOrdem({ ...modalOrdem, itens: novos }), 200); }} placeholder="Descrição" className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} list="itens-produtos-ordem" />
                            {item._sugerindo && item.nome?.length > 0 && produtos.filter(p => p.nome.toLowerCase().includes(item.nome.toLowerCase())).length > 0 && (
                              <div className={`absolute z-50 mt-1 w-full border rounded-lg shadow-2xl max-h-36 overflow-y-auto ${t.card} ${t.border}`} style={{ top: '100%' }}>
                                {produtos.filter(p => p.nome.toLowerCase().includes(item.nome.toLowerCase())).slice(0, 4).map(p => (
                                  <button key={p.id} type="button" onMouseDown={() => { const novos = [...modalOrdem.itens]; novos[idx] = { nome: p.nome, quantidade: 1, preco: p.preco || 0, _sugerindo: false }; setModalOrdem({ ...modalOrdem, itens: novos }); }} className={`w-full text-left px-3 py-2 text-sm font-medium hover:bg-white/5 border-b last:border-0 ${t.border} ${t.textMain}`}>
                                    {p.nome} <span className={`text-xs ${t.textMuted}`}>{f(p.preco)}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="w-20">
                            <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Qtd</label>
                            <input type="number" value={item.quantidade || 1} onChange={(e) => { const novos = [...modalOrdem.itens]; novos[idx] = { ...novos[idx], quantidade: parseInt(e.target.value) || 1 }; setModalOrdem({ ...modalOrdem, itens: novos }); }} className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} min="1" />
                          </div>
                          <div className="w-24">
                            <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Valor (R$)</label>
                            <input type="number" value={item.preco || ''} onChange={(e) => { const novos = [...modalOrdem.itens]; novos[idx] = { ...novos[idx], preco: parseFloat(e.target.value) || 0 }; setModalOrdem({ ...modalOrdem, itens: novos }); }} className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                          </div>
                          <button type="button" onClick={() => { const novos = modalOrdem.itens.filter((_: any, i: number) => i !== idx); setModalOrdem({ ...modalOrdem, itens: novos }); }} className="text-red-500 hover:text-red-700 p-2 mb-0">✕</button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <button type="button" onClick={() => setModalOrdem({ ...modalOrdem, itens: [...(modalOrdem.itens || []), { nome: '', quantidade: 1, preco: 0 }] })} className={`text-sm font-medium ${t.accent} hover:underline`}>+ Adicionar produto</button>
                </div>

                {/* Serviços */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Serviços</label>
                  <p className={`text-[10px] mb-2 ${t.textMuted}`}>Adicione serviços com valor</p>
                  {modalOrdem.servicos && modalOrdem.servicos.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {modalOrdem.servicos.map((sv: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-end">
                          <div className="flex-1 relative">
                            <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Serviço</label>
                            <input type="text" value={sv.nome} onChange={(e) => { const novos = [...modalOrdem.servicos]; novos[idx] = { ...novos[idx], nome: e.target.value, _sugerindo: true }; setModalOrdem({ ...modalOrdem, servicos: novos }); }} onBlur={() => { const novos = [...modalOrdem.servicos]; novos[idx] = { ...novos[idx], _sugerindo: false }; setTimeout(() => setModalOrdem({ ...modalOrdem, servicos: novos }), 200); }} placeholder="Descrição do serviço" className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                            {sv._sugerindo && sv.nome?.length > 0 && servicos.filter(s => s.nome.toLowerCase().includes(sv.nome.toLowerCase())).length > 0 && (
                              <div className={`absolute z-50 mt-1 w-full border rounded-lg shadow-2xl max-h-36 overflow-y-auto ${t.card} ${t.border}`} style={{ top: '100%' }}>
                                {servicos.filter(s => s.nome.toLowerCase().includes(sv.nome.toLowerCase())).slice(0, 4).map(s => (
                                  <button key={s.id} type="button" onMouseDown={() => { const novos = [...modalOrdem.servicos]; novos[idx] = { nome: s.nome, valor: s.preco || 0, _sugerindo: false }; setModalOrdem({ ...modalOrdem, servicos: novos }); }} className={`w-full text-left px-3 py-2 text-sm font-medium hover:bg-white/5 border-b last:border-0 ${t.border} ${t.textMain}`}>
                                    {s.nome} <span className={`text-xs ${t.textMuted}`}>{f(s.preco)}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="w-28">
                            <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Valor (R$)</label>
                            <input type="number" value={sv.valor || ''} onChange={(e) => { const novos = [...modalOrdem.servicos]; novos[idx] = { ...novos[idx], valor: parseFloat(e.target.value) || 0 }; setModalOrdem({ ...modalOrdem, servicos: novos }); }} className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                          </div>
                          <button type="button" onClick={() => { const novos = modalOrdem.servicos.filter((_: any, i: number) => i !== idx); setModalOrdem({ ...modalOrdem, servicos: novos }); }} className="text-red-500 hover:text-red-700 p-2 mb-0">✕</button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <button type="button" onClick={() => setModalOrdem({ ...modalOrdem, servicos: [...(modalOrdem.servicos || []), { nome: '', valor: 0 }] })} className={`text-sm font-medium ${t.accent} hover:underline`}>+ Adicionar serviço</button>
                </div>

                {/* Total e Forma de Pagamento */}
                <div className="space-y-3">
                  {/* Subtotal automático */}
                  <div className={`p-4 rounded-xl border ${t.border} bg-white/5`}>
                    <div className="flex justify-between items-center text-sm">
                      <span className={t.textMuted}>Subtotal (itens + serviços)</span>
                      <span className="font-bold">{f(ordemSubtotal)}</span>
                    </div>
                    {/* Descontos */}
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Desconto (%)</label>
                        <input type="number" min="0" max="100" step="0.5" value={modalOrdem.desconto_percentual || ''} onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setModalOrdem({ ...modalOrdem, desconto_percentual: val });
                        }} className={`w-full border rounded-lg p-2 text-sm outline-none ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="0" />
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Desconto (R$)</label>
                        <input type="number" min="0" step="0.5" value={modalOrdem.desconto_valor || ''} onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setModalOrdem({ ...modalOrdem, desconto_valor: val });
                        }} className={`w-full border rounded-lg p-2 text-sm outline-none ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="0,00" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-lg font-black mt-3 pt-3 border-t border-dashed">
                      <span>Total</span>
                      <span className="text-green-500">{f(ordemTotal)}</span>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Forma de Pagamento</label>
                    <select value={modalOrdem.forma_pagamento || ''} onChange={(e) => setModalOrdem({ ...modalOrdem, forma_pagamento: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`}>
                      <option value="">Selecione</option>
                      <option value="dinheiro">💵 Dinheiro</option>
                      <option value="pix">📱 Pix</option>
                      <option value="credito">💳 Cartão de Crédito</option>
                      <option value="debito">💳 Cartão de Débito</option>
                      <option value="boleto">📄 Boleto</option>
                    </select>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Observações</label>
                  <textarea rows={3} value={modalOrdem.observacoes || ''} onChange={(e) => setModalOrdem({ ...modalOrdem, observacoes: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Observações adicionais..." />
                </div>
              </div>
              <button onClick={salvarOrdem} className={`w-full font-bold px-6 py-3 rounded-lg text-white transition-colors shadow-lg ${t.bgAccent} ${t.hoverAccent}`}>
                {modalOrdem.id ? "Salvar Alterações" : "Criar Ordem de Serviço"}
              </button>
            </div>
          </div>
        )}

        {/* ================= MODAL ORÇAMENTO ================= */}
        {modalOrcamento && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className={`p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${t.card} ${t.border} border`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{modalOrcamento.id ? "Editar Orçamento" : "Novo Orçamento"}</h2>
                <button onClick={() => setModalOrcamento(null)} className={`p-1 rounded-md hover:bg-black/10 ${t.textMuted}`}><X className="w-5 h-5"/></button>
              </div>

              {/* Resumo do Cliente - Read Only */}
              {modalOrcamento.cliente_nome && (
                <div className={`p-4 rounded-lg mb-6 ${t.bgSidebar} ${t.border} border`}>
                  <p className={`text-sm font-medium ${t.textMain}`}>
                    <span className={t.textMuted}>Cliente:</span> {modalOrcamento.cliente_nome}
                  </p>
                  {modalOrcamento.cliente_cpf && <p className={`text-sm ${t.textMuted}`}>CPF: {modalOrcamento.cliente_cpf}</p>}
                  {modalOrcamento.cliente_endereco && <p className={`text-sm ${t.textMuted}`}>Endereço: {modalOrcamento.cliente_endereco}{modalOrcamento.cliente_bairro && `, ${modalOrcamento.cliente_bairro}`}{modalOrcamento.cliente_cidade && `, ${modalOrcamento.cliente_cidade}`}</p>}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Nome do Cliente <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input type="text" value={modalOrcamento.cliente_nome} onChange={(e) => {
                        const val = e.target.value;
                        setModalOrcamento({ ...modalOrcamento, cliente_nome: val });
                        const encontrado = clientes.find(c => c.nome === val);
                        if (encontrado) {
                          setModalOrcamento({ ...modalOrcamento, cliente_nome: val, cliente_cpf: encontrado.cpf || '', cliente_endereco: encontrado.endereco || '', cliente_cidade: encontrado.cidade || '', cliente_bairro: encontrado.bairro || '', cliente_estado: encontrado.estado || '', cliente_cep: encontrado.cep || '', cliente_fone: encontrado.telefone || '' });
                        }
                      }} onFocus={(e) => e.target.select()} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain} ${modalOrcamento.cliente_nome ? 'pr-10' : ''}`} placeholder="Digite para buscar..." />
                      {modalOrcamento.cliente_nome && (
                        <button type="button" onClick={() => setModalOrcamento({ ...modalOrcamento, cliente_nome: '', cliente_cpf: '', cliente_fone: '', cliente_endereco: '', cliente_cidade: '', cliente_bairro: '', cliente_estado: '', cliente_cep: '' })} className={`absolute right-2 top-1/2 -translate-y-1/2 ${t.textMuted} hover:text-white text-lg leading-none`}>×</button>
                      )}
                    </div>
                    <button type="button" onClick={() => setModalBuscaCliente({ onSelect: (c) => { setModalOrcamento({ ...modalOrcamento, cliente_nome: c.nome, cliente_cpf: c.cpf || '', cliente_endereco: c.endereco || '', cliente_cidade: c.cidade || '', cliente_bairro: c.bairro || '', cliente_estado: c.estado || '', cliente_cep: c.cep || '', cliente_fone: c.telefone || '' }); }})} className={`px-3 py-2 rounded-lg border ${t.border} ${t.textMuted} hover:bg-white/10 text-sm`} title="Buscar cliente">🔍</button>
                    <button onClick={() => setModalCliente({ nome: "", telefone: "", email: "", cpf: "", endereco: "", cidade: "", bairro: "", estado: "", cep: "", data_nascimento: "", observacoes: "" })} className={`px-3 py-2 rounded-lg border ${t.border} ${t.textMuted} hover:bg-white/10 text-sm`} title="Novo cliente">+</button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Data de Emissão</label>
                  <input type="date" value={modalOrcamento.data_emissao || new Date().toISOString().split('T')[0]} onChange={(e) => setModalOrcamento({ ...modalOrcamento, data_emissao: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Validade (dias)</label>
                  <input type="number" min="1" value={modalOrcamento.validade ?? 7} onChange={(e) => setModalOrcamento({ ...modalOrcamento, validade: parseInt(e.target.value) || 7 })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                </div>

                {/* Vendedor */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Vendedor</label>
                  <input type="text" value={modalOrcamento.vendedor || ''} onChange={(e) => setModalOrcamento({ ...modalOrcamento, vendedor: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Nome do vendedor" />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Itens / Produtos</label>
                  <p className={`text-[10px] mb-2 ${t.textMuted}`}>Adicione produtos com quantidade e preço</p>
                  {modalOrcamento.itens && modalOrcamento.itens.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {modalOrcamento.itens.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-end">
                          <div className="flex-1 relative">
                            <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Produto</label>
                            <input type="text" value={item.nome} onChange={(e) => { const novos = [...modalOrcamento.itens]; novos[idx] = { ...novos[idx], nome: e.target.value, _sugerindo: true }; setModalOrcamento({ ...modalOrcamento, itens: novos }); }} onBlur={() => { const novos = [...modalOrcamento.itens]; novos[idx] = { ...novos[idx], _sugerindo: false }; setTimeout(() => setModalOrcamento({ ...modalOrcamento, itens: novos }), 200); }} placeholder="Descrição" className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                            {item._sugerindo && item.nome?.length > 0 && produtos.filter(p => p.nome.toLowerCase().includes(item.nome.toLowerCase())).length > 0 && (
                              <div className={`absolute z-50 mt-1 w-full border rounded-lg shadow-2xl max-h-36 overflow-y-auto ${t.card} ${t.border}`} style={{ top: '100%' }}>
                                {produtos.filter(p => p.nome.toLowerCase().includes(item.nome.toLowerCase())).slice(0, 4).map(p => (
                                  <button key={p.id} type="button" onMouseDown={() => { const novos = [...modalOrcamento.itens]; novos[idx] = { nome: p.nome, quantidade: 1, preco: p.preco || 0, _sugerindo: false }; setModalOrcamento({ ...modalOrcamento, itens: novos }); }} className={`w-full text-left px-3 py-2 text-sm font-medium hover:bg-white/5 border-b last:border-0 ${t.border} ${t.textMain}`}>
                                    {p.nome} <span className={`text-xs ${t.textMuted}`}>{f(p.preco)}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="w-20">
                            <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Qtd</label>
                            <input type="number" value={item.quantidade || 1} onChange={(e) => { const novos = [...modalOrcamento.itens]; novos[idx] = { ...novos[idx], quantidade: parseInt(e.target.value) || 1 }; setModalOrcamento({ ...modalOrcamento, itens: novos }); }} className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} min="1" />
                          </div>
                          <div className="w-24">
                            <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Preço (R$)</label>
                            <input type="number" value={item.preco || ''} onChange={(e) => { const novos = [...modalOrcamento.itens]; novos[idx] = { ...novos[idx], preco: parseFloat(e.target.value) || 0 }; setModalOrcamento({ ...modalOrcamento, itens: novos }); }} className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                          </div>
                          <button type="button" onClick={() => { const novos = modalOrcamento.itens.filter((_: any, i: number) => i !== idx); setModalOrcamento({ ...modalOrcamento, itens: novos }); }} className="text-red-500 hover:text-red-700 p-2 mb-0">✕</button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <button type="button" onClick={() => setModalOrcamento({ ...modalOrcamento, itens: [...(modalOrcamento.itens || []), { nome: '', quantidade: 1, preco: 0 }] })} className={`text-sm font-medium ${t.accent} hover:underline`}>+ Adicionar produto</button>
                </div>

                {/* Serviços */}
                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Serviços</label>
                  <p className={`text-[10px] mb-2 ${t.textMuted}`}>Adicione serviços com valor</p>
                  {modalOrcamento.servicos && modalOrcamento.servicos.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {modalOrcamento.servicos.map((sv: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-end">
                          <div className="flex-1 relative">
                            <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Serviço</label>
                            <input type="text" value={sv.nome} onChange={(e) => { const novos = [...modalOrcamento.servicos]; novos[idx] = { ...novos[idx], nome: e.target.value, _sugerindo: true }; setModalOrcamento({ ...modalOrcamento, servicos: novos }); }} onBlur={() => { const novos = [...modalOrcamento.servicos]; novos[idx] = { ...novos[idx], _sugerindo: false }; setTimeout(() => setModalOrcamento({ ...modalOrcamento, servicos: novos }), 200); }} placeholder="Descrição do serviço" className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                            {sv._sugerindo && sv.nome?.length > 0 && servicos.filter(s => s.nome.toLowerCase().includes(sv.nome.toLowerCase())).length > 0 && (
                              <div className={`absolute z-50 mt-1 w-full border rounded-lg shadow-2xl max-h-36 overflow-y-auto ${t.card} ${t.border}`} style={{ top: '100%' }}>
                                {servicos.filter(s => s.nome.toLowerCase().includes(sv.nome.toLowerCase())).slice(0, 4).map(s => (
                                  <button key={s.id} type="button" onMouseDown={() => { const novos = [...modalOrcamento.servicos]; novos[idx] = { nome: s.nome, valor: s.preco || 0, _sugerindo: false }; setModalOrcamento({ ...modalOrcamento, servicos: novos }); }} className={`w-full text-left px-3 py-2 text-sm font-medium hover:bg-white/5 border-b last:border-0 ${t.border} ${t.textMain}`}>
                                    {s.nome} <span className={`text-xs ${t.textMuted}`}>{f(s.preco)}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="w-28">
                            <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Valor (R$)</label>
                            <input type="number" value={sv.valor || ''} onChange={(e) => { const novos = [...modalOrcamento.servicos]; novos[idx] = { ...novos[idx], valor: parseFloat(e.target.value) || 0 }; setModalOrcamento({ ...modalOrcamento, servicos: novos }); }} className={`w-full border rounded-lg p-2 text-sm ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                          </div>
                          <button type="button" onClick={() => { const novos = modalOrcamento.servicos.filter((_: any, i: number) => i !== idx); setModalOrcamento({ ...modalOrcamento, servicos: novos }); }} className="text-red-500 hover:text-red-700 p-2 mb-0">✕</button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <button type="button" onClick={() => setModalOrcamento({ ...modalOrcamento, servicos: [...(modalOrcamento.servicos || []), { nome: '', valor: 0 }] })} className={`text-sm font-medium ${t.accent} hover:underline`}>+ Adicionar serviço</button>
                </div>

                {/* Total e Forma de Pagamento */}
                <div className="space-y-3">
                  <div className={`p-4 rounded-xl border ${t.border} bg-white/5`}>
                    <div className="flex justify-between items-center text-sm">
                      <span className={t.textMuted}>Subtotal (itens + serviços)</span>
                      <span className="font-bold">{f(orcSubtotal)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Desconto (%)</label>
                        <input type="number" min="0" max="100" step="0.5" value={modalOrcamento.desconto_percentual || ''} onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setModalOrcamento({ ...modalOrcamento, desconto_percentual: val });
                        }} className={`w-full border rounded-lg p-2 text-sm outline-none ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="0" />
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold mb-1 ${t.textMuted}`}>Desconto (R$)</label>
                        <input type="number" min="0" step="0.5" value={modalOrcamento.desconto_valor || ''} onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setModalOrcamento({ ...modalOrcamento, desconto_valor: val });
                        }} className={`w-full border rounded-lg p-2 text-sm outline-none ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="0,00" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-lg font-black mt-3 pt-3 border-t border-dashed">
                      <span>Total</span>
                      <span className="text-green-500">{f(orcTotal)}</span>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Forma de Pagamento</label>
                    <select value={modalOrcamento.forma_pagamento || ''} onChange={(e) => setModalOrcamento({ ...modalOrcamento, forma_pagamento: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`}>
                      <option value="">Selecione</option>
                      <option value="dinheiro">💵 Dinheiro</option>
                      <option value="pix">📱 Pix</option>
                      <option value="credito">💳 Cartão de Crédito</option>
                      <option value="debito">💳 Cartão de Débito</option>
                      <option value="boleto">📄 Boleto</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Observações</label>
                  <textarea rows={3} value={modalOrcamento.observacoes || ''} onChange={(e) => setModalOrcamento({ ...modalOrcamento, observacoes: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Observações adicionais..." />
                </div>
              </div>
              <button onClick={salvarOrcamento} className={`w-full font-bold px-6 py-3 rounded-lg text-white transition-colors shadow-lg ${t.bgAccent} ${t.hoverAccent}`}>
                {modalOrcamento.id ? "Salvar Alterações" : "Criar Orçamento"}
              </button>
            </div>
          </div>
        )}

        {/* ================= MODAL DEVOLUÇÃO ================= */}
        {modalDevolucao && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className={`p-8 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${t.card} ${t.border} border`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{modalDevolucao.id ? "Editar Devolução" : "Nova Devolução"}</h2>
                <button onClick={() => setModalDevolucao(null)} className={`p-1 rounded-md hover:bg-black/10 ${t.textMuted}`}><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Nome do Cliente *</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input type="text" value={modalDevolucao.cliente_nome} onChange={(e) => {
                        const nome = e.target.value;
                        setModalDevolucao({ ...modalDevolucao, cliente_nome: nome });
                        const cliente = clientes.find(c => c.nome.toLowerCase() === nome.toLowerCase());
                        if (cliente) {
                          setModalDevolucao({ ...modalDevolucao, cliente_nome: cliente.nome, cliente_telefone: cliente.telefone || '' });
                        }
                      }} onFocus={(e) => e.target.select()} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain} ${modalDevolucao.cliente_nome ? 'pr-10' : ''}`} placeholder="Nome do cliente" />
                      {modalDevolucao.cliente_nome && (
                        <button type="button" onClick={() => setModalDevolucao({ ...modalDevolucao, cliente_nome: '', cliente_telefone: '' })} className={`absolute right-2 top-1/2 -translate-y-1/2 ${t.textMuted} hover:text-white text-lg leading-none`}>×</button>
                      )}
                    </div>
                    <button type="button" onClick={() => setModalBuscaCliente({ onSelect: (c) => { setModalDevolucao({ ...modalDevolucao, cliente_nome: c.nome, cliente_telefone: c.telefone || '' }); }})} className={`px-3 py-2 rounded-lg border ${t.border} ${t.textMuted} hover:bg-white/10 text-sm`} title="Buscar cliente">🔍</button>
                    <button onClick={() => setModalCliente({ nome: modalDevolucao.cliente_nome || '', telefone: modalDevolucao.cliente_telefone || '', fromDevolucao: true })} className={`px-3 py-2 rounded-lg border ${t.border} ${t.textMuted} hover:bg-white/10 text-sm`} title="Cadastrar novo cliente">+</button>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Telefone do Cliente *</label>
                  <input type="text" value={modalDevolucao.cliente_telefone} onChange={(e) => setModalDevolucao({ ...modalDevolucao, cliente_telefone: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="(00) 0 0000-0000" />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Produto *</label>
                  <input type="text" value={modalDevolucao.produto_nome} onChange={(e) => setModalDevolucao({ ...modalDevolucao, produto_nome: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Nome do produto devolvido" list="produtos-list" />
                  <datalist id="produtos-list">
                    {produtos.map(p => <option key={p.id} value={p.nome} />)}
                  </datalist>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Motivo da Devolução *</label>
                  <textarea rows={3} value={modalDevolucao.motivo} onChange={(e) => setModalDevolucao({ ...modalDevolucao, motivo: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Descreva o motivo: produto com defeito, avaria, erro no pedido..." />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Observação</label>
                  <textarea rows={2} value={modalDevolucao.observacao} onChange={(e) => setModalDevolucao({ ...modalDevolucao, observacao: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Observações adicionais..." />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Data de Recolhimento</label>
                    <input type="date" value={modalDevolucao.data_recolhimento} onChange={(e) => setModalDevolucao({ ...modalDevolucao, data_recolhimento: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} />
                  </div>
                  <div className="flex-1">
                    <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Prazo (dias)</label>
                    <input type="number" value={modalDevolucao.prazo_resolucao || ''} onChange={(e) => setModalDevolucao({ ...modalDevolucao, prazo_resolucao: parseInt(e.target.value) || 0 })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="7" />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Tipo de Devolução</label>
                  <select value={modalDevolucao.tipo_resolucao} onChange={(e) => setModalDevolucao({ ...modalDevolucao, tipo_resolucao: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`}>
                    <option value="dinheiro">💵 Reembolso em Dinheiro</option>
                    <option value="pix">📱 Reembolso via Pix</option>
                    <option value="link">🔗 Link de Pagamento</option>
                    <option value="produto">📦 Troca por Outro Produto</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Mensagem do Lojista</label>
                  <textarea rows={2} value={modalDevolucao.mensagem_lojista} onChange={(e) => setModalDevolucao({ ...modalDevolucao, mensagem_lojista: e.target.value })} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Mensagem interna ou observação para o cliente..." />
                </div>
              </div>
              <button onClick={salvarDevolucao} className={`w-full font-bold px-6 py-3 rounded-lg text-white transition-colors shadow-lg ${t.bgAccent} ${t.hoverAccent}`}>
                {modalDevolucao.id ? "Salvar Alterações" : "Registrar Devolução"}
              </button>
            </div>
          </div>
        )}

        {/* ================= MAIN CONTENT ================= */}
        <main className={`flex-1 p-2 md:p-8 overflow-y-auto pt-24 md:pt-8 pb-32 md:pb-8`}>
          <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {activeTab !== "visao-geral" && (
                <button onClick={() => setActiveTab("visao-geral")} className="md:hidden p-2 rounded-lg hover:bg-black/10 transition-colors shrink-0" title="Voltar">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-xl md:text-3xl font-bold capitalize truncate">{activeTab.replace("-", " ")}</h1>
            </div>
            {(activeTab === "clientes" || activeTab === "servicos" || activeTab === "produtos" || activeTab === "ordens" || activeTab === "orcamentos" || activeTab === "devolucoes" || activeTab === "funcionarios" || activeTab === "vendas_aprazo") && (
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                <button onClick={() => { if (activeTab === "clientes") setModalCliente({ nome: "", telefone: "", email: "", cpf: "", endereco: "", cidade: "", bairro: "", estado: "", cep: "", data_nascimento: "", observacoes: "" }); else if (activeTab === "servicos") setModalServico({ nome: "", preco: 0, duracao: 30 }); else if (activeTab === "produtos") setModalProduto({ nome: "", preco: 0, estoque: 0, categoria: "", unidade: "UN", variacoes: [], codigo_auto: "", codigo_lojista: "", codigo_barras: "" }); else if (activeTab === "ordens") setModalOrdem({ cliente_nome: "", cliente_cpf: "", cliente_endereco: "", cliente_fone: "", cliente_cidade: "", placa: "", marca: "", modelo: "", cor: "", produto: "", situacao: "aberto", data_entrega: "", itens: [], servicos: [], total: 0, desconto_percentual: 0, desconto_valor: 0, forma_pagamento: "", observacoes: "" }); else if (activeTab === "orcamentos") setModalOrcamento({ cliente_nome: "", cliente_cpf: "", cliente_endereco: "", cliente_cidade: "", vendedor: "", validade: 7, observacoes: "", itens: [], servicos: [], total: 0, desconto_percentual: 0, desconto_valor: 0, forma_pagamento: "" }); else if (activeTab === "devolucoes") setModalDevolucao({ produto_nome: "", cliente_nome: "", cliente_telefone: "", motivo: "", observacao: "", data_recolhimento: "", prazo_resolucao: 7, tipo_resolucao: "dinheiro", status: "aberto", mensagem_lojista: "" }); else if (activeTab === "funcionarios") setModalFuncionario({ nome: "", telefone: "", email: "", endereco: "", cidade: "", bairro: "", estado: "", cep: "", observacoes: "", funcao: "" }); else if (activeTab === "vendas_aprazo") setModalVenda({ cliente_nome: "", cliente_telefone: "", valor_total: 0, valor_entrada: 0, numero_parcelas: 1, dias_intervalo: 30, observacao: "", parcelas: [], customizar_datas: false, desconto_percentual: 0, desconto_valor: 0, itens: [], servicos: [] }); }} className="shrink-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all text-xs sm:text-sm font-bold active:scale-95 shadow-lg shadow-amber-500/20">
                    <Plus className="w-4 h-4 shrink-0" /> <span className="truncate">{activeTab === "ordens" ? "Nova Ordem" : activeTab === "orcamentos" ? "Novo Orçamento" : activeTab === "devolucoes" ? "Nova Devolução" : activeTab === "produtos" ? "Novo Produto" : activeTab === "funcionarios" ? "Novo Funcionário" : activeTab === "vendas_aprazo" ? "Nova Venda" : `Novo ${activeTab.slice(0, -1)}`}</span>
                  </button>
                  <button onClick={imprimirRelatorio} className="shrink-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-all text-xs sm:text-sm font-bold active:scale-95">
                    <Printer className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Relatório (PDF)</span><span className="sm:inline">PDF</span>
                  </button>
              </div>
            )}
          </header>

          {/* ================= TICKER / AVISO ROLANTE ================= */}
          {(loja as any).mensagem_ticker && (
            <div className={`relative overflow-hidden rounded-xl mb-6 border ${t.border}`} style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)' }}>
              <div className="flex items-center">
                <div className={`shrink-0 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest ${t.bgAccent} text-white`}>
                  📢 AVISO
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className={`whitespace-nowrap text-sm font-semibold ${t.textMain} py-2.5 px-4`} style={{ display: 'inline-block', animation: 'ticker-scroll 20s linear infinite' }}>
                    {(loja as any).mensagem_ticker}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{(loja as any).mensagem_ticker}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{(loja as any).mensagem_ticker}
                  </div>
                </div>
              </div>
            </div>
          )}

        {activeTab === "visao-geral" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div 
                className={`p-6 rounded-xl border shadow-sm relative group cursor-pointer ${t.card} ${t.border}`}
                onMouseEnter={() => setMostrarDetalhesClientes(true)}
                onMouseLeave={() => setMostrarDetalhesClientes(false)}
                onClick={() => setActiveTab("clientes")}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className={`text-sm font-medium ${t.textMuted}`}>Total de Clientes</p>
                    <h3 className="text-4xl font-bold">{clientes.length}</h3>
                  </div>
                  <div className={`p-3 rounded-lg bg-white/10`}><Users className={`w-6 h-6 ${t.accent}`} /></div>
                </div>
                <p className={`text-xs ${t.textMuted}`}>Cadastrados na base de dados</p>
                {mostrarDetalhesClientes && clientes.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-xl shadow-2xl z-50 border animate-in fade-in slide-in-from-top-2 ${t.card} ${t.border}`}>
                    <p className="text-xs font-bold uppercase mb-2 border-b pb-1.5 opacity-50">Últimos Clientes</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {clientes.slice(0, 5).map(c => (
                        <div key={c.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0">
                          <span className="font-bold truncate">{c.nome}</span>
                          <span className="opacity-80 shrink-0 ml-2">{new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div 
                className={`p-6 rounded-xl border shadow-sm relative group cursor-pointer ${t.card} ${t.border}`}
                onMouseEnter={() => setMostrarDetalhesPedidos(true)}
                onMouseLeave={() => setMostrarDetalhesPedidos(false)}
                onClick={() => setActiveTab("pedidos")}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className={`text-sm font-medium ${t.textMuted}`}>Total de Pedidos</p>
                    <h3 className="text-4xl font-bold">{pedidos.length}</h3>
                  </div>
                  <div className={`p-3 rounded-lg bg-white/10`}><ShoppingBag className={`w-6 h-6 ${t.accent}`} /></div>
                </div>
                <p className={`text-xs ${t.textMuted}`}>Pedidos realizados na loja virtual</p>
                {mostrarDetalhesPedidos && pedidos.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-xl shadow-2xl z-50 border animate-in fade-in slide-in-from-top-2 ${t.card} ${t.border}`}>
                    <p className="text-xs font-bold uppercase mb-2 border-b pb-1.5 opacity-50">Últimos Pedidos</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {pedidos.slice(0, 5).map(p => (
                        <div key={p.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0">
                          <span className="font-bold truncate">{p.cliente_nome}</span>
                          <span className="opacity-80 shrink-0 ml-2">R$ {p.total},00</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div 
                className={`p-6 rounded-xl border shadow-sm relative group cursor-pointer ${t.card} ${t.border}`}
                onMouseEnter={() => setMostrarDetalhesHoje(true)}
                onMouseLeave={() => setMostrarDetalhesHoje(false)}
                onClick={() => { setActiveTab("agenda"); setVisualizacaoAgenda("dia"); }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className={`text-sm font-medium ${t.textMuted}`}>Agendamentos Hoje</p>
                    <h3 className="text-4xl font-bold">{agendamentos.filter(a => new Date(a.data_hora).toDateString() === new Date().toDateString()).length}</h3>
                  </div>
                  <div className={`p-3 rounded-lg bg-white/10`}><Calendar className={`w-6 h-6 ${t.accent}`} /></div>
                </div>
                <p className={`text-xs ${t.textMuted}`}>Pessoas que virão hoje</p>

                {mostrarDetalhesHoje && (
                  <div className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-xl shadow-2xl z-50 border animate-in fade-in slide-in-from-top-2 ${t.card} ${t.border}`}>
                    <p className="text-xs font-bold uppercase mb-2 border-b pb-1.5 opacity-50">Lista de Hoje</p>
                     <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                       {agendamentos
                         .filter(a => new Date(a.data_hora).toDateString() === new Date().toDateString())
                         .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
                         .map(ag => {
                           const funcionario = funcionarios.find(f => f.id === ag.funcionario_id);
                           return (
                             <div key={ag.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0">
                               <div className="flex-1 min-w-0">
                                 <span className="font-bold truncate block">{ag.clientes?.nome}</span>
                                 <span className="text-[10px] opacity-60">{funcionario?.nome || "Funcionário"} - {ag.servico}</span>
                               </div>
                               <span className="font-bold text-amber-400 shrink-0 ml-2">{new Date(ag.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                             </div>
                           );
                        })}
                      {agendamentos.filter(a => new Date(a.data_hora).toDateString() === new Date().toDateString()).length === 0 && (
                        <p className="text-xs opacity-50 italic text-center py-2">Ninguém agendado para hoje ainda.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div 
                className={`p-6 rounded-xl border shadow-sm relative group cursor-pointer ${t.card} ${t.border}`}
                onMouseEnter={() => setMostrarDetalhesMes(true)}
                onMouseLeave={() => setMostrarDetalhesMes(false)}
                onClick={() => { setActiveTab("agenda"); setVisualizacaoAgenda("mes"); }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className={`text-sm font-medium ${t.textMuted}`}>Agendamentos do Mês</p>
                    <h3 className="text-4xl font-bold">{agendamentos.filter(a => {
                      const hoje = new Date();
                      const dataAg = new Date(a.data_hora);
                      return dataAg.getMonth() === hoje.getMonth() && dataAg.getFullYear() === hoje.getFullYear();
                    }).length}</h3>
                  </div>
                  <div className={`p-3 rounded-lg bg-white/10`}><CalendarDays className={`w-6 h-6 ${t.accent}`} /></div>
                </div>
                <p className={`text-xs ${t.textMuted}`}>Total agendado neste mês</p>

                {mostrarDetalhesMes && (
                  <div className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-xl shadow-2xl z-50 border animate-in fade-in slide-in-from-top-2 ${t.card} ${t.border}`}>
                    <p className="text-xs font-bold uppercase mb-2 border-b pb-1.5 opacity-50">Agenda do Mês</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {agendamentos
                        .filter(a => {
                          const hoje = new Date();
                           const dataAg = new Date(a.data_hora);
                           return dataAg.getMonth() === hoje.getMonth() && dataAg.getFullYear() === hoje.getFullYear();
                         })
                         .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
                         .map(ag => {
                           const dataAg = new Date(ag.data_hora);
                           const funcionario = funcionarios.find(f => f.id === ag.funcionario_id);
                           return (
                             <div key={ag.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0">
                               <div className="flex-1 min-w-0">
                                 <span className="font-bold truncate block">{ag.clientes?.nome}</span>
                                 <span className="text-[10px] opacity-60">{funcionario?.nome || "Func"} - {ag.servico}</span>
                               </div>
                               <span className="font-bold text-amber-400 shrink-0 ml-2">{dataAg.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} {dataAg.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                             </div>
                           );
                        })}
                      {agendamentos.filter(a => {
                        const hoje = new Date();
                        const dataAg = new Date(a.data_hora);
                        return dataAg.getMonth() === hoje.getMonth() && dataAg.getFullYear() === hoje.getFullYear();
                      }).length === 0 && (
                        <p className="text-xs opacity-50 italic text-center py-2">Nenhum agendamento neste mês.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`border rounded-xl p-6 shadow-sm ${t.card} ${t.border}`}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">Desempenho Semanal</h2>
                  <p className={`text-sm ${t.textMuted}`}>Faturamento estimado baseado nos agendamentos</p>
                </div>
                <div className={`flex items-center gap-2 text-sm font-bold ${t.accent}`}>
                  <TrendingUp className="w-4 h-4" /> +12% vs última semana
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosGrafico}>
                    <defs>
                      <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={loja.tema === 'dark-gold' ? '#f59e0b' : '#3b82f6'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={loja.tema === 'dark-gold' ? '#f59e0b' : '#3b82f6'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={loja.tema === 'dark-gold' ? '#333' : '#eee'} />
                    <XAxis 
                      dataKey="dia" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: loja.tema === 'dark-gold' ? '#71717a' : '#64748b', fontSize: 12 }} 
                    />
                    <YAxis 
                      hide={!mostrarReceita}
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: loja.tema === 'dark-gold' ? '#71717a' : '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: loja.tema === 'dark-gold' ? '#18181b' : '#fff', 
                        borderColor: loja.tema === 'dark-gold' ? '#3f3f46' : '#e2e8f0',
                        color: loja.tema === 'dark-gold' ? '#fff' : '#000',
                        borderRadius: '8px'
                      }}
                      itemStyle={{ color: loja.tema === 'dark-gold' ? '#f59e0b' : '#3b82f6' }}
                      formatter={(value: any) => [mostrarReceita ? `R$ ${value},00` : "••••••", "Receita"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="valor" 
                      stroke={loja.tema === 'dark-gold' ? '#f59e0b' : '#3b82f6'} 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValor)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "agenda" && (
          <div className={`border rounded-xl overflow-hidden shadow-sm ${t.card} ${t.border}`}>
            <div className={`p-4 border-b flex flex-wrap justify-between items-center gap-3 ${t.border}`}>
              <span className="font-medium">Agenda</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setVisualizacaoAgenda("dia")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${visualizacaoAgenda === "dia" ? "bg-amber-500 text-black" : "bg-white/10 text-white/70"}`}
                >
                  Dia
                </button>
                <button 
                  onClick={() => setVisualizacaoAgenda("mes")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${visualizacaoAgenda === "mes" ? "bg-amber-500 text-black" : "bg-white/10 text-white/70"}`}
                >
                  Mês
                </button>
              </div>
            </div>
            {visualizacaoAgenda === "mes" && (
              <div className="p-4">
                {(() => {
                  const now = new Date();
                  const mesAtual = now.getMonth();
                  const anoAtual = now.getFullYear();
                  const primeiroDia = new Date(anoAtual, mesAtual, 1);
                  const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
                  const diasNoMes = ultimoDia.getDate();
                  const diaSemanaInicio = primeiroDia.getDay();
                  const nomeMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                  const nomeDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
                  
                  const agendamentosDoMes = agendamentos.filter(a => {
                    const d = new Date(a.data_hora);
                    return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
                  });
                  
                  const diasComAgendamentos = new Set(agendamentosDoMes.map(a => new Date(a.data_hora).getDate()));
                  
                  return (
                    <div>
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-amber-400">{nomeMeses[mesAtual]} {anoAtual}</h3>
                      </div>
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {nomeDias.map(dia => (
                          <div key={dia} className="text-center text-xs font-bold text-zinc-500 py-2">{dia}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: diaSemanaInicio }).map((_, i) => (
                          <div key={`empty-${i}`} className="h-20 bg-black/20 rounded-lg"></div>
                        ))}
                        {Array.from({ length: diasNoMes }).map((_, i) => {
                          const dia = i + 1;
                          const temAgendamento = diasComAgendamentos.has(dia);
                          const agendamentosDoDia = agendamentosDoMes.filter(a => new Date(a.data_hora).getDate() === dia);
                          const isHoje = dia === now.getDate();
                          
                          return (
                            <div 
                              key={dia}
                              onClick={() => {
                                setDataAgenda(`${anoAtual}-${(mesAtual + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`);
                                setVisualizacaoAgenda("dia");
                              }}
                              className={`h-20 rounded-lg border cursor-pointer transition-all hover:scale-105 p-1 ${
                                temAgendamento 
                                  ? isHoje 
                                    ? 'bg-amber-500/30 border-amber-400 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                                    : 'bg-amber-500/20 border-amber-500/50 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                                  : isHoje 
                                    ? 'bg-white/10 border-white/30' 
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <div className={`text-xs font-bold mb-1 ${temAgendamento ? 'text-amber-400' : isHoje ? 'text-white' : 'text-zinc-400'}`}>{dia}</div>
                              {temAgendamento && (
                                <div className="space-y-px">
                                  {agendamentosDoDia.slice(0, 2).map((ag, idx) => (
                                    <div key={idx} className="text-[10px] truncate text-white font-medium leading-tight">
                                      {ag.clientes?.nome?.substring(0, 10) || "Cliente"} {new Date(ag.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  ))}
                                  {agendamentosDoDia.length > 2 && (
                                    <div className="text-[10px] text-amber-300 font-bold">+{agendamentosDoDia.length - 2}</div>
                                  )}
                                </div>
                              )}
                              {isHoje && !temAgendamento && (
                                <div className="text-[8px] text-amber-400 font-bold">Hoje</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {agendamentosDoMes.length > 0 && (
                        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-xs font-bold text-amber-400 mb-2">Total: {agendamentosDoMes.length} agendamento{agendamentosDoMes.length !== 1 ? 's' : ''}</p>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {agendamentosDoMes.sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()).map(ag => (
                              <div key={ag.id} className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                                <div>
                                  <span className="font-medium">{ag.clientes?.nome || "Cliente"}</span>
                                  <span className="text-zinc-500"> - {ag.servico}</span>
                                </div>
                                <div className="text-amber-400 font-bold">
                                  {new Date(ag.data_hora).toLocaleDateString('pt-BR')} {new Date(ag.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
            {visualizacaoAgenda === "dia" && (
              <div className="flex flex-col">
                <div className={`flex border-b ${t.border}`}>
                  <div className={`w-20 p-3 text-center text-xs font-bold ${t.textMuted} border-r ${t.border}`}>Horário</div>
                  <div className={`flex-1 p-3 text-center font-semibold flex items-center justify-center gap-4`}>
                    <div className="flex items-center gap-2 bg-zinc-800 px-6 py-3 rounded-2xl border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse hover:animate-none transition-all scale-105">
                      <Calendar className={`w-6 h-6 text-amber-500`} />
                      <input 
                        type="date" 
                        value={dataAgenda} 
                        onChange={(e) => setDataAgenda(e.target.value)} 
                        className={`bg-transparent border-none text-base font-black outline-none cursor-pointer text-white color-scheme-dark`}
                      />
                    </div>
                  </div>
                </div>
                {(() => {
                  const slots = [];
                  for (let i = loja.hora_abertura; i < loja.hora_fechamento; i++) {
                    slots.push(`${i.toString().padStart(2, '0')}:00`);
                    slots.push(`${i.toString().padStart(2, '0')}:30`);
                  }
                  slots.push(`${loja.hora_fechamento.toString().padStart(2, '0')}:00`);
                  
                  return slots.map(horaStr => {
                    const [h, m] = horaStr.split(":");
                    const agendado = agendamentos.find(a => {
                      const dataAg = new Date(a.data_hora);
                      const mesmaData = dataAg.toISOString().split('T')[0] === dataAgenda;
                      const mesmaHora = dataAg.getHours() === parseInt(h) && dataAg.getMinutes() === parseInt(m);
                      return mesmaData && mesmaHora;
                    });
                    return (
                      <div key={horaStr} className={`flex border-b last:border-0 ${t.border}`}>
                        <div className={`w-20 p-4 text-center text-sm font-medium ${t.textMuted} border-r ${t.border}`}>{horaStr}</div>
                        <div className="flex-1 p-2 flex items-center justify-center">
                          {agendado ? (
                            <div 
                              onClick={() => setModalEdicaoAgendamento(agendado)}
                               className={`w-full p-3 rounded-lg border-l-4 ${t.bgAccent} border-current shadow-sm flex justify-between items-center cursor-pointer hover:brightness-110 transition-all`}
                            >
                              <div><p className="font-bold text-sm">{agendado.clientes?.nome || "Cliente Removido"}</p><p className="text-xs opacity-80">{agendado.servico}</p></div>
                              <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); setModalEdicaoAgendamento(agendado); }} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white p-2 rounded-lg transition-all shadow-sm" title="Editar Agendamento"><Edit2 className="w-5 h-5" /></button>
                                <button onClick={(e) => { e.stopPropagation(); excluirAgendamento(agendado.id); }} className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-all shadow-sm" title="Cancelar"><Trash2 className="w-5 h-5" /></button>
                              </div>
                            </div>
                          ) : (
                            <div onClick={() => setModalHora(horaStr)} className={`h-full w-full rounded border border-dashed flex items-center justify-center cursor-pointer hover:bg-black/10 transition-colors ${t.border} ${t.textMuted}`}><Plus className="w-4 h-4 opacity-50" /></div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        )}

        {activeTab === "clientes" && (
            <div className="space-y-4">
              {/* Visualização de Clientes */}
              {/* Desktop Table */}
              <div className={`hidden md:block border rounded-xl shadow-sm transition-colors duration-500 overflow-x-auto ${t.card} ${t.border}`}>
                <table className="w-full text-left">
<thead className={`border-b ${t.border} ${t.bgSidebar}`}>
                    <tr>
                      <th className="p-4 font-semibold text-sm">Nome</th>
                      <th className="p-4 font-semibold text-sm">Telefone</th>
                      {(loja as any).cadastro_completo && <th className="p-4 font-semibold text-sm">Email</th>}
                      {(loja as any).cadastro_completo && <th className="p-4 font-semibold text-sm">CPF</th>}
                      {(loja as any).cadastro_completo && <th className="p-4 font-semibold text-sm">Cidade</th>}
                      <th className="p-4 font-semibold text-sm text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((cliente) => (
                      <tr key={cliente.id} className={`border-b last:border-0 hover:bg-black/5 transition-colors ${t.border}`}>
                        <td className="p-4 font-medium">{cliente.nome}</td>
                        <td className="p-4 text-sm">{cliente.telefone}</td>
                        {(loja as any).cadastro_completo && <td className="p-4 text-sm">{cliente.email || '-'}</td>}
                        {(loja as any).cadastro_completo && <td className="p-4 text-sm">{cliente.cpf || '-'}</td>}
                        {(loja as any).cadastro_completo && <td className="p-4 text-sm">{cliente.cidade || '-'}</td>}
                        <td className="p-4 flex justify-center gap-3">
                          <button onClick={() => setModalCliente({ id: cliente.id, nome: cliente.nome, telefone: cliente.telefone || "", email: cliente.email, cpf: cliente.cpf, endereco: cliente.endereco, cidade: cliente.cidade, bairro: cliente.bairro, data_nascimento: cliente.data_nascimento, observacoes: cliente.observacoes })} className={`p-2 rounded-md hover:bg-black/10 transition-colors ${t.accent}`} title="Editar"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => excluirCliente(cliente.id)} className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {clientes.map((cliente) => (
                  <div key={cliente.id} className={`p-4 rounded-xl border shadow-sm ${t.card} ${t.border} flex justify-between items-center`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base truncate">{cliente.nome}</p>
                      <p className={`text-xs ${t.textMuted}`}>{cliente.telefone || "Sem telefone"}</p>
                      {(loja as any).cadastro_completo && cliente.email && <p className={`text-xs truncate ${t.textMuted}`}>{cliente.email}</p>}
                      {(loja as any).cadastro_completo && (cliente.cidade || cliente.bairro) && <p className={`text-xs ${t.textMuted}`}>{[cliente.bairro, cliente.cidade].filter(Boolean).join(' - ')}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setModalCliente({ id: cliente.id, nome: cliente.nome, telefone: cliente.telefone || "", email: cliente.email, cpf: cliente.cpf, endereco: cliente.endereco, cidade: cliente.cidade, bairro: cliente.bairro, data_nascimento: cliente.data_nascimento, observacoes: cliente.observacoes })} className={`p-3 rounded-xl bg-white/5 border ${t.border} ${t.accent}`}><Edit2 className="w-5 h-5" /></button>
                      <button onClick={() => excluirCliente(cliente.id)} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>

              {clientes.length === 0 && (
                <div className={`p-12 text-center rounded-xl border border-dashed ${t.border} ${t.textMuted}`}>
                  Nenhum cliente cadastrado ainda.
                </div>
              )}
            </div>
        )}

        {activeTab === "funcionarios" && (
            <div className="space-y-4">
            <div className="flex justify-between items-center mb-4 md:hidden">
                <h2 className="font-bold">Funcionários</h2>
                <button onClick={() => setModalFuncionario({ nome: "", telefone: "", email: "", endereco: "", cidade: "", bairro: "", estado: "", cep: "", observacoes: "", funcao: "" })} className={`p-2 rounded-lg ${t.bgAccent} text-white`}><Plus className="w-5 h-5"/></button>
            </div>
              {/* Visualização de Funcionários */}
               {/* Desktop Table */}
               <div className={`hidden md:block border rounded-xl shadow-sm transition-colors duration-500 overflow-x-auto ${t.card} ${t.border}`}>
                 <table className="w-full text-left">
                   <thead className={`border-b ${t.border} ${t.bgSidebar}`}>
                     <tr><th className="p-4 font-semibold text-sm">Nome do Funcionário</th><th className="p-4 font-semibold text-sm text-center">Ações</th></tr>
                   </thead>
                   <tbody>
                     {funcionarios.map((funcionario) => (
                       <tr key={funcionario.id} className={`border-b last:border-0 hover:bg-black/5 transition-colors ${t.border}`}>
                         <td className="p-4 font-medium flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${t.bgSidebar} ${t.accent} border border-current uppercase`}>{funcionario.nome.substring(0, 2)}</div>
                           {funcionario.nome}
                         </td>
                         <td className="p-4 flex justify-center gap-3">
                           <button onClick={() => setModalFuncionario({ id: funcionario.id, nome: funcionario.nome, telefone: funcionario.telefone || '', email: funcionario.email || '', endereco: funcionario.endereco || '', cidade: funcionario.cidade || '', bairro: funcionario.bairro || '', estado: funcionario.estado || '', cep: funcionario.cep || '', observacoes: funcionario.observacoes || '', funcao: funcionario.funcao || '' })} className={`p-2 rounded-md hover:bg-black/10 transition-colors ${t.accent}`} title="Editar"><Edit2 className="w-4 h-4" /></button>
                           <button onClick={() => excluirFuncionario(funcionario.id)} className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               {/* Mobile Cards */}
               <div className="md:hidden space-y-3">
                 {funcionarios.map((funcionario) => (
                   <div key={funcionario.id} className={`p-4 rounded-xl border shadow-sm ${t.card} ${t.border} flex justify-between items-center`}>
                     <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${t.bgSidebar} ${t.accent} border border-current uppercase`}>{funcionario.nome.substring(0, 2)}</div>
                       <p className="font-bold text-base">{funcionario.nome}</p>
                     </div>
                       <div className="flex gap-2">
                         <button onClick={() => setModalFuncionario({ id: funcionario.id, nome: funcionario.nome, telefone: funcionario.telefone || '', email: funcionario.email || '', endereco: funcionario.endereco || '', cidade: funcionario.cidade || '', bairro: funcionario.bairro || '', estado: funcionario.estado || '', cep: funcionario.cep || '', observacoes: funcionario.observacoes || '', funcao: funcionario.funcao || '' })} className={`p-3 rounded-xl bg-white/5 border ${t.border} ${t.accent}`}><Edit2 className="w-5 h-5" /></button>
                         <button onClick={() => excluirFuncionario(funcionario.id)} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   </div>
                 ))}
               </div>

               {funcionarios.length === 0 && (
                 <div className={`p-12 text-center rounded-xl border border-dashed ${t.border} ${t.textMuted}`}>
                   Nenhum funcionário cadastrado.
                 </div>
               )}
            </div>
        )}

        {activeTab === "servicos" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4 md:hidden">
                <h2 className="font-bold">Serviços</h2>
                <button onClick={() => setModalServico({ nome: "", preco: 0, duracao: 30 })} className={`p-2 rounded-lg ${t.bgAccent} text-white`}><Plus className="w-5 h-5"/></button>
              </div>
              {/* Visualização de Serviços */}
              {/* Desktop Table */}
              <div className={`hidden md:block border rounded-xl shadow-sm transition-colors duration-500 overflow-x-auto ${t.card} ${t.border}`}>
                <table className="w-full text-left">
                  <thead className={`border-b ${t.border} ${t.bgSidebar}`}>
                    <tr>
                      <th className="p-4 font-semibold text-sm">Serviço</th>
                      <th className="p-4 font-semibold text-sm">Duração</th>
                      <th className="p-4 font-semibold text-sm">Valor (R$)</th>
                      <th className="p-4 font-semibold text-sm text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servicos.map((s) => (
                      <tr key={s.id} className={`border-b last:border-0 hover:bg-black/5 transition-colors ${t.border}`}>
                        <td className="p-4 font-medium">{s.nome}</td>
                        <td className="p-4 text-sm">{s.duracao} min</td>
                        <td className="p-4 font-bold text-green-500">{f(s.preco)}</td>
                        <td className="p-4 flex justify-center gap-3">
                          <button onClick={() => setModalServico({ id: s.id, nome: s.nome, preco: s.preco, duracao: s.duracao })} className={`p-2 rounded-md hover:bg-black/10 transition-colors ${t.accent}`} title="Editar"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => excluirServico(s.id)} className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {servicos.map((s) => (
                  <div key={s.id} className={`p-4 rounded-xl border shadow-sm ${t.card} ${t.border}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-base">{s.nome}</p>
                        <p className={`text-xs ${t.textMuted}`}>{s.duracao} min de duração</p>
                      </div>
                      <p className="font-black text-green-500 text-lg">{f(s.preco)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setModalServico({ id: s.id, nome: s.nome, preco: s.preco, duracao: s.duracao })} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border ${t.border} ${t.accent} font-bold text-sm`}><Edit2 className="w-4 h-4" /> Editar</button>
                      <button onClick={() => excluirServico(s.id)} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm"><Trash2 className="w-4 h-4" /> Excluir</button>
                    </div>
                  </div>
                ))}
              </div>

              {servicos.length === 0 && (
                <div className={`p-12 text-center rounded-xl border border-dashed ${t.border} ${t.textMuted}`}>
                  Nenhum serviço no catálogo.
                </div>
              )}
            </div>
        )}
        {activeTab === "produtos" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4 md:hidden">
                 <h2 className="font-bold">Estoque de Produtos</h2>
                 <button onClick={() => setModalProduto({ nome: "", preco: 0, estoque: 0, categoria: "", unidade: "UN", variacoes: [], codigo_auto: "", codigo_lojista: "", codigo_barras: "" })} className={`p-2 rounded-lg ${t.bgAccent} text-white`}><Plus className="w-5 h-5"/></button>
              </div>

              {/* Desktop Table */}
              <div className={`hidden md:block border rounded-xl shadow-sm transition-colors duration-500 overflow-x-auto ${t.card} ${t.border}`}>
                <table className="w-full text-left">
                  <thead className={`border-b ${t.border} ${t.bgSidebar}`}>
                    <tr>
                      <th className="p-4 font-semibold text-sm">Produto</th>
                      <th className="p-4 font-semibold text-sm">Códigos</th>
                      <th className="p-4 font-semibold text-sm">Preço (R$)</th>
                      <th className="p-4 font-semibold text-sm text-center">Estoque</th>
                      <th className="p-4 font-semibold text-sm text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((p) => (
                      <tr key={p.id} className={`border-b last:border-0 hover:bg-black/5 transition-colors ${t.border}`}>
                        <td className="p-4 font-medium flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-lg border overflow-hidden flex items-center justify-center bg-zinc-800 ${t.border}`}>
                             {p.imagem_url ? <img src={p.imagem_url} alt={p.nome} className="w-full h-full object-cover" /> : <TrendingUp className="w-5 h-5 opacity-20" />}
                           </div>
                           <div>
                             <p>{p.nome}</p>
                             {p.categoria && <p className={`text-xs ${t.textMuted}`}>{p.categoria}</p>}
                           </div>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="space-y-0.5">
                            {p.codigo_auto && <span className="block text-xs text-zinc-500">Auto: <span className="font-mono">{p.codigo_auto}</span></span>}
                            {p.codigo_lojista && <span className="block text-xs text-zinc-500">Lojista: <span className="font-mono">{p.codigo_lojista}</span></span>}
                            {p.codigo_barras && <span className="block text-xs text-zinc-500">EAN: <span className="font-mono">{p.codigo_barras}</span></span>}
                            {!p.codigo_auto && !p.codigo_lojista && !p.codigo_barras && <span className="text-xs text-zinc-600">—</span>}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-green-500">{f(p.preco)}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${p.estoque <= 2 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                            {p.estoque} {p.unidade || 'UN'}
                          </span>
                        </td>
                        <td className="p-4 flex justify-center gap-1">
                          <button onClick={async () => { const vars = await carregarVariacoesProduto(p.id); setModalProduto({ id: p.id, nome: p.nome, preco: p.preco, estoque: p.estoque, imagem_url: p.imagem_url, categoria: p.categoria || '', unidade: p.unidade || 'UN', codigo_auto: p.codigo_auto || '', codigo_lojista: p.codigo_lojista || '', codigo_barras: p.codigo_barras || '', variacoes: vars }); }} className={`p-2 rounded-md hover:bg-black/10 transition-colors ${t.accent}`} title="Editar"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setModalEstoque({ produtoId: p.id, nome: p.nome, quantidade: 1, tipo: 'entrada' })} className={`p-2 rounded-md hover:bg-blue-500/10 text-blue-500 transition-colors`} title="Ajustar Estoque"><Package className="w-4 h-4" /></button>
                          <button onClick={() => excluirProduto(p.id)} className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {produtos.map((p) => (
                  <div key={p.id} className={`p-4 rounded-xl border shadow-sm ${t.card} ${t.border}`}>
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <div className="flex gap-3">
                         <div className={`w-12 h-12 rounded-lg border overflow-hidden flex items-center justify-center bg-zinc-800 shrink-0 ${t.border}`}>
                           {p.imagem_url ? <img src={p.imagem_url} alt={p.nome} className="w-full h-full object-cover" /> : <TrendingUp className="w-5 h-5 opacity-20" />}
                         </div>
                         <div>
                            <p className="font-bold text-base">{p.nome}</p>
                            {p.categoria && <p className={`text-xs ${t.textMuted}`}>{p.categoria}</p>}
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {p.codigo_auto && <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${t.border} border bg-zinc-800/40`}>{p.codigo_auto}</span>}
                              {p.codigo_lojista && <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${t.border} border bg-zinc-800/40`}>{p.codigo_lojista}</span>}
                            </div>
                            <p className={`text-xs font-bold ${p.estoque <= 2 ? 'text-red-500' : t.textMuted}`}>Estoque: {p.estoque} {p.unidade || 'UN'}</p>
                         </div>
                      </div>
                       <p className="font-black text-green-500 text-lg">{f(p.preco)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={async () => { const vars = await carregarVariacoesProduto(p.id); setModalProduto({ id: p.id, nome: p.nome, preco: p.preco, estoque: p.estoque, imagem_url: p.imagem_url, categoria: p.categoria || '', unidade: p.unidade || 'UN', codigo_auto: p.codigo_auto || '', codigo_lojista: p.codigo_lojista || '', codigo_barras: p.codigo_barras || '', variacoes: vars }); }} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border ${t.border} ${t.accent} font-bold text-sm`}><Edit2 className="w-4 h-4" /> Editar</button>
                      <button onClick={() => setModalEstoque({ produtoId: p.id, nome: p.nome, quantidade: 1, tipo: 'entrada' })} className={`flex items-center justify-center gap-1 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold text-sm`}><Package className="w-4 h-4" /></button>
                      <button onClick={() => excluirProduto(p.id)} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm`}><Trash2 className="w-4 h-4" /> Excluir</button>
                    </div>
                  </div>
                ))}
              </div>

              {produtos.length === 0 && (
                <div className={`p-12 text-center rounded-xl border border-dashed ${t.border} ${t.textMuted}`}>
                  Nenhum produto cadastrado no estoque.
                </div>
              )}
              
<div className="md:hidden pt-4">
                 <button 
                   onClick={() => setModalProduto({ nome: "", preco: 0, estoque: 0, categoria: "", unidade: "UN", variacoes: [], codigo_auto: "", codigo_lojista: "", codigo_barras: "" })}
                   className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold text-white shadow-lg ${t.bgAccent} ${t.hoverAccent}`}
                 >
                   <Plus className="w-5 h-5" /> Cadastrar Novo Produto
                 </button>
              </div>
            </div>
        )}

        {activeTab === "pedidos" && (
            <div className="space-y-4">
              <div className={`border rounded-xl overflow-hidden shadow-sm ${t.card} ${t.border}`}>
                <div className={`p-4 border-b ${t.border}`}>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" /> Histórico de Pedidos
                  </h2>
                </div>
                {pedidos.length === 0 ? (
                  <div className={`p-12 text-center ${t.textMuted}`}>
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Nenhum pedido realizado ainda.</p>
                    <p className="text-xs mt-1">Os pedidos aparecem aqui quando clientes finalizam compras na loja virtual.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {pedidos.map((pedido) => (
                      <div key={pedido.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold">{pedido.cliente_nome}</p>
                            <p className={`text-xs ${t.textMuted}`}>{pedido.cliente_telefone}</p>
                            {pedido.endereco && <p className={`text-xs ${t.textMuted} mt-0.5`}>📍 {pedido.endereco}</p>}
                            {pedido.observacao && <p className={`text-xs ${t.textMuted} mt-0.5`}>📝 {pedido.observacao}</p>}
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`font-black text-base ${t.accent}`}>{f(pedido.total)}</p>
                            <p className={`text-[10px] ${t.textMuted}`}>{new Date(pedido.created_at).toLocaleDateString('pt-BR')} {new Date(pedido.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                            <button
                              onClick={() => {
                                const win = window.open("", "_blank");
                                if (!win) return;
                                const itensHtml = (pedido.itens || []).map((item: any) =>
                                  `<tr><td style="text-align:center;width:50px">${item.quantidade}x</td><td>${item.nome}${item.ml ? ` (${item.ml}ml)` : ''}</td><td style="text-align:right;width:120px">${f(item.preco)}</td></tr>`
                                ).join("");
                                const conteudo = `
                                  <div class="nf-info">
                                    <p><strong>Pedido Nº:</strong> ${pedido.id?.slice(0,8).toUpperCase()}</p>
                                    <p><strong>Cliente:</strong> ${pedido.cliente_nome}</p>
                                    <p><strong>WhatsApp:</strong> ${pedido.cliente_telefone}</p>
                                    ${pedido.endereco ? `<p><strong>Endereço:</strong> ${pedido.endereco}</p>` : '<p><strong>Retirar no local</strong></p>'}
                                    ${pedido.observacao ? `<p><strong>Obs:</strong> ${pedido.observacao}</p>` : ''}
                                    <p><strong>Data:</strong> ${new Date(pedido.created_at).toLocaleString('pt-BR')}</p>
                                  </div>
                                  <table><thead><tr><th>Qtd</th><th>Produto</th><th>Valor</th></tr></thead><tbody>${itensHtml}</tbody></table>
                                  <div class="nf-total">Total: ${f(pedido.total)}</div>
                                `;
                                win.document.write(gerarHtmlImpressao(`PEDIDO #${pedido.id?.slice(0,8).toUpperCase()}`, conteudo));
                                win.document.close();
                                win.onafterprint = () => win.close();
                                setTimeout(() => win.print(), 500);
                              }}
                              className={`text-[10px] mt-1 font-bold ${t.accent} hover:underline`}
                            >
                              🖨️ Imprimir
                            </button>
                          </div>
                        </div>
                        <div className={`bg-black/20 rounded-lg p-3 text-sm ${t.textMuted}`}>
                          {(pedido.itens || []).map((item: any, i: number) => (
                            <p key={i} className="text-xs">
                              {item.quantidade}x {item.nome}{item.ml ? ` (${item.ml}ml)` : ''} - {f(item.preco)}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
        )}

        {activeTab === "ordens" && (
          <div className="space-y-4">
            <div className={`border rounded-xl overflow-hidden shadow-sm ${t.card} ${t.border}`}>
              <div className={`p-4 border-b ${t.border}`}>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" /> Ordens de Serviço
                </h2>
              </div>
              {ordens.length === 0 ? (
                <div className={`p-12 text-center ${t.textMuted}`}>
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma ordem de serviço cadastrada.</p>
                  <p className="text-xs mt-1">Clique em "Nova Ordem de Serviço" para criar a primeira.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {ordens.map((ordem) => (
                    <div key={ordem.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold">{ordem.cliente_nome}</p>
                            <select value={ordem.situacao || 'aberto'} onChange={async (e) => { const novaSituacao = e.target.value; await supabase.from("ordens_servico").update({ situacao: novaSituacao, data_entrega: (novaSituacao === 'concluido' || novaSituacao === 'entregue') && !ordem.data_entrega ? new Date().toISOString() : ordem.data_entrega }).eq("id", ordem.id); setOrdens(ordens.map(o => o.id === ordem.id ? { ...o, situacao: novaSituacao, data_entrega: (novaSituacao === 'concluido' || novaSituacao === 'entregue') && !o.data_entrega ? new Date().toISOString() : o.data_entrega } : o)); }} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border-0 cursor-pointer outline-none ${
                              ordem.situacao === 'aberto' ? 'bg-yellow-500/20 text-yellow-500' :
                              ordem.situacao === 'em_andamento' ? 'bg-blue-500/20 text-blue-500' :
                              ordem.situacao === 'concluido' ? 'bg-green-500/20 text-green-500' :
                              ordem.situacao === 'entregue' ? 'bg-green-500/20 text-green-500' :
                              ordem.situacao === 'cancelado' ? 'bg-red-500/20 text-red-500' : ''
                            } ${t.bgSidebar}`}>
                              <option value="aberto" className="bg-zinc-900 text-yellow-500">ABERTO</option>
                              <option value="em_andamento" className="bg-zinc-900 text-blue-500">EM ANDAMENTO</option>
                              <option value="concluido" className="bg-zinc-900 text-green-500">CONCLUÍDO</option>
                              <option value="entregue" className="bg-zinc-900 text-green-500">ENTREGUE</option>
                              <option value="cancelado" className="bg-zinc-900 text-red-500">CANCELADO</option>
                            </select>
                          </div>
                          {ordem.cliente_fone && <p className={`text-xs ${t.textMuted}`}>{ordem.cliente_fone}</p>}
                          {(ordem.placa || ordem.marca || ordem.modelo) && (
                            <p className={`text-xs ${t.textMuted} mt-0.5`}>🚗 {[ordem.placa, ordem.marca, ordem.modelo].filter(Boolean).join(' - ')}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className={`font-black text-base ${t.accent}`}>{f(ordem.total)}</p>
                          <p className={`text-[10px] ${t.textMuted}`}>{new Date(ordem.data_emissao).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      {ordem.observacoes && <p className={`text-xs ${t.textMuted} mb-2 bg-black/20 rounded-lg p-2`}>📝 {ordem.observacoes}</p>}
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setModalOrdem({ ...ordem, data_entrega: ordem.data_entrega?.split('T')[0] || '' })} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${t.accent} hover:bg-white/5 transition-colors`}><Edit2 className="w-3 h-3" /> Editar</button>
                        <button onClick={() => imprimirOrdem(ordem)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-400 hover:bg-white/5 transition-colors"><Printer className="w-3 h-3" /> Imprimir</button>
                        <button onClick={() => { if (ordem.situacao !== 'concluido' && ordem.situacao !== 'entregue' && ordem.situacao !== 'cancelado') { setModalOrdem({ ...ordem, situacao: 'concluido', data_entrega: ordem.data_entrega?.split('T')[0] || new Date().toISOString().split('T')[0] }); } }} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-green-400 hover:bg-white/5 transition-colors ${(ordem.situacao === 'concluido' || ordem.situacao === 'entregue' || ordem.situacao === 'cancelado') ? 'opacity-30 pointer-events-none' : ''}`}>✓ Concluir</button>
                        <button onClick={() => excluirOrdem(ordem.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:bg-white/5 transition-colors"><Trash2 className="w-3 h-3" /> Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "orcamentos" && (
          <div className="space-y-4">
            <div className={`border rounded-xl overflow-hidden shadow-sm ${t.card} ${t.border}`}>
              <div className={`p-4 border-b ${t.border}`}>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Orçamentos
                </h2>
              </div>
              {orcamentos.length === 0 ? (
                <div className={`p-12 text-center ${t.textMuted}`}>
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhum orçamento cadastrado.</p>
                  <p className="text-xs mt-1">Clique em "Novo Orçamento" para criar o primeiro.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {orcamentos.map((orcamento) => (
                    <div key={orcamento.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold">{orcamento.cliente_nome}</p>
                          {orcamento.vendedor && <p className={`text-xs ${t.textMuted}`}>👤 Vendedor: {orcamento.vendedor}</p>}
                          {orcamento.cliente_cpf && <p className={`text-xs ${t.textMuted}`}>CPF: {orcamento.cliente_cpf}</p>}
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className={`font-black text-base ${t.accent}`}>{f(orcamento.total)}</p>
                          <p className={`text-[10px] ${t.textMuted}`}>{new Date(orcamento.data_emissao).toLocaleDateString('pt-BR')}</p>
                          <p className={`text-[10px] ${t.textMuted}`}>Validade: {orcamento.validade || 7} dias</p>
                        </div>
                      </div>
                      {(orcamento.itens || []).length > 0 && (
                        <div className={`bg-black/20 rounded-lg p-3 text-sm ${t.textMuted} mb-2`}>
                          {(orcamento.itens || []).map((item: any, i: number) => (
                            <p key={i} className="text-xs">
                              {item.quantidade}x {item.nome} - {f(item.preco)}
                            </p>
                          ))}
                        </div>
                      )}
                      {orcamento.observacoes && <p className={`text-xs ${t.textMuted} mb-2 bg-black/20 rounded-lg p-2`}>📝 {orcamento.observacoes}</p>}
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setModalOrcamento({ ...orcamento, data_emissao: orcamento.data_emissao?.split('T')[0] || new Date().toISOString().split('T')[0] })} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${t.accent} hover:bg-white/5 transition-colors`}><Edit2 className="w-3 h-3" /> Editar</button>
                        <button onClick={() => imprimirOrcamento(orcamento)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-400 hover:bg-white/5 transition-colors"><Printer className="w-3 h-3" /> Imprimir</button>
                        <button onClick={() => excluirOrcamento(orcamento.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:bg-white/5 transition-colors"><Trash2 className="w-3 h-3" /> Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "devolucoes" && (
          <div className="space-y-4">
            <div className={`border rounded-xl overflow-hidden shadow-sm ${t.card} ${t.border}`}>
              <div className={`p-4 border-b ${t.border}`}>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <RotateCcw className="w-5 h-5" /> Devoluções
                </h2>
              </div>
              {devolucoes.length === 0 ? (
                <div className={`p-12 text-center ${t.textMuted}`}>
                  <RotateCcw className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma devolução registrada.</p>
                  <p className="text-xs mt-1">Clique em "Nova Devolução" para registrar a primeira.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {devolucoes.map((dev) => (
                    <div key={dev.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold">{dev.cliente_nome}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              dev.status === 'aberto' ? 'bg-yellow-500/20 text-yellow-500' :
                              dev.status === 'recolhido' ? 'bg-blue-500/20 text-blue-500' :
                              dev.status === 'resolvido' ? 'bg-green-500/20 text-green-500' :
                              dev.status === 'cancelado' ? 'bg-red-500/20 text-red-500' : ''
                            }`}>
                              {dev.status === 'aberto' ? '🟡 ABERTO' : 
                               dev.status === 'recolhido' ? '🔵 RECOLHIDO' : 
                               dev.status === 'resolvido' ? '🟢 RESOLVIDO' : 
                               dev.status === 'cancelado' ? '🔴 CANCELADO' : dev.status?.toUpperCase()}
                            </span>
                          </div>
                          {dev.produto_nome && <p className={`text-xs ${t.textMuted} mt-0.5`}>📦 {dev.produto_nome}</p>}
                          {dev.motivo && <p className={`text-xs ${t.textMuted} mt-0.5 line-clamp-2`}>🔴 {dev.motivo}</p>}
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          {dev.data_recolhimento && <p className={`text-[10px] ${t.textMuted}`}>📅 {new Date(dev.data_recolhimento).toLocaleDateString('pt-BR')}</p>}
                          <p className={`text-[10px] ${t.textMuted}`}>{new Date(dev.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      {dev.mensagem_lojista && <p className={`text-xs ${t.accent} mb-2 bg-black/20 rounded-lg p-2`}>💬 {dev.mensagem_lojista}</p>}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <button onClick={() => setModalDevolucao({ ...dev, data_recolhimento: dev.data_recolhimento?.split('T')[0] || '' })} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${t.accent} hover:bg-white/5 transition-colors`}><Edit2 className="w-3 h-3" /> Editar</button>
                        {dev.status === 'aberto' && (
                          <button onClick={() => alterarStatusDevolucao(dev.id, 'recolhido')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-500/10">📦 Recolhido</button>
                        )}
                        {dev.status === 'recolhido' && (
                          <>
                            <button onClick={() => alterarStatusDevolucao(dev.id, 'resolvido')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-green-400 hover:bg-green-500/10">✓ Resolvido</button>
                            <button onClick={() => alterarStatusDevolucao(dev.id, 'aberto')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-yellow-400 hover:bg-yellow-500/10" title="Voltar para aberto">↩ Voltar</button>
                          </>
                        )}
                        {dev.status === 'resolvido' && (
                          <button onClick={() => alterarStatusDevolucao(dev.id, 'recolhido')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-orange-400 hover:bg-orange-500/10" title="Reabrir">↩ Reabrir</button>
                        )}
                        {dev.status !== 'cancelado' && dev.status !== 'resolvido' && (
                          <button onClick={() => alterarStatusDevolucao(dev.id, 'cancelado')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:bg-white/5 transition-colors">✕ Cancelar</button>
                        )}
                        {dev.status === 'cancelado' && (
                          <button onClick={() => alterarStatusDevolucao(dev.id, 'aberto')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-green-400 hover:bg-green-500/10">↩ Ativar</button>
                        )}
                        <button onClick={() => excluirDevolucao(dev.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:bg-white/5 transition-colors"><Trash2 className="w-3 h-3" /> Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "vendas_aprazo" && (
          <div className="space-y-4">
            <div className={`border rounded-xl overflow-hidden shadow-sm ${t.card} ${t.border}`}>
              <div className={`p-4 border-b ${t.border}`}>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" /> Vendas a Prazo
                </h2>
              </div>
              {vendasAprazo.length === 0 ? (
                <div className={`p-12 text-center ${t.textMuted}`}>
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma venda a prazo registrada.</p>
                </div>
              ) : (
                <div className="divide-y divide-dashed">
                  {vendasAprazo.map((v) => {
                    const parcelas = v.venda_parcelas || [];
                    const pagas = parcelas.filter((p: any) => p.pago).length;
                    const pendentes = parcelas.length - pagas;
                    const statusCor = pendentes === 0 ? 'text-green-500' : 'text-amber-500';
                    return (
                      <div key={v.id} className="p-4 hover:bg-black/5 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-base">{v.cliente_nome}</p>
                            {v.cliente_telefone && <p className={`text-xs ${t.textMuted}`}>{v.cliente_telefone}</p>}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-500">{f(v.valor_total)}</p>
                            {(v.desconto_percentual || v.desconto_valor) ? <p className="text-[10px] text-red-400">Desc: {v.desconto_percentual ? `${v.desconto_percentual}%` : ''}{v.desconto_percentual && v.desconto_valor ? ' + ' : ''}{v.desconto_valor ? f(v.desconto_valor) : ''}</p> : null}
                            <p className={`text-xs font-bold ${statusCor}`}>{pagas}/{parcelas.length} parcelas</p>
                            {(v.valor_entrada || 0) > 0 && <p className={`text-[10px] ${t.textMuted}`}>Entrada: {f(v.valor_entrada)}</p>}
                          </div>
                        </div>
                        {v.observacao && <p className={`text-xs mb-2 ${t.textMuted}`}>{v.observacao}</p>}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {parcelas.map((p: any) => (
                            <div key={p.id} className={`text-[10px] px-2 py-1 rounded-full font-bold border ${p.pago ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}>
                              {p.numero}ª {formatarData(p.data_vencimento)} {p.pago ? `✅${p.data_pagamento ? ' ' + formatarData(p.data_pagamento) : ''}` : '⏳'}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {parcelas.filter((p: any) => !p.pago).length > 0 && (
                            <button onClick={() => {
                              const prox = parcelas.find((p: any) => !p.pago);
                              if (prox) baixarParcela(prox.id, v.id);
                            }} className="flex-1 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 font-bold text-xs hover:bg-green-500/20 transition-all">
                              Baixar {parcelas.filter((p: any) => !p.pago).length === 1 ? 'Parcela' : 'Próxima'}
                            </button>
                          )}
                          <button onClick={() => setModalVenda({ id: v.id, cliente_nome: v.cliente_nome, cliente_telefone: v.cliente_telefone || '', valor_total: v.valor_total, valor_entrada: v.valor_entrada || 0, numero_parcelas: v.numero_parcelas, dias_intervalo: typeof v.dias_intervalo === 'string' && v.dias_intervalo === 'custom' ? 'custom' : (v.dias_intervalo || 30), dias_intervalo_custom: v.dias_intervalo_custom || 30, customizar_datas: parcelas && parcelas.length > 0, observacao: v.observacao || '', parcelas: parcelas || [], desconto_percentual: v.desconto_percentual || 0, desconto_valor: v.desconto_valor || 0 })} className={`flex-1 py-2 rounded-lg border font-bold text-xs transition-all ${t.accent} bg-white/5`}>
                            Editar
                          </button>
                          <button onClick={() => excluirVenda(v.id)} className="py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 font-bold text-xs hover:bg-red-500/20 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "frente_caixa" && (
          <div className="space-y-4">
            {/* Abas internas: Vender | Vendas do Dia */}
            <div className="flex gap-2">
              <button onClick={() => setPdvAba('vender')}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${pdvAba === 'vender' ? `${t.bgAccent} text-white shadow-lg` : `${t.textMuted} bg-white/5 border ${t.border}`}`}>
                <ShoppingCart className="w-4 h-4 inline mr-1" /> Vender
              </button>
              <button onClick={() => { setPdvAba('vendas'); carregarVendasHoje(); }}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${pdvAba === 'vendas' ? `${t.bgAccent} text-white shadow-lg` : `${t.textMuted} bg-white/5 border ${t.border}`}`}>
                <ClipboardList className="w-4 h-4 inline mr-1" /> Vendas de Hoje ({pdvVendasHoje.filter(v => v.status !== 'cancelado').length})
              </button>
            </div>

            {pdvAba === 'vender' && (
              <div className={`border rounded-xl shadow-sm ${t.card} ${t.border}`}>
                <div className={`p-4 border-b ${t.border} flex items-center justify-between`}>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" /> Frente de Caixa
                  </h2>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${t.bgAccent} text-white`}>
                    {pdvCarrinho.length} {pdvCarrinho.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                  {/* Lado Esquerdo: Busca + Produtos */}
                  <div className="lg:col-span-3 p-4 lg:border-r">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input type="text" value={pdvBusca} onChange={(e) => setPdvBusca(e.target.value)}
                        className={`w-full pl-10 pr-4 p-3 border rounded-xl outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`}
                        placeholder="Buscar por nome, código, SKU ou EAN..." autoFocus />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto">
                      {pdvProdutosFiltrados.length > 0 ? pdvProdutosFiltrados.map((p: any) => (
                        <button key={p.id} onClick={() => adicionarAoCarrinho(p)}
                          className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-95 ${t.border} ${t.bgSidebar} hover:border-green-500/50`}>
                          <div className={`w-full aspect-square rounded-lg border overflow-hidden flex items-center justify-center bg-zinc-800 mb-2 ${t.border}`}>
                            {p.imagem_url ? <img src={p.imagem_url} alt={p.nome} className="w-full h-full object-cover" /> : <ShoppingCart className="w-8 h-8 opacity-20" />}
                          </div>
                          <p className="font-bold text-sm leading-tight line-clamp-2">{p.nome}</p>
                          <p className="text-green-500 font-black text-sm mt-1">{f(p.preco)}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${p.estoque <= 2 ? 'text-red-500 bg-red-500/10' : 'text-zinc-500 bg-zinc-800'}`}>
                              Est: {p.estoque}
                            </span>
                            {p.codigo_auto && <span className="text-[10px] text-zinc-600 font-mono">{p.codigo_auto}</span>}
                          </div>
                        </button>
                      )) : (
                        <div className="col-span-full py-12 text-center">
                          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className={`${t.textMuted}`}>{pdvBusca ? 'Nenhum produto encontrado' : 'Digite para buscar produtos'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lado Direito: Carrinho */}
                  <div className="lg:col-span-2 p-4 flex flex-col">
                    {/* Cliente */}
                    <div className="mb-3">
                      <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Cliente (opcional)</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input type="text" value={pdvClienteNome} onChange={(e) => setPdvClienteNome(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className={`w-full border rounded-lg p-2 text-sm outline-none ${t.bgSidebar} ${t.border} ${t.textMain} ${pdvClienteNome ? 'pr-8' : ''}`}
                            placeholder="Balcão (padrão)" />
                          {pdvClienteNome && (
                            <button type="button" onClick={() => setPdvClienteNome('')} className={`absolute right-2 top-1/2 -translate-y-1/2 ${t.textMuted} hover:text-white text-lg leading-none`}>×</button>
                          )}
                        </div>
                        <button type="button" onClick={() => setModalBuscaCliente({ onSelect: (c) => { setPdvClienteNome(c.nome); }})} className={`px-2 py-2 rounded-lg border ${t.border} ${t.textMuted} hover:bg-white/10 text-sm`} title="Buscar cliente">🔍</button>
                      </div>
                    </div>
                    {/* Vendedor */}
                    <div className="mb-3">
                      <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Vendedor no Caixa</label>
                      <select value={pdvVendedorId} onChange={(e) => setPdvVendedorId(e.target.value)}
                        className={`w-full border rounded-lg p-2 text-sm outline-none ${t.bgSidebar} ${t.border} ${t.textMain}`}>
                        <option value="">Selecione um vendedor</option>
                        {funcionarios.filter(f => f.funcao === 'caixa').map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                      </select>
                    </div>

                    <h3 className={`font-bold text-sm mb-3 ${t.textMuted} uppercase tracking-wider`}>🛒 Itens</h3>

                    {pdvCarrinho.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center py-8">
                        <p className={`text-sm ${t.textMuted} text-center`}>Carrinho vazio<br/>Selecione um produto</p>
                      </div>
                    ) : (
                      <div className="flex-1 space-y-2 max-h-[35vh] overflow-y-auto mb-4">
                        {pdvCarrinho.map((item: any, idx: number) => (
                          <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg ${t.border} border bg-white/5`}>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.nome}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-green-500 font-bold">{f(item.preco * item.quantidade)}</span>
                                {item.codigo_auto && <span className="text-[9px] text-zinc-600 font-mono">{item.codigo_auto}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => alterarQtdCarrinho(idx, -1)} className="p-1 rounded hover:bg-zinc-700 text-zinc-400"><MinusCircle className="w-4 h-4" /></button>
                              <span className="w-6 text-center text-xs font-bold">{item.quantidade}</span>
                              <button onClick={() => alterarQtdCarrinho(idx, 1)} className="p-1 rounded hover:bg-zinc-700 text-zinc-400"><Plus className="w-4 h-4" /></button>
                            </div>
                            <button onClick={() => removerDoCarrinho(idx)} className="p-1 rounded hover:bg-red-500/20 text-red-500"><Trash className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}

                    {pdvCarrinho.length > 0 && (
                      <>
                        {/* Desconto */}
                        <div className="mb-3 grid grid-cols-2 gap-2">
                          <div>
                            <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Desconto (%)</label>
                            <input type="number" min="0" max="100" step="0.5" value={pdvDescontoPercentual || ''} onChange={(e) => {
                              const val = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                              setPdvDescontoPercentual(val);
                            }} className={`w-full border rounded-lg p-2 text-sm outline-none ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="0%" />
                          </div>
                          <div>
                            <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Desconto (R$)</label>
                            <input type="number" min="0" step="0.5" value={pdvDescontoValor || ''} onChange={(e) => setPdvDescontoValor(Math.max(0, parseFloat(e.target.value) || 0))}
                              className={`w-full border rounded-lg p-2 text-sm outline-none ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="0,00" />
                          </div>
                        </div>

                        {/* Totais */}
                        <div className={`border-t pt-3 space-y-1 ${t.border}`}>
                          <div className="flex justify-between text-sm">
                            <span className={t.textMuted}>Subtotal</span>
                            <span>{f(pdvSubtotal)}</span>
                          </div>
                          {pdvDescontoPercentual > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-red-400">Desconto ({pdvDescontoPercentual}%)</span>
                              <span className="text-red-400">-{f(pdvSubtotal * pdvDescontoPercentual / 100)}</span>
                            </div>
                          )}
                          {pdvDescontoValor > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-red-400">Desconto (R$)</span>
                              <span className="text-red-400">-{f(pdvDescontoValor)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-black pt-1">
                            <span>Total</span>
                            <span className="text-green-500">{f(pdvTotal)}</span>
                          </div>
                        </div>

                        {/* Forma Pagamento */}
                        <div className="mt-3">
                          <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Forma de Pagamento</label>
                          <select value={pdvPagamento} onChange={(e) => { setPdvPagamento(e.target.value); setPdvDinheiroRecebido(0); }}
                            className={`w-full border rounded-lg p-2 text-sm outline-none ${t.bgSidebar} ${t.border} ${t.textMain}`}>
                            <option value="dinheiro">💵 Dinheiro</option>
                            <option value="credito">💳 Cartão de Crédito</option>
                            <option value="debito">💳 Cartão de Débito</option>
                            <option value="pix">📱 PIX</option>
                            <option value="outro">Outro</option>
                          </select>
                        </div>

                        {/* Troco (só para dinheiro) */}
                        {pdvPagamento === 'dinheiro' && (
                          <div className="mt-2">
                            <label className={`block text-xs font-bold mb-1 ${t.textMuted}`}>Valor Recebido (R$)</label>
                            <input type="number" min="0" step="0.5" value={pdvDinheiroRecebido || ''} onChange={(e) => setPdvDinheiroRecebido(parseFloat(e.target.value) || 0)}
                              className={`w-full border rounded-lg p-2 text-sm outline-none ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="0,00" />
                            {pdvDinheiroRecebido >= pdvTotal && pdvTotal > 0 && (
                              <p className="text-green-500 font-bold text-sm mt-1">Troco: {f(pdvTroco)}</p>
                            )}
                          </div>
                        )}

                        <button onClick={finalizarVendaPDV}
                          className={`w-full mt-4 py-3 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${pdvProcessando ? 'bg-zinc-500 cursor-not-allowed' : `${t.bgAccent} ${t.hoverAccent}`}`}
                          disabled={pdvProcessando}>
                          {pdvProcessando ? 'Processando...' : `💰 Finalizar - ${f(pdvTotal)}`}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Vendas do Dia */}
            {pdvAba === 'vendas' && (
              <div className={`border rounded-xl shadow-sm ${t.card} ${t.border}`}>
                <div className={`p-4 border-b ${t.border} flex items-center justify-between`}>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" /> Vendas de Hoje
                  </h2>
                  <span className={`text-xs font-bold`}>
                    Total: <span className="text-green-500">{f(pdvVendasHoje.filter(v => v.status !== 'cancelado').reduce((s, v) => s + (v.total || 0), 0))}</span>
                  </span>
                </div>
                {pdvVendasHoje.length === 0 ? (
                  <div className={`p-12 text-center ${t.textMuted}`}>
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Nenhuma venda hoje.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-dashed">
                    {pdvVendasHoje.map((v: any) => {
                      const cancelado = v.status === 'cancelado';
                      return (
                        <div key={v.id} className={`p-4 ${cancelado ? 'opacity-40' : 'hover:bg-black/5'} transition-colors`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className={`font-bold ${cancelado ? 'line-through' : ''}`}>{v.cliente_nome || "Balcão"}</p>
                              {v.vendedor_nome && <p className={`text-[10px] ${t.textMuted}`}>Vendedor: {v.vendedor_nome}</p>}
                              <p className={`text-xs ${t.textMuted}`}>
                                {new Date(v.created_at).toLocaleTimeString('pt-BR')}
                                {v.forma_pagamento ? ` • ${({ dinheiro: 'Dinheiro', credito: 'Crédito', debito: 'Débito', pix: 'PIX' } as any)[v.forma_pagamento] || v.forma_pagamento}` : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${cancelado ? 'text-zinc-500' : 'text-green-500'}`}>
                                {cancelado ? 'CANCELADO' : f(v.total)}
                              </p>
                              {v.desconto > 0 && <p className={`text-[10px] ${t.textMuted}`}>Desc: -{f(v.desconto)}</p>}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {(v.itens || []).map((item: any, i: number) => (
                              <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full border ${t.border} bg-white/5`}>
                                {item.nome} x{item.quantidade || 1}
                              </span>
                            ))}
                          </div>
                          {!cancelado && (
                            <div className="flex gap-2">
                              <button onClick={() => imprimirCupomPDV(v, 'termico')}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-500/10 transition-colors">
                                <Printer className="w-3 h-3" /> Cupom
                              </button>
                              <button onClick={() => imprimirCupomPDV(v, 'a4')}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:bg-white/5 transition-colors">
                                <Printer className="w-3 h-3" /> A4
                              </button>
                              <button onClick={() => cancelarVendaPDV(v)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors ml-auto">
                                <X className="w-3 h-3" /> Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "configuracoes" && (
          <div className={`border rounded-xl p-6 shadow-sm ${t.card} ${t.border}`}>
            <h2 className={`text-xl font-semibold mb-6 border-b pb-4 ${t.border}`}>Personalização da Loja</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Link de Login para o Lojista */}
              <div className={`p-4 rounded-xl border border-dashed ${t.border} bg-amber-500/10`}>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${t.accent}`}>🔑 Link de Acesso do Lojista</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/login`} 
                    className={`flex-1 bg-black/20 border rounded-lg p-3 text-sm outline-none ${t.border} ${t.textMain}`}
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/login`);
                      alert("Link de login copiado! Envie para o lojista acessar o painel.");
                    }}
                    className={`px-4 py-2 rounded-lg font-bold text-white text-sm transition-all active:scale-95 ${t.bgAccent} ${t.hoverAccent}`}
                  >
                    Copiar
                  </button>
                </div>
                <p className="text-[10px] mt-2 opacity-60 font-medium italic">Envie este link para o lojista fazer login no painel.</p>
              </div>

              {/* Link de Agendamento */}
              <div className={`p-4 rounded-xl border border-dashed ${t.border} bg-white/5`}>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${t.accent}`}>Seu Link de Agendamento Online</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/agendar/${loja.id}`} 
                    className={`flex-1 bg-black/20 border rounded-lg p-3 text-sm outline-none ${t.border} ${t.textMain}`}
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/agendar/${loja.id}`);
                      alert("Link copiado! Envie para seus clientes ou coloque na bio do Instagram.");
                    }}
                    className={`px-4 py-2 rounded-lg font-bold text-white text-sm transition-all active:scale-95 ${t.bgAccent} ${t.hoverAccent}`}
                  >
                    Copiar
                  </button>
                </div>
                <p className="text-[10px] mt-2 opacity-60 font-medium italic">Compartilhe este link para agendamentos automáticos.</p>
              </div>

              {/* Link da Loja Virtual */}
              <div className={`p-4 rounded-xl border border-dashed ${t.border} bg-white/5`}>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${t.accent}`}>🛒 Sua Loja Virtual de Produtos</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/loja/${loja.id}`} 
                    className={`flex-1 bg-black/20 border rounded-lg p-3 text-sm outline-none ${t.border} ${t.textMain}`}
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/loja/${loja.id}`);
                      alert("Link da loja copiado! Compartilhe para seus clientes comprarem produtos.");
                    }}
                    className={`px-4 py-2 rounded-lg font-bold text-white text-sm transition-all active:scale-95 ${t.bgAccent} ${t.hoverAccent}`}
                  >
                    Copiar
                  </button>
                </div>
                <p className="text-[10px] mt-2 opacity-60 font-medium italic">Compartilhe este link para vender produtos online.</p>
                <a 
                  href={`/loja/${loja.id}`} 
                  target="_blank"
                  className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border ${t.border} hover:bg-white/5 transition-colors`}
                >
                  👁️ Ver Loja
                </a>
              </div>

              {/* Dados do Lojista */}
              <div className={`p-6 rounded-xl border ${t.border} ${t.card}`}>
                <h3 className={`font-bold mb-4 flex items-center gap-2 ${t.accent}`}>👤 Meus Dados de Contato</h3>
                <p className={`text-xs mb-4 ${t.textMuted}`}>Esses dados aparecem nos relatórios e pedidos impressos.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${t.textMuted}`}>Nome da Empresa (opcional)</label>
                    <input 
                      type="text" 
                      value={(loja as any).empresa || ""} 
                      onChange={(e) => setLoja({...loja, empresa: e.target.value} as any)} 
                      className={`w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 bg-transparent transition-colors ${t.border} ${t.textMain}`}
                      placeholder="Ex: Barbearia do João ME"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${t.textMuted}`}>CNPJ / CPF (opcional)</label>
                    <input 
                      type="text" 
                      value={(loja as any).cnpj_cpf || ""} 
                      onChange={(e) => setLoja({...loja, cnpj_cpf: e.target.value} as any)} 
                      className={`w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 bg-transparent transition-colors ${t.border} ${t.textMain}`}
                      placeholder="00.000.000/0001-00"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${t.textMuted}`}>Nome Completo</label>
                    <input 
                      type="text" 
                      value={(loja as any).nome_completo || ""} 
                      onChange={(e) => setLoja({...loja, nome_completo: e.target.value} as any)} 
                      className={`w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 bg-transparent transition-colors ${t.border} ${t.textMain}`}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${t.textMuted}`}>Telefone / WhatsApp</label>
                    <input 
                      type="text" 
                      value={(loja as any).telefone || ""} 
                      onChange={(e) => setLoja({...loja, telefone: formatarTelefone(e.target.value)} as any)} 
                      className={`w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 bg-transparent transition-colors ${t.border} ${t.textMain}`}
                      placeholder="(00) 0 0000-0000"
                      maxLength={16}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${t.textMuted}`}>E-mail</label>
                    <input 
                      type="email" 
                      value={(loja as any).email || ""} 
                      onChange={(e) => setLoja({...loja, email: e.target.value} as any)} 
                      className={`w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 bg-transparent transition-colors ${t.border} ${t.textMain}`}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${t.textMuted}`}>Site (opcional)</label>
                    <input 
                      type="url" 
                      value={(loja as any).site || ""} 
                      onChange={(e) => setLoja({...loja, site: e.target.value} as any)} 
                      className={`w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 bg-transparent transition-colors ${t.border} ${t.textMain}`}
                      placeholder="https://sua-loja.com.br"
                    />
                  </div>
                </div>
              </div>

              {/* Nome da Loja */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Nome da Loja</label>
                <input 
                  type="text" 
                  value={loja.nome} 
                  onChange={(e) => setLoja({...loja, nome: e.target.value})} 
                  className={`w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-opacity-50 bg-transparent transition-colors ${t.border} ${t.textMain}`} 
                />
              </div>

              {/* Identidade Visual + Mensagem Ticker */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Logotipo da Loja</label>
                  <div className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-zinc-700 bg-black/10">
                    <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center font-bold ${t.bgSidebar} ${t.accent} border-current overflow-hidden shadow-lg shrink-0`}>
                      {loja.logo_url ? (
                        <img src={loja.logo_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="uppercase text-xl">{loja.nome.substring(0, 2)}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input type="file" accept="image/*" onChange={handleUploadLogo} disabled={uploadingLogo} className="hidden" id="logo-upload" />
                      <label htmlFor="logo-upload" className={`inline-block px-4 py-2 rounded-lg font-bold text-xs cursor-pointer transition-all ${uploadingLogo ? 'bg-zinc-700 opacity-50' : `${t.bgAccent} text-white hover:${t.hoverAccent}`}`}>
                        {uploadingLogo ? "Enviando..." : "Alterar"}
                      </label>
                      <p className="text-[10px] mt-1 opacity-60">512x512px</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${t.textMuted}`}>📢 Mensagem Rolante (aviso no topo)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 🎉 10% OFF hoje!" 
                    value={(loja as any).mensagem_ticker ?? ''} 
                    onChange={(e) => setLoja({...loja, mensagem_ticker: e.target.value} as any)} 
                    className={`w-full border rounded-lg p-2 outline-none focus:ring-2 bg-transparent text-sm ${t.border} ${t.textMain}`} 
                  />
                </div>
              </div>

              {/* Formas de Recebimento */}
              <div className={`p-4 rounded-xl border ${t.border} bg-white/5 space-y-3`}>
                <h3 className={`font-bold text-sm flex items-center gap-2 ${t.accent}`}>💰 Recebimento (Pix/Link)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.textMuted}`}>Chave Pix</label>
                    <input type="text" value={(loja as any).pix_recebimento ?? ''} onChange={(e) => setLoja({...loja, pix_recebimento: e.target.value} as any)} className={`w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="Telefone/Email/CPF" />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.textMuted}`}>Link Pagamento</label>
                    <input type="url" value={(loja as any).link_pagamento ?? ''} onChange={(e) => setLoja({...loja, link_pagamento: e.target.value} as any)} className={`w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 ${t.bgSidebar} ${t.border} ${t.textMain}`} placeholder="https://..." />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg border border-dashed border-zinc-700 bg-black/10">
                  <div className={`w-14 h-14 rounded-lg border flex items-center justify-center ${t.bgSidebar} ${t.accent} border-current overflow-hidden shrink-0`}>
                    {(loja as any).qr_code_url ? (
                      <img src={(loja as any).qr_code_url} alt="QR" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] opacity-40">QR</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={handleUploadQR} disabled={uploadingQR} className="hidden" id="qr-upload" />
                    <label htmlFor="qr-upload" className={`inline-block px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${uploadingQR ? 'bg-zinc-700 opacity-50' : `${t.bgAccent} text-white`}`}>
                      {uploadingQR ? "..." : (loja as any).qr_code_url ? "Trocar" : "QR Code"}
                    </label>
                  </div>
                </div>
              </div>

              {/* Sistema de Sons */}
              <div className={`p-4 rounded-xl border ${t.border} bg-white/5 space-y-3`}>
                <h3 className={`font-bold text-sm flex items-center gap-2 ${t.accent}`}>🔊 Sons do Sistema</h3>
                <p className={`text-[10px] ${t.textMuted}`}>Ative e escolha o som para cada área do projeto.</p>
                
                <div className="space-y-2">
                  {/* Som de Pedidos */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔔</span>
                      <div>
                        <p className="text-xs font-medium">Pedidos</p>
                        <p className={`text-[9px] ${t.textMuted}`}>Novo pedido na loja</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(loja as any)?.notificacao_sonora && (
                        <select value={(loja as any)?.som_pedido || 'ding'} onChange={(e) => { setLoja({...loja, som_pedido: e.target.value} as any); tocarNotificacao(e.target.value); }} className={`w-16 text-[10px] border rounded p-1 ${t.border} ${t.bgSidebar}`}>
                          {[{id:'ding',l:'🔔'},{id:'pop',l:'👆'},{id:'tap',l:'👋'},{id:'clap',l:'👏'},{id:'double',l:'🎵'},{id:'thud',l:'👊'},{id:'boom',l:'📢'},{id:'tum',l:'🔊'},{id:'chime',l:'🎐'},{id:'cello',l:'🎻'}].map(s => <option key={s.id} value={s.id}>{s.l}</option>)}
                        </select>
                      )}
                      <button onClick={() => { const novo = !(loja as any).notificacao_sonora; setLoja({...loja, notificacao_sonora: novo} as any); if (!novo) setLoja({...loja, som_pedido: 'ding'} as any); }} className={`w-10 h-5 rounded-full transition-all ${(loja as any).notificacao_sonora ? 'bg-green-500' : 'bg-zinc-600'}`}>
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${(loja as any).notificacao_sonora ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Som da Loja Virtual - Adicionar */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🛒</span>
                      <div>
                        <p className="text-xs font-medium">Loja Virtual (+)</p>
                        <p className={`text-[9px] ${t.textMuted}`}>Cliente adiciona produto</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(loja as any)?.som_loja_virtual && (
                        <select value={(loja as any)?.som_adicionar || 'ding'} onChange={(e) => { setLoja({...loja, som_adicionar: e.target.value} as any); tocarNotificacao(e.target.value); }} className={`w-16 text-[10px] border rounded p-1 ${t.border} ${t.bgSidebar}`}>
                          {[{id:'ding',l:'🔔'},{id:'pop',l:'👆'},{id:'tap',l:'👋'},{id:'clap',l:'👏'},{id:'double',l:'🎵'},{id:'thud',l:'👊'},{id:'boom',l:'📢'},{id:'tum',l:'🔊'},{id:'chime',l:'🎐'},{id:'cello',l:'🎻'}].map(s => <option key={s.id} value={s.id}>{s.l}</option>)}
                        </select>
                      )}
                      <button onClick={() => setLoja({...loja, som_loja_virtual: !(loja as any).som_loja_virtual} as any)} className={`w-10 h-5 rounded-full transition-all ${(loja as any).som_loja_virtual ? 'bg-green-500' : 'bg-zinc-600'}`}>
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${(loja as any).som_loja_virtual ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Som da Loja Virtual - Remover */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">➖</span>
                      <div>
                        <p className="text-xs font-medium">Loja Virtual (-)</p>
                        <p className={`text-[9px] ${t.textMuted}`}>Cliente remove produto</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(loja as any)?.som_loja_virtual && (
                        <select value={(loja as any)?.som_remover || 'tap'} onChange={(e) => { setLoja({...loja, som_remover: e.target.value} as any); tocarNotificacao(e.target.value); }} className={`w-16 text-[10px] border rounded p-1 ${t.border} ${t.bgSidebar}`}>
                          {[{id:'tap',l:'👋'},{id:'thud',l:'👊'},{id:'knock',l:'🚪'},{id:'tum',l:'🔊'}].map(s => <option key={s.id} value={s.id}>{s.l}</option>)}
                        </select>
                      )}
                      <button onClick={() => setLoja({...loja, som_loja_virtual: !(loja as any).som_loja_virtual} as any)} className={`w-10 h-5 rounded-full transition-all ${(loja as any).som_loja_virtual ? 'bg-green-500' : 'bg-zinc-600'}`}>
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${(loja as any).som_loja_virtual ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Som de Agendamento */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      <div>
                        <p className="text-xs font-medium">Agendamento</p>
                        <p className={`text-[9px] ${t.textMuted}`}>Cliente agenda horário</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={(loja as any)?.som_agendamento || 'double'} onChange={(e) => { setLoja({...loja, som_agendamento: e.target.value} as any); tocarNotificacao(e.target.value); }} className={`w-16 text-[10px] border rounded p-1 ${t.border} ${t.bgSidebar}`}>
                        {[{id:'ding',l:'🔔'},{id:'pop',l:'👆'},{id:'tap',l:'👋'},{id:'clap',l:'👏'},{id:'double',l:'🎵'},{id:'thud',l:'👊'},{id:'boom',l:'📢'},{id:'tum',l:'🔊'},{id:'chime',l:'🎐'},{id:'cello',l:'🎻'}].map(s => <option key={s.id} value={s.id}>{s.l}</option>)}
                      </select>
                      <button onClick={() => setLoja({...loja, som_agendamento_ativo: !(loja as any).som_agendamento_ativo} as any)} className={`w-10 h-5 rounded-full transition-all ${(loja as any).som_agendamento_ativo ? 'bg-green-500' : 'bg-zinc-600'}`}>
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${(loja as any).som_agendamento_ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Som de Orçamento */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📄</span>
                      <div>
                        <p className="text-xs font-medium">Orçamento</p>
                        <p className={`text-[9px] ${t.textMuted}`}>Novo orçamento criado</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={(loja as any)?.som_orcamento || 'ding'} onChange={(e) => { setLoja({...loja, som_orcamento: e.target.value} as any); tocarNotificacao(e.target.value); }} className={`w-16 text-[10px] border rounded p-1 ${t.border} ${t.bgSidebar}`}>
                        {[{id:'ding',l:'🔔'},{id:'pop',l:'👆'},{id:'tap',l:'👋'},{id:'clap',l:'👏'},{id:'double',l:'🎵'},{id:'thud',l:'👊'},{id:'boom',l:'📢'},{id:'tum',l:'🔊'},{id:'chime',l:'🎐'},{id:'cello',l:'🎻'}].map(s => <option key={s.id} value={s.id}>{s.l}</option>)}
                      </select>
                      <button onClick={() => setLoja({...loja, som_orcamento_ativo: !(loja as any).som_orcamento_ativo} as any)} className={`w-10 h-5 rounded-full transition-all ${(loja as any).som_orcamento_ativo ? 'bg-green-500' : 'bg-zinc-600'}`}>
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${(loja as any).som_orcamento_ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Som de Ordem de Serviço */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📋</span>
                      <div>
                        <p className="text-xs font-medium">Ordem de Serviço</p>
                        <p className={`text-[9px] ${t.textMuted}`}>Nova OS criada</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={(loja as any)?.som_ordem || 'ding'} onChange={(e) => { setLoja({...loja, som_ordem: e.target.value} as any); tocarNotificacao(e.target.value); }} className={`w-16 text-[10px] border rounded p-1 ${t.border} ${t.bgSidebar}`}>
                        {[{id:'ding',l:'🔔'},{id:'pop',l:'👆'},{id:'tap',l:'👋'},{id:'clap',l:'👏'},{id:'double',l:'🎵'},{id:'thud',l:'👊'},{id:'boom',l:'📢'},{id:'tum',l:'🔊'},{id:'chime',l:'🎐'},{id:'cello',l:'🎻'}].map(s => <option key={s.id} value={s.id}>{s.l}</option>)}
                      </select>
                      <button onClick={() => setLoja({...loja, som_ordem_ativo: !(loja as any).som_ordem_ativo} as any)} className={`w-10 h-5 rounded-full transition-all ${(loja as any).som_ordem_ativo ? 'bg-green-500' : 'bg-zinc-600'}`}>
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${(loja as any).som_ordem_ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Som de Clique */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🖱️</span>
                      <div>
                        <p className="text-xs font-medium">Clique em Botões</p>
                        <p className={`text-[9px] ${t.textMuted}`}>Som ao clicar em botões</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={(loja as any)?.som_clique || 'tap'} onChange={(e) => { setLoja({...loja, som_clique: e.target.value} as any); tocarNotificacao(e.target.value); }} className={`w-16 text-[10px] border rounded p-1 ${t.border} ${t.bgSidebar}`}>
                        {[{id:'pop',l:'👆'},{id:'ding',l:'🔔'},{id:'tap',l:'👋'},{id:'clap',l:'👏'},{id:'double',l:'🎵'},{id:'thud',l:'👊'},{id:'boom',l:'📢'},{id:'tum',l:'🔊'},{id:'chime',l:'🎐'},{id:'cello',l:'🎻'}].map(s => <option key={s.id} value={s.id}>{s.l}</option>)}
                      </select>
                      <button onClick={() => setLoja({...loja, som_clique_ativo: !(loja as any).som_clique_ativo} as any)} className={`w-10 h-5 rounded-full transition-all ${(loja as any).som_clique_ativo ? 'bg-green-500' : 'bg-zinc-600'}`}>
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${(loja as any).som_clique_ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Som de Devolução */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔁</span>
                      <div>
                        <p className="text-xs font-medium">Devolução</p>
                        <p className={`text-[9px] ${t.textMuted}`}>Nova devolução registrada</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={(loja as any)?.som_devolucao || 'tum'} onChange={(e) => { setLoja({...loja, som_devolucao: e.target.value} as any); tocarNotificacao(e.target.value); }} className={`w-16 text-[10px] border rounded p-1 ${t.border} ${t.bgSidebar}`}>
                        {[{id:'tum',l:'🔊'},{id:'pop',l:'👆'},{id:'ding',l:'🔔'},{id:'tap',l:'👋'},{id:'clap',l:'👏'},{id:'double',l:'🎵'},{id:'thud',l:'👊'},{id:'boom',l:'📢'},{id:'chime',l:'🎐'},{id:'cello',l:'🎻'}].map(s => <option key={s.id} value={s.id}>{s.l}</option>)}
                      </select>
                      <button onClick={() => setLoja({...loja, som_devolucao_ativo: !(loja as any).som_devolucao_ativo} as any)} className={`w-10 h-5 rounded-full transition-all ${(loja as any).som_devolucao_ativo ? 'bg-green-500' : 'bg-zinc-600'}`}>
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${(loja as any).som_devolucao_ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Som de Novo Cliente */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👤</span>
                      <div>
                        <p className="text-xs font-medium">Novo Cliente</p>
                        <p className={`text-[9px] ${t.textMuted}`}>Cliente cadastrado</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={(loja as any)?.som_cliente || 'ding'} onChange={(e) => { setLoja({...loja, som_cliente: e.target.value} as any); tocarNotificacao(e.target.value); }} className={`w-16 text-[10px] border rounded p-1 ${t.border} ${t.bgSidebar}`}>
                        {[{id:'ding',l:'🔔'},{id:'pop',l:'👆'},{id:'tap',l:'👋'},{id:'clap',l:'👏'},{id:'double',l:'🎵'},{id:'thud',l:'👊'},{id:'boom',l:'📢'},{id:'tum',l:'🔊'},{id:'chime',l:'🎐'},{id:'cello',l:'🎻'}].map(s => <option key={s.id} value={s.id}>{s.l}</option>)}
                      </select>
                      <button onClick={() => setLoja({...loja, som_cliente_ativo: !(loja as any).som_cliente_ativo} as any)} className={`w-10 h-5 rounded-full transition-all ${(loja as any).som_cliente_ativo ? 'bg-green-500' : 'bg-zinc-600'}`}>
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${(loja as any).som_cliente_ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Som de Produto */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📦</span>
                      <div>
                        <p className="text-xs font-medium">Produto</p>
                        <p className={`text-[9px] ${t.textMuted}`}>Novo produto cadastrado</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={(loja as any)?.som_produto || 'pop'} onChange={(e) => { setLoja({...loja, som_produto: e.target.value} as any); tocarNotificacao(e.target.value); }} className={`w-16 text-[10px] border rounded p-1 ${t.border} ${t.bgSidebar}`}>
                        {[{id:'pop',l:'👆'},{id:'ding',l:'🔔'},{id:'tap',l:'👋'},{id:'clap',l:'👏'},{id:'double',l:'🎵'},{id:'thud',l:'👊'},{id:'boom',l:'📢'},{id:'tum',l:'🔊'},{id:'chime',l:'🎐'},{id:'cello',l:'🎻'}].map(s => <option key={s.id} value={s.id}>{s.l}</option>)}
                      </select>
                      <button onClick={() => setLoja({...loja, som_produto_ativo: !(loja as any).som_produto_ativo} as any)} className={`w-10 h-5 rounded-full transition-all ${(loja as any).som_produto_ativo ? 'bg-green-500' : 'bg-zinc-600'}`}>
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${(loja as any).som_produto_ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Som de Serviço */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💈</span>
                      <div>
                        <p className="text-xs font-medium">Serviço</p>
                        <p className={`text-[9px] ${t.textMuted}`}>Novo serviço cadastrado</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={(loja as any)?.som_servico || 'pop'} onChange={(e) => { setLoja({...loja, som_servico: e.target.value} as any); tocarNotificacao(e.target.value); }} className={`w-16 text-[10px] border rounded p-1 ${t.border} ${t.bgSidebar}`}>
                        {[{id:'pop',l:'👆'},{id:'ding',l:'🔔'},{id:'tap',l:'👋'},{id:'clap',l:'👏'},{id:'double',l:'🎵'},{id:'thud',l:'👊'},{id:'boom',l:'📢'},{id:'tum',l:'🔊'},{id:'chime',l:'🎐'},{id:'cello',l:'🎻'}].map(s => <option key={s.id} value={s.id}>{s.l}</option>)}
                      </select>
                      <button onClick={() => setLoja({...loja, som_servico_ativo: !(loja as any).som_servico_ativo} as any)} className={`w-10 h-5 rounded-full transition-all ${(loja as any).som_servico_ativo ? 'bg-green-500' : 'bg-zinc-600'}`}>
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${(loja as any).som_servico_ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Som de Funcionário */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👥</span>
                      <div>
                        <p className="text-xs font-medium">Funcionário</p>
                        <p className={`text-[9px] ${t.textMuted}`}>Novo funcionário cadastrado</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={(loja as any)?.som_funcionario || 'pop'} onChange={(e) => { setLoja({...loja, som_funcionario: e.target.value} as any); tocarNotificacao(e.target.value); }} className={`w-16 text-[10px] border rounded p-1 ${t.border} ${t.bgSidebar}`}>
                        {[{id:'pop',l:'👆'},{id:'ding',l:'🔔'},{id:'tap',l:'👋'},{id:'clap',l:'👏'},{id:'double',l:'🎵'},{id:'thud',l:'👊'},{id:'boom',l:'📢'},{id:'tum',l:'🔊'},{id:'chime',l:'🎐'},{id:'cello',l:'🎻'}].map(s => <option key={s.id} value={s.id}>{s.l}</option>)}
                      </select>
                      <button onClick={() => setLoja({...loja, som_funcionario_ativo: !(loja as any).som_funcionario_ativo} as any)} className={`w-10 h-5 rounded-full transition-all ${(loja as any).som_funcionario_ativo ? 'bg-green-500' : 'bg-zinc-600'}`}>
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${(loja as any).som_funcionario_ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Módulos Ativáveis */}
              <div className={`p-6 rounded-xl border ${t.border} ${t.card}`}>
                <h3 className={`font-bold mb-1 flex items-center gap-2 ${t.accent}`}>🧩 Módulos do Painel</h3>
                <p className={`text-[10px] mb-4 ${t.textMuted}`}>Desative seções que não usa para deixar o painel mais limpo.</p>
                <div className="space-y-3">
                  {[
                    { chave: 'modulo_agenda', label: '📅 Agenda', desc: 'Agendamento de horários com clientes' },
                    { chave: 'modulo_servicos', label: '✂️ Serviços', desc: 'Catálogo de serviços oferecidos' },
                    { chave: 'modulo_produtos', label: '📦 Produtos', desc: 'Gestão de estoque e loja virtual' },
                    { chave: 'modulo_pedidos', label: '🛒 Pedidos', desc: 'Pedidos recebidos da loja virtual' },
                    { chave: 'modulo_ordens', label: '📋 Ordens de Serviço', desc: 'Ordens de serviço (OS)' },
                    { chave: 'modulo_orcamentos', label: '📄 Orçamentos', desc: 'Criação de orçamentos para clientes' },
                    { chave: 'modulo_funcionarios', label: '👥 Equipe', desc: 'Equipe de funcionários/colaboradores' },
                    { chave: 'modulo_devolucoes', label: '🔁 Devoluções', desc: 'Controle de devoluções e reembolsos' },
                    { chave: 'modulo_vendas_aprazo', label: '💰 Vendas a Prazo', desc: 'Vendas parceladas com controle de parcelas' },
                    { chave: 'modulo_frente_caixa', label: '🛍️ Frente de Caixa (PDV)', desc: 'Venda rápida no balcão com busca por código' },
                  ].map(mod => (
                    <div key={mod.chave} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex-1 min-w-0">
                        <label className="text-sm font-medium block">{mod.label}</label>
                        <p className={`text-[10px] ${t.textMuted}`}>{mod.desc}</p>
                      </div>
                      <button
                        onClick={() => setLoja({...loja, [mod.chave]: !(loja as any)[mod.chave]} as any)}
                        className={`w-12 h-6 rounded-full transition-all shrink-0 ml-3 ${
                          (loja as any)[mod.chave] !== false ? 'bg-green-500' : 'bg-zinc-600'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-all mx-0.5 ${
                          (loja as any)[mod.chave] !== false ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 mt-2">
                    <div className="flex-1 min-w-0">
                      <label className="text-sm font-medium block">📝 Cadastro Completo</label>
                      <p className={`text-[10px] ${t.textMuted}`}>CPF, endereço, email, obs e mais campos</p>
                    </div>
                    <button
                      onClick={() => setLoja({...loja, cadastro_completo: !(loja as any).cadastro_completo} as any)}
                      className={`w-12 h-6 rounded-full transition-all shrink-0 ml-3 ${
                        (loja as any).cadastro_completo ? 'bg-green-500' : 'bg-zinc-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-all mx-0.5 ${
                        (loja as any).cadastro_completo ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Escolha de Tema */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Tema Visual</label>
                <select 
                  value={loja.tema} 
                  onChange={(e) => setLoja({...loja, tema: e.target.value})} 
                  className={`w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-opacity-50 transition-colors ${t.bgSidebar} ${t.border} ${t.textMain}`}
                >
                  <option value="dark-gold">👑 Dark & Gold (Premium)</option>
                  <option value="clean-apple">🕊️ Clean Apple (Minimalista)</option>
                  <option value="vintage">💈 Vintage Clássico (Retrô)</option>
                  <option value="neon">🌃 Cyber Neon (Urbano)</option>
                  <option value="rosa-claro">🌸 Rosa Claro (Delicado)</option>
                  <option value="azul-bebe">💧 Azul Bebê (Sereno)</option>
                  <option value="verde-palha">🌿 Verde Palha (Natural)</option>
                  <option value="verde-menta">🍃 Verde Menta (Fresco)</option>
                  <option value="lilas-suave">🔮 Lilás Suave (Romântico)</option>
                  <option value="coral">🪸 Coral (Vibrante)</option>
                  <option value="cinza-elegante">⚪ Cinza Elegante (Sóbrio)</option>
                  <option value="rose-gold">🌹 Rose Gold (Chique)</option>
                </select>
              </div>

              {/* Variação de Cor do Tema */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>🎨 Variação de Cor</label>
                <select
                  value={(loja as any)?.tom_tema || 'original'}
                  onChange={(e) => setLoja({...loja, tom_tema: e.target.value} as any)}
                  className={`w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-opacity-50 transition-colors ${t.bgSidebar} ${t.border} ${t.textMain}`}
                >
                  {acentosTema[loja.tema] ? Object.keys(acentosTema[loja.tema]).map(k => (
                    <option key={k} value={k}>{k === 'original' ? 'Original' : k.charAt(0).toUpperCase() + k.slice(1)}</option>
                  )) : <option value="original">Original</option>}
                </select>
              </div>

              {/* Horários de Funcionamento */}
              <div className="flex gap-4 border-t border-zinc-800/50 pt-6">
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Abertura</label>
                  <input type="number" min="0" max="23" value={loja.hora_abertura} onChange={(e) => setLoja({...loja, hora_abertura: Number(e.target.value)})} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 bg-transparent transition-colors ${t.border} ${t.textMain}`} />
                </div>
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-2 ${t.textMuted}`}>Fechamento</label>
                  <input type="number" min="0" max="23" value={loja.hora_fechamento} onChange={(e) => setLoja({...loja, hora_fechamento: Number(e.target.value)})} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 bg-transparent transition-colors ${t.border} ${t.textMain}`} />
                </div>
              </div>

              <button 
                onClick={salvarConfiguracoes} 
                className={`w-full font-bold px-6 py-4 rounded-xl text-white transition-all shadow-lg shadow-black/20 active:scale-[0.98] ${t.bgAccent} ${t.hoverAccent}`}
              >
                Salvar Todas as Alterações
              </button>
            </div>
          </div>
        )}

        {/* ================= MODAL BUSCA CLIENTE ================= */}
        {modalBuscaCliente && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-[60] p-4 overflow-y-auto">
            <div className={`p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto ${t.card} ${t.border} border`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Buscar Cliente</h2>
                <button onClick={() => setModalBuscaCliente(null)} className={`p-1 rounded-md hover:bg-black/10 ${t.textMuted}`}><X className="w-5 h-5"/></button>
              </div>
              <input type="text" value={modalBuscaCliente.termo || ''} onChange={(e) => setModalBuscaCliente({...modalBuscaCliente, termo: e.target.value})} placeholder="Buscar por nome, CPF ou telefone..." className={`w-full border rounded-lg p-3 outline-none text-sm mb-4 ${t.bgSidebar} ${t.border} ${t.textMain}`} autoFocus />
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {clientes.filter(c => {
                  const raw = (modalBuscaCliente.termo || '').toLowerCase().trim();
                  if (!raw) return true;
                  const digitado = raw.replace(/\D/g, '');
                  const nomeMatch = (c.nome || '').toLowerCase().includes(raw);
                  const cpfMatch = digitado.length > 0 && (c.cpf || '').replace(/\D/g, '').includes(digitado);
                  const foneMatch = digitado.length > 0 && (c.telefone || '').replace(/\D/g, '').includes(digitado);
                  return nomeMatch || cpfMatch || foneMatch;
                }).map(c => (
                  <button key={c.id} onClick={() => { modalBuscaCliente.onSelect(c); setModalBuscaCliente(null); }} className={`w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors ${t.border} border`}>
                    <p className="font-medium text-sm">{c.nome}</p>
                    <div className="flex gap-3 text-xs text-zinc-500">
                      {c.cpf && <span>CPF: {c.cpf}</span>}
                      {c.telefone && <span>📞 {c.telefone}</span>}
                    </div>
                  </button>
                ))}
                {clientes.filter(c => {
                  const raw = (modalBuscaCliente.termo || '').toLowerCase().trim();
                  if (!raw) return true;
                  const digitado = raw.replace(/\D/g, '');
                  const nomeMatch = (c.nome || '').toLowerCase().includes(raw);
                  const cpfMatch = digitado.length > 0 && (c.cpf || '').replace(/\D/g, '').includes(digitado);
                  const foneMatch = digitado.length > 0 && (c.telefone || '').replace(/\D/g, '').includes(digitado);
                  return nomeMatch || cpfMatch || foneMatch;
                }).length === 0 && (
                  <p className={`text-sm text-center py-8 ${t.textMuted}`}>Nenhum cliente encontrado</p>
                )}
              </div>
            </div>
          </div>
        )}
      {activeTab !== "visao-geral" && (
        <div className="mt-8 text-center md:hidden">
          <button onClick={() => setActiveTab("visao-geral")} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-500 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Voltar para Início
          </button>
        </div>
      )}
      </main>
    </div>
  );
}


