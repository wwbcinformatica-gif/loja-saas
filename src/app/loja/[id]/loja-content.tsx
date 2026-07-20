"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, Plus, Minus, X, Trash2, CheckCircle2, Phone, ArrowLeft, CreditCard, Package, Search } from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  imagem_url?: string;
  ml?: string;
  variacoes?: Array<{ ml: string; preco: number; estoque: number }>;
}

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

export default function LojaContent() {
  const params = useParams();
  const lojaId = params.id as string;

  const [loja, setLoja] = useState<any>(null);
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [passo, setPasso] = useState(1);
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [enderecoCliente, setEnderecoCliente] = useState("");
  const [observacaoPedido, setObservacaoPedido] = useState("");
  const [retirarLocal, setRetirarLocal] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [mlSelecionado, setMlSelecionado] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const f = (v: any) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const tocarSom = (tipo = 'ding') => {
    if (!(loja as any)?.som_loja_virtual) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const volumeBase = 0.3;
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
      const som = tipo || (loja as any)?.som_adicionar || 'ding';
      switch(som) {
        case 'ding': tocarTom(880, "sine", 0.3, ctx.currentTime, 0.2); break;
        case 'pop': tocarTom(600, "sine", 0.2, ctx.currentTime, 0.1); break;
        case 'tap': tocarTom(300, "sine", 0.2, ctx.currentTime, 0.05); break;
        case 'clap': 
          tocarTom(200, "square", 0.25, ctx.currentTime, 0.05);
          tocarTom(180, "square", 0.25, ctx.currentTime + 0.06, 0.05);
          break;
        case 'knock':
          tocarTom(120, "sine", 0.3, ctx.currentTime, 0.05);
          break;
        case 'double':
          tocarTom(440, "triangle", 0.3, ctx.currentTime, 0.15);
          break;
        case 'thud':
          tocarTom(100, "triangle", 0.35, ctx.currentTime, 0.08);
          break;
        case 'tum':
          tocarTom(150, "sine", 0.4, ctx.currentTime, 0.3);
          break;
        case 'cello':
          tocarTom(220, "sawtooth", 0.2, ctx.currentTime, 0.3);
          tocarTom(165, "sawtooth", 0.2, ctx.currentTime + 0.15, 0.4);
          break;
        case 'viola':
          tocarTom(196, "triangle", 0.25, ctx.currentTime, 0.2);
          break;
        case 'chime':
          tocarTom(1047, "sine", 0.2, ctx.currentTime, 0.4);
          break;
        case 'pluck':
          tocarTom(800, "sine", 0.15, ctx.currentTime, 0.03);
          break;
        default: tocarTom(880, "sine", 0.3, ctx.currentTime, 0.2);
      }
    } catch {}
  };

  useEffect(() => {
    if (lojaId) {
      verificarUsuario();
      carregarDados();
    }
  }, [lojaId]);

  const verificarUsuario = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: lojaUsuario } = await supabase
        .from("lojas")
        .select("owner_id")
        .eq("id", lojaId)
        .single();
      if (lojaUsuario?.owner_id === session.user.id) {
        setUsuarioLogado(true);
      }
    }
  };

  const carregarDados = async () => {
    try {
      const { data: lojaData } = await supabase.from("lojas").select("*").eq("id", lojaId).single();
      if (!lojaData) {
        alert("Loja não encontrada.");
        return;
      }
      setLoja(lojaData);

      const { data: prodData } = await supabase
        .from("produtos")
        .select("*")
        .eq("loja_id", lojaId);
      
      const produtosComVariacoes = await Promise.all(
        (prodData || []).map(async (produto) => {
          const { data: variacoes } = await supabase
            .from("produto_variacoes")
            .select("*")
            .eq("produto_id", produto.id);
          return { ...produto, variacoes: variacoes || [] };
        })
      );
      const produtosFiltrados = produtosComVariacoes.filter((p) => {
        const temVariacoes = p.variacoes && p.variacoes.length > 0;
        if (temVariacoes) return true;
        return p.estoque > 0;
      });
      setProdutos(produtosFiltrados);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const adicionarAoCarrinho = (produto: Produto) => {
    const chaveItem = `${produto.id}-${produto.ml || ''}`;
    const existente = carrinho.find((item) => `${item.produto.id}-${item.produto.ml || ''}` === chaveItem);
    if (existente) {
      if (existente.quantidade < produto.estoque) {
        setCarrinho(
          carrinho.map((item) =>
            `${item.produto.id}-${item.produto.ml || ''}` === chaveItem
              ? { ...item, quantidade: item.quantidade + 1 }
              : item
          )
        );
        tocarSom((loja as any)?.som_adicionar || 'ding');
      }
    } else {
      setCarrinho([...carrinho, { produto, quantidade: 1 }]);
      tocarSom((loja as any)?.som_adicionar || 'ding');
    }
  };

  const chaveItem = (item: ItemCarrinho) => `${item.produto.id}-${item.produto.ml || ''}`;

  const removerDoCarrinho = (produtoId: string, ml?: string) => {
    const chave = `${produtoId}-${ml || ''}`;
    setCarrinho(carrinho.filter((item) => chaveItem(item) !== chave));
    tocarSom((loja as any)?.som_remover || 'tap');
  };

  const alterarQuantidade = (produtoId: string, ml: string | undefined, delta: number) => {
    const chave = `${produtoId}-${ml || ''}`;
    const item = carrinho.find((i) => chaveItem(i) === chave);
    if (!item) return;

    const novaQtd = item.quantidade + delta;
    if (novaQtd <= 0) {
      removerDoCarrinho(produtoId, ml);
    } else if (novaQtd <= item.produto.estoque) {
      setCarrinho(
        carrinho.map((i) =>
          chaveItem(i) === chave ? { ...i, quantidade: novaQtd } : i
        )
      );
    }
  };

  const totalCarrinho = carrinho.reduce(
    (acc, item) => acc + item.produto.preco * item.quantidade,
    0
  );

  const quantidadeTotal = carrinho.reduce(
    (acc, item) => acc + item.quantidade,
    0
  );

  const formatarTelefone = (valor: string) => {
    let v = valor.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 10)
      return `(${v.substring(0, 2)}) ${v.substring(2, 3)} ${v.substring(3, 7)}-${v.substring(7)}`;
    else if (v.length > 6)
      return `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
    else if (v.length > 2) return `(${v.substring(0, 2)}) ${v.substring(2)}`;
    return v;
  };

  const finalizarPedido = async () => {
    if (!nomeCliente || telefoneCliente.length < 14) {
      alert("Preencha seu nome e um WhatsApp válido.");
      return;
    }

    setFinalizando(true);
    try {
      const itensFormatados = carrinho
        .map((item) => {
          const desc = item.produto.ml ? `${item.produto.nome} (${item.produto.ml}ml)` : item.produto.nome;
          return `${item.quantidade}x ${desc} - R$ ${item.produto.preco},00`;
        })
        .join("\n");

      let { data: cliente } = await supabase
        .from("clientes")
        .select("id")
        .eq("loja_id", lojaId)
        .eq("telefone", telefoneCliente)
        .single();
      if (!cliente) {
        await supabase
          .from("clientes")
          .insert({ loja_id: lojaId, nome: nomeCliente, telefone: telefoneCliente, email: "" });
      }

      const itensJson = carrinho.map(item => ({
        produto_id: item.produto.id,
        nome: item.produto.nome,
        ml: item.produto.ml || null,
        preco: item.produto.preco,
        quantidade: item.quantidade
      }));

      const { error: pedidoError } = await supabase.from("pedidos").insert({
        loja_id: lojaId,
        cliente_nome: nomeCliente,
        cliente_telefone: telefoneCliente,
        endereco: enderecoCliente || null,
        observacao: observacaoPedido || null,
        itens: itensJson,
        total: totalCarrinho
      });

      if (pedidoError) throw pedidoError;

      for (const item of carrinho) {
        if (item.produto.ml) {
          const { data: variacao } = await supabase
            .from("produto_variacoes")
            .select("estoque")
            .eq("produto_id", item.produto.id)
            .eq("ml", item.produto.ml)
            .single();
          if (variacao) {
            await supabase
              .from("produto_variacoes")
              .update({ estoque: Math.max(0, variacao.estoque - item.quantidade) })
              .eq("produto_id", item.produto.id)
              .eq("ml", item.produto.ml);
          }
        } else {
          const { data: prod } = await supabase
            .from("produtos")
            .select("estoque")
            .eq("id", item.produto.id)
            .single();
          if (prod) {
            await supabase
              .from("produtos")
              .update({ estoque: Math.max(0, prod.estoque - item.quantidade) })
              .eq("id", item.produto.id);
          }
        }
      }

      const mensagem = encodeURIComponent(
        `Olá! Gostaria de fazer o seguinte pedido na ${loja.nome}:\n\n${itensFormatados}\n\nTotal: R$ ${totalCarrinho},00\n\nNome: ${nomeCliente}${enderecoCliente ? `\nEndereço: ${enderecoCliente}` : ''}${observacaoPedido ? `\nObs: ${observacaoPedido}` : ''}`
      );
      window.open(`https://wa.me/55${(loja.telefone || '').replace(/\D/g, '')}?text=${mensagem}`, "_blank");
      
      setSucesso(true);
      setCarrinho([]);
      setEnderecoCliente("");
      setObservacaoPedido("");
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      alert("Erro ao processar pedido: " + err.message);
    } finally {
      setFinalizando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-500 font-bold">
        Carregando loja...
      </div>
    );
  }

  const themeClasses: any = {
    "dark-gold": { bgMain: "bg-zinc-950", textMain: "text-zinc-50", textMuted: "text-zinc-400", accent: "text-amber-500", bgAccent: "bg-amber-500", border: "border-zinc-800", card: "bg-zinc-900" },
    "clean-apple": { bgMain: "bg-slate-50", textMain: "text-slate-900", textMuted: "text-slate-500", accent: "text-blue-600", bgAccent: "bg-blue-600", border: "border-slate-200", card: "bg-white" },
    "vintage": { bgMain: "bg-[#f4f1ea]", textMain: "text-[#2c1810]", textMuted: "text-[#6b5c51]", accent: "text-[#8b0000]", bgAccent: "bg-[#8b0000]", border: "border-[#d1c8b8]", card: "bg-[#fcfbf9]" },
    neon: { bgMain: "bg-[#09090b]", textMain: "text-white", textMuted: "text-zinc-400", accent: "text-fuchsia-500", bgAccent: "bg-fuchsia-600", border: "border-fuchsia-900/30", card: "bg-[#18181b]" },
    "rosa-claro": { bgMain: "bg-[#fff5f7]", textMain: "text-rose-900", textMuted: "text-rose-400", accent: "text-rose-500", bgAccent: "bg-rose-500", border: "border-rose-100", card: "bg-white" },
    "azul-bebe": { bgMain: "bg-[#f0f7ff]", textMain: "text-blue-900", textMuted: "text-blue-400", accent: "text-blue-500", bgAccent: "bg-blue-500", border: "border-blue-100", card: "bg-white" },
    "verde-palha": { bgMain: "bg-[#f8f9f0]", textMain: "text-emerald-900", textMuted: "text-emerald-400", accent: "text-emerald-600", bgAccent: "bg-emerald-600", border: "border-emerald-100", card: "bg-white" },
    "verde-menta": { bgMain: "bg-[#f0faf5]", textMain: "text-emerald-900", textMuted: "text-emerald-400", accent: "text-emerald-500", bgAccent: "bg-emerald-500", border: "border-emerald-200", card: "bg-white" },
    "lilas-suave": { bgMain: "bg-[#f8f5ff]", textMain: "text-purple-900", textMuted: "text-purple-400", accent: "text-purple-500", bgAccent: "bg-purple-500", border: "border-purple-200", card: "bg-white" },
    "coral": { bgMain: "bg-[#fff8f7]", textMain: "text-rose-900", textMuted: "text-rose-400", accent: "text-rose-500", bgAccent: "bg-rose-500", border: "border-rose-200", card: "bg-white" },
    "cinza-elegante": { bgMain: "bg-zinc-50", textMain: "text-zinc-900", textMuted: "text-zinc-500", accent: "text-zinc-700", bgAccent: "bg-zinc-700", border: "border-zinc-200", card: "bg-white" },
    "rose-gold": { bgMain: "bg-[#fdf8f6]", textMain: "text-rose-900", textMuted: "text-rose-300", accent: "text-rose-400", bgAccent: "bg-gradient-to-r from-rose-300 to-amber-300", border: "border-rose-200", card: "bg-white" },
  };
  const t = themeClasses[(loja?.tema as keyof typeof themeClasses) || "dark-gold"];

  if (sucesso) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${t.bgMain} ${t.textMain}`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-bounce ${t.bgAccent}`}>
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Pedido Realizado!</h1>
        <p className={`mb-8 max-w-sm ${t.textMuted}`}>Seu pedido foi enviado via WhatsApp.</p>
        <button onClick={() => { setSucesso(false); setPasso(1); }} className={`px-8 py-4 rounded-xl font-bold text-white ${t.bgAccent}`}>Continuar Comprando</button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.bgMain} ${t.textMain} pb-24`}>
      <header className={`p-4 border-b flex items-center justify-between sticky top-0 z-40 backdrop-blur-md ${t.bgMain} ${t.border}`}>
        <div className="flex items-center gap-3">
          {usuarioLogado && (
            <Link href="/dashboard" className={`p-2 rounded-lg border ${t.border} hover:bg-white/10 transition-colors flex items-center gap-2`}>
              <ArrowLeft className={`w-5 h-5 ${t.accent}`} />
              <span className={`text-xs font-bold ${t.textMuted}`}>Voltar</span>
            </Link>
          )}
          <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold overflow-hidden ${t.bgAccent} border-current`}>
            {loja?.logo_url ? (
              <img src={loja.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xs font-black uppercase">{loja?.nome?.substring(0, 2)}</span>
            )}
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{loja?.nome}</h1>
            <p className={`text-[10px] uppercase font-bold ${t.accent}`}>Loja Virtual</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const link = window.location.href;
            navigator.clipboard.writeText(link);
            alert('Link da loja copiado!');
          }} className={`p-3 rounded-xl border ${t.border} ${t.card}`} title="Copiar link da loja">
            <svg className={`w-5 h-5 ${t.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
          </button>
          <button onClick={() => setMostrarCarrinho(true)} className={`relative p-3 rounded-xl border ${t.border} ${t.card}`}>
            <ShoppingBag className={`w-6 h-6 ${t.accent}`} />
            {quantidadeTotal > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{quantidadeTotal}</span>
            )}
          </button>
        </div>
      </header>

      {produtoSelecionado && (() => {
        const opcoes = (produtoSelecionado.variacoes && produtoSelecionado.variacoes.length > 0) 
          ? produtoSelecionado.variacoes 
          : (produtoSelecionado.ml ? produtoSelecionado.ml.split(",").map((item: string) => {
              const [ml, preco] = item.trim().split(":");
              return { ml: ml, preco: parseFloat(preco) || produtoSelecionado.preco, estoque: 999 };
            }) : []);
        const mlEscolhido = opcoes.find((o: any) => o.ml === mlSelecionado);
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-2xl border p-6 ${t.card} ${t.border}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Escolha o tamanho</h3>
                <button onClick={() => { setProdutoSelecionado(null); setMlSelecionado(""); }} className="p-2 hover:bg-black/10 rounded-lg">
                  <X className={`w-5 h-5 ${t.textMuted}`} />
                </button>
              </div>
              <div className="space-y-3 mb-6">
                {opcoes.map((opcao: any) => (
                  <button key={opcao.ml} onClick={() => setMlSelecionado(opcao.ml)} disabled={opcao.estoque <= 0}
                    className={`w-full p-4 rounded-xl border-2 font-bold flex justify-between items-center transition-all ${
                      mlSelecionado === opcao.ml ? `border-amber-500 ${t.bgAccent} text-white` : opcao.estoque <= 0 ? `${t.border} ${t.card} opacity-50 cursor-not-allowed` : `${t.border} ${t.card} hover:border-amber-500`
                    }`}>
                    <span>{opcao.ml}ml {opcao.estoque <= 0 && <span className="text-xs text-red-500">(Esgotado)</span>}</span>
                    <span className={mlSelecionado === opcao.ml ? "text-white" : t.accent}>{f(opcao.preco)}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => { if (mlSelecionado && mlEscolhido && mlEscolhido.estoque > 0) { adicionarAoCarrinho({ ...produtoSelecionado, ml: mlSelecionado, preco: mlEscolhido.preco, estoque: mlEscolhido.estoque }); setProdutoSelecionado(null); setMlSelecionado(""); } }} disabled={!mlSelecionado || !mlEscolhido || mlEscolhido.estoque <= 0}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${mlSelecionado && mlEscolhido && mlEscolhido.estoque > 0 ? `${t.bgAccent} text-white` : "bg-zinc-600 text-zinc-400 cursor-not-allowed"}`}>
                Adicionar ao Carrinho - {f(mlEscolhido?.preco || 0)}
              </button>
            </div>
          </div>
        );
      })()}

      <main className="p-4 max-w-md mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><Package className="w-5 h-5" /> Produtos Disponíveis</h2>
          <p className={`text-sm ${t.textMuted}`}>Toque no ML desejado para adicionar ao carrinho</p>
        </div>

        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className={`w-5 h-5 ${t.textMuted}`} />
          </div>
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:border-current transition-colors ${t.card} ${t.border} ${t.textMain}`}
          />
        </div>

        {produtos.filter(p => p.nome.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
          <div className={`p-12 text-center rounded-xl border border-dashed ${t.border} ${t.textMuted}`}>
            <p className="mb-2">{produtos.length === 0 ? 'Nenhum produto disponível no momento.' : 'Nenhum produto encontrado.'}</p>
            {produtos.length === 0 && <p className="text-sm opacity-60">Volte mais tarde!</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {produtos.filter(p => p.nome.toLowerCase().includes(searchQuery.toLowerCase())).map((produto) => {
              const temVariacoes = produto.variacoes && produto.variacoes.length > 0;
              const temMlAntigo = produto.ml && produto.ml.includes(":");
              
              if (temMlAntigo) {
                return (
                  <button key={produto.id} onClick={() => { setProdutoSelecionado(produto); setMlSelecionado(""); }} className={`p-4 rounded-2xl border text-left transition-all active:scale-95 ${t.card} ${t.border} hover:border-current`}>
                    <div className={`w-full aspect-[4/3] rounded-xl border mb-2 overflow-hidden flex items-center justify-center bg-zinc-800/50 ${t.border}`}>
                      {produto.imagem_url ? <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-contain p-2" /> : <Package className="w-10 h-10 opacity-20" />}
                    </div>
                    <p className="font-bold text-base mb-1 line-clamp-2">{produto.nome}</p>
                    <p className={`font-black text-base sm:text-lg ${t.accent}`}>A partir de {f(produto.preco)}</p>
                    <p className={`text-xs ${t.textMuted}`}>Clique para escolher</p>
                  </button>
                );
              }

              return temVariacoes ? (
                <div key={produto.id} className={`p-3 rounded-2xl border transition-all ${t.card} ${t.border}`}>
                  <div className={`w-full aspect-[4/3] rounded-xl border mb-2 overflow-hidden flex items-center justify-center bg-zinc-800/50 ${t.border}`}>
                    {produto.imagem_url ? <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-contain p-2" /> : <Package className="w-10 h-10 opacity-20" />}
                  </div>
                  <p className="font-bold text-base mb-2 line-clamp-2 leading-tight">{produto.nome}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {produto.variacoes?.map((v: any) => (
                      <button key={v.ml} onClick={() => adicionarAoCarrinho({ ...produto, ml: v.ml, preco: v.preco, estoque: v.estoque })} disabled={v.estoque <= 0}
                        className={`flex-1 min-w-[60px] text-center px-2 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-all active:scale-95 ${v.estoque <= 0 ? 'opacity-30 cursor-not-allowed' : `${t.border} ${t.bgMain} hover:border-current`}`}>
                        <div className="font-bold">{v.ml}ml</div>
                        <div className={`font-black ${t.accent}`}>{f(v.preco)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button key={produto.id} onClick={() => adicionarAoCarrinho(produto)} className={`p-3 rounded-2xl border text-left transition-all active:scale-95 ${t.card} ${t.border} hover:border-current`}>
                  <div className={`w-full aspect-[4/3] rounded-xl border mb-2 overflow-hidden flex items-center justify-center bg-zinc-800/50 ${t.border}`}>
                    {produto.imagem_url ? <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-contain p-2" /> : <Package className="w-10 h-10 opacity-20" />}
                  </div>
                  <p className="font-bold text-base mb-2 line-clamp-2 leading-tight">{produto.nome}</p>
                  <p className={`font-black text-base sm:text-lg ${t.accent}`}>{f(produto.preco)}</p>
                  <p className={`text-xs ${t.textMuted}`}>Estoque: {produto.estoque} un</p>
                </button>
              );
            })}
          </div>
        )}

        {(loja?.pix_recebimento || loja?.link_pagamento || loja?.qr_code_url) && (
          <div className={`mt-8 p-6 rounded-2xl border ${t.border} ${t.card}`}>
            <p className="font-bold mb-4 flex items-center gap-2">💰 Pagamento à Distância</p>
            <div className="space-y-3">
              {loja?.pix_recebimento && (
                <div className={`flex items-center justify-between p-3 rounded-xl border ${t.border} bg-white/5`}>
                  <span className="text-sm font-medium">📱 Pix</span>
                  <span className={`text-sm font-bold ${t.accent}`} onClick={() => navigator.clipboard.writeText(loja.pix_recebimento)} style={{ cursor: 'pointer' }}>{loja.pix_recebimento}</span>
                </div>
              )}
              {loja?.link_pagamento && (
                <a href={loja.link_pagamento} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-between p-3 rounded-xl border ${t.border} bg-white/5 hover:bg-white/10 transition-colors`}>
                  <span className="text-sm font-medium">🔗 Link de Pagamento</span>
                  <span className={`text-sm font-bold ${t.accent}`}>Abrir →</span>
                </a>
              )}
              {loja?.qr_code_url && (
                <div className="text-center">
                  <p className={`text-sm font-medium mb-2 ${t.textMuted}`}>Escaneie o QR Code</p>
                  <img src={loja.qr_code_url} alt="QR Code de Pagamento" className="inline-block w-40 h-40 rounded-xl border-2 border-dashed p-2" style={{ imageRendering: 'pixelated' }} />
                </div>
              )}
            </div>
          </div>
        )}

        <div className={`mt-4 p-6 rounded-2xl border ${t.border} ${t.card}`}>
          <p className="font-bold mb-3">Também oferece:</p>
          <a href={`/agendar/${lojaId}`} className={`block text-center py-3 rounded-xl font-bold border border-dashed ${t.border} hover:bg-white/5 transition-colors`}>📅 Agendar Serviço</a>
        </div>
      </main>

      {mostrarCarrinho && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end animate-in fade-in duration-300">
          <div className={`w-full max-w-md mx-auto rounded-t-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${t.card} ${t.border} border-b-0`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> Seu Carrinho</h2>
              <button onClick={() => setMostrarCarrinho(false)} className={`p-2 rounded-lg hover:bg-white/10 ${t.textMuted}`}><X className="w-5 h-5" /></button>
            </div>

            {carrinho.length === 0 ? (
              <div className={`text-center py-12 ${t.textMuted}`}>
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>Carrinho vazio</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {carrinho.map((item) => (
                    <div key={`${item.produto.id}-${item.produto.ml || ''}`} className={`flex items-center gap-4 p-4 rounded-xl border ${t.border} ${t.bgMain}`}>
                      <div className={`w-12 h-12 rounded-lg border overflow-hidden flex items-center justify-center shrink-0 ${t.border}`}>
                        {item.produto.imagem_url ? <img src={item.produto.imagem_url} alt={item.produto.nome} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 opacity-30" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{item.produto.nome}</p>
                        {item.produto.ml && <p className={`text-xs font-semibold ${t.accent}`}>{item.produto.ml}ml</p>}
                        <p className={`font-black text-sm ${t.accent}`}>{f(item.produto.preco)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => alterarQuantidade(item.produto.id, item.produto.ml, -1)} className={`p-2 rounded-lg border ${t.border}`}><Minus className="w-4 h-4" /></button>
                        <span className="font-bold w-8 text-center">{item.quantidade}</span>
                        <button onClick={() => alterarQuantidade(item.produto.id, item.produto.ml, 1)} disabled={item.quantidade >= item.produto.estoque} className={`p-2 rounded-lg border ${t.border} disabled:opacity-30`}><Plus className="w-4 h-4" /></button>
                      </div>
                      <button onClick={() => removerDoCarrinho(item.produto.id, item.produto.ml)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>

                <div className={`p-4 rounded-xl border border-dashed mb-6 ${t.border}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total:</span>
                    <span className={`font-black text-2xl ${t.accent}`}>{f(totalCarrinho)}</span>
                  </div>
                </div>

                {passo === 1 ? (
                  <button onClick={() => setPasso(2)} className={`w-full py-4 rounded-xl font-bold text-white text-lg ${t.bgAccent}`}>Finalizar Pedido</button>
                ) : (
                  <div className="space-y-4 animate-in slide-in-from-right duration-300">
                    <button onClick={() => setPasso(1)} className={`text-sm font-bold ${t.textMuted} mb-2`}>← Voltar ao carrinho</button>
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${t.textMuted}`}>Seu Nome Completo</label>
                      <input type="text" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} placeholder="Como quer ser chamado?" className={`w-full p-4 rounded-xl border outline-none focus:ring-2 ${t.card} ${t.border} ${t.textMain}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${t.textMuted}`}>Seu WhatsApp</label>
                      <input type="text" value={telefoneCliente} onChange={(e) => setTelefoneCliente(formatarTelefone(e.target.value))} placeholder="(00) 0 0000-0000" maxLength={16} className={`w-full p-4 rounded-xl border outline-none focus:ring-2 ${t.card} ${t.border} ${t.textMain}`} />
                    </div>
                    <div className="flex gap-2 p-1 bg-zinc-800 rounded-xl">
                      <button type="button" onClick={() => { setRetirarLocal(true); setEnderecoCliente(""); }} className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${retirarLocal ? `${t.bgAccent} text-white` : 'text-zinc-400'}`}>📍 Retirar no local</button>
                      <button type="button" onClick={() => setRetirarLocal(false)} className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${!retirarLocal ? `${t.bgAccent} text-white` : 'text-zinc-400'}`}>🚚 Receber entrega</button>
                    </div>
                    {!retirarLocal && (
                      <div>
                        <label className={`block text-sm font-bold mb-2 ${t.textMuted}`}>Endereço para Entrega</label>
                        <input type="text" value={enderecoCliente} onChange={(e) => setEnderecoCliente(e.target.value)} placeholder="Rua, número, bairro, cidade" className={`w-full p-4 rounded-xl border outline-none focus:ring-2 ${t.card} ${t.border} ${t.textMain}`} />
                      </div>
                    )}
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${t.textMuted}`}>Observação (opcional)</label>
                      <input type="text" value={observacaoPedido} onChange={(e) => setObservacaoPedido(e.target.value)} placeholder="Ex: Deixar na portaria" className={`w-full p-4 rounded-xl border outline-none focus:ring-2 ${t.card} ${t.border} ${t.textMain}`} />
                    </div>
                    <button onClick={finalizarPedido} disabled={finalizando} className={`w-full py-4 rounded-xl font-black text-lg text-white flex items-center justify-center gap-2 ${t.bgAccent} disabled:opacity-50`}>
                      {finalizando ? "Enviando..." : <><Phone className="w-5 h-5" /> Enviar Pedido via WhatsApp</>}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
