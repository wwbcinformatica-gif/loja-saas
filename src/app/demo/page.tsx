"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, ShoppingBag, ArrowLeft, Plus, Minus, X, MapPin, Phone, Check } from "lucide-react";

const tema = {
  bg: "bg-zinc-950",
  card: "bg-zinc-900",
  border: "border-zinc-800",
  textMain: "text-zinc-100",
  textMuted: "text-zinc-400",
  accent: "text-amber-500",
  bgAccent: "bg-amber-500",
  bgSidebar: "bg-zinc-900",
  hoverAccent: "hover:bg-amber-600",
  btn: "bg-amber-500 hover:bg-amber-600 text-zinc-950",
};

const produtosDemo = [
  {
    id: "1",
    nome: "Pomada Modeladora",
    preco: 35,
    categoria: "Cosméticos",
    imagem_url: null,
    variacoes: [
      { ml: "100g", preco: 35 },
      { ml: "200g", preco: 55 },
    ],
  },
  {
    id: "2",
    nome: "Perfume Importado",
    preco: 80,
    categoria: "Perfumes",
    imagem_url: null,
    variacoes: [
      { ml: "15ml", preco: 30 },
      { ml: "50ml", preco: 50 },
      { ml: "100ml", preco: 80 },
    ],
  },
  {
    id: "3",
    nome: "Gel de Massagem",
    preco: 25,
    categoria: "Cuidados",
    imagem_url: null,
  },
  {
    id: "4",
    nome: "Cera Depilatória",
    preco: 40,
    categoria: "Estética",
    imagem_url: null,
  },
  {
    id: "5",
    nome: "Óleo de Barbear",
    preco: 28,
    categoria: "Barbear",
    imagem_url: null,
  },
];

export default function Demo() {
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [busca, setBusca] = useState("");

  const produtosFiltrados = busca
    ? produtosDemo.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()))
    : produtosDemo;

  const adicionar = (produto: any, variacao?: any) => {
    const preco = variacao ? variacao.preco : produto.preco;
    const nome = variacao ? `${produto.nome} (${variacao.ml})` : produto.nome;
    
    setCarrinho((prev) => {
      const existente = prev.find((item) => item.nome === nome);
      if (existente) {
        return prev.map((item) =>
          item.nome === nome ? { ...item, qtd: item.qtd + 1 } : item
        );
      }
      return [...prev, { id: produto.id, nome, preco, qtd: 1 }];
    });
  };

  const total = carrinho.reduce((acc, item) => acc + item.preco * item.qtd, 0);

  const finalizar = () => {
    const msg = encodeURIComponent(
      `Olá! Gostaria de fazer o seguinte pedido:\n\n${carrinho
        .map((item) => `${item.qtd}x ${item.nome} - R$ ${item.preco.toFixed(2).replace(".", ",")}`)
        .join("\n")}\n\nTotal: R$ ${total.toFixed(2).replace(".", ",")}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className={`min-h-screen ${tema.bg} ${tema.textMain}`}>
      {/* Header */}
      <header className={`${tema.card} border-b ${tema.border} p-4 sticky top-0 z-40`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${tema.bgAccent} flex items-center justify-center`}>
              <Store className="w-6 h-6 text-zinc-950" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Loja Demo</h1>
              <p className={`text-xs ${tema.textMuted}`}>Exemplo de loja virtual</p>
            </div>
          </div>
          <button
            onClick={() => setMostrarCarrinho(true)}
            className={`relative p-3 rounded-xl ${tema.bgSidebar} border ${tema.border}`}
          >
            <ShoppingBag className="w-6 h-6" />
            {carrinho.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-zinc-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {carrinho.reduce((a, b) => a + b.qtd, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Busca */}
      <div className="max-w-4xl mx-auto p-4">
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className={`w-full p-3 rounded-xl ${tema.bgSidebar} border ${tema.border} ${tema.textMain} placeholder:text-zinc-600`}
        />
      </div>

      {/* Grid Produtos */}
      <main className="max-w-4xl mx-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {produtosFiltrados.map((produto) => (
          <div key={produto.id} className={`${tema.card} rounded-xl border ${tema.border} overflow-hidden`}>
            <div className="aspect-square bg-zinc-800 flex items-center justify-center">
              <Store className="w-12 h-12 text-zinc-700" />
            </div>
            <div className="p-3 space-y-2">
              <p className={`text-xs ${tema.textMuted}`}>{produto.categoria}</p>
              <h3 className="font-bold text-sm">{produto.nome}</h3>
              {produto.variacoes ? (
                <div className="flex flex-wrap gap-1">
                  {produto.variacoes.map((v: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => adicionar(produto, v)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${tema.btn}`}
                    >
                      {v.ml} • R$ {v.preco}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => adicionar(produto)}
                  className={`w-full py-2 rounded-lg text-sm font-bold ${tema.btn}`}
                >
                  R$ {produto.preco}
                </button>
              )}
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className={`text-center py-8 ${tema.textMuted} text-sm`}>
        <p>Esta é uma loja de demonstração.</p>
        <Link href="/cadastro" className={`${tema.accent} hover:underline`}>
          Crie sua própria loja →
        </Link>
      </footer>

      {/* Modal Carrinho */}
      {mostrarCarrinho && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
          <div className={`w-full sm:max-w-md ${tema.card} rounded-t-3xl sm:rounded-xl p-6 max-h-[80vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-xl">Seu Carrinho</h2>
              <button onClick={() => setMostrarCarrinho(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {carrinho.length === 0 ? (
              <p className={`text-center py-8 ${tema.textMuted}`}>Seu carrinho está vazio</p>
            ) : (
              <div className="space-y-3 mb-4">
                {carrinho.map((item, i) => (
                  <div key={i} className={`flex justify-between items-center p-3 rounded-lg bg-zinc-800`}>
                    <div>
                      <p className="font-bold text-sm">{item.nome}</p>
                      <p className={`text-xs ${tema.textMuted}`}>R$ {item.preco} cada</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (item.qtd > 1) {
                            setCarrinho(carrinho.map((c, j) => j === i ? { ...c, qtd: c.qtd - 1 } : c));
                          } else {
                            setCarrinho(carrinho.filter((_, j) => j !== i));
                          }
                        }}
                        className="p-1 bg-zinc-700 rounded"
                      >
                        {item.qtd > 1 ? <Minus className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                      <span className="font-bold">{item.qtd}</span>
                      <button onClick={() => adicionar({ id: item.id, nome: item.nome.split(' (')[0], preco: item.preco })} className="p-1 bg-zinc-700 rounded">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {carrinho.length > 0 && (
              <div className="border-t border-zinc-700 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-xl">R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
                <button onClick={finalizar} className={`w-full py-3 rounded-xl font-bold ${tema.btn}`}>
                  Enviar Pedido via WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}