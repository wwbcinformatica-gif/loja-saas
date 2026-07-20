"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Store, Clock, Calendar, User, CheckCircle2, ChevronRight, ChevronLeft, Phone, UserCircle, ArrowLeft } from "lucide-react";

export default function AgendaContent() {
  const params = useParams();
  const router = useRouter();
  const lojaId = params.id as string;

  const [loja, setLoja] = useState<any>(null);
  const [servicos, setServicos] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Fluxo
  const [passo, setPasso] = useState(1);
  const [servicoSel, setServicoSel] = useState<any>(null);
  const [funcionarioSel, setFuncionarioSel] = useState<any>(null);
  const [dataSel, setDataSel] = useState<string>(new Date().toISOString().split('T')[0]);
  const [horaSel, setHoraSel] = useState<string | null>(null);
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [finalizando, setFinalizando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (lojaId) carregarDados();
  }, [lojaId]);

  const carregarDados = async () => {
    try {
      const { data: lojaData } = await supabase.from("lojas").select("*").eq("id", lojaId).single();
      if (!lojaData) {
        alert("Loja não encontrada.");
        return;
      }
      setLoja(lojaData);

      const { data: servData } = await supabase.from("servicos").select("*").eq("loja_id", lojaId);
      setServicos(servData || []);

      const { data: funcData } = await supabase.from("funcionarios").select("*").eq("loja_id", lojaId);
      setFuncionarios(funcData || []);

      const { data: agData } = await supabase.from("agendamentos").select("*").eq("loja_id", lojaId);
      setAgendamentos(agData || []);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
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

  const slotsDisponiveis = useMemo(() => {
    if (!loja) return [];
    const slots = [];
    for (let i = loja.hora_abertura; i < loja.hora_fechamento; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
      slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    
    return slots.map(hora => {
      const [h, m] = hora.split(":");
      const ocupado = agendamentos.find(ag => {
        const dAg = new Date(ag.data_hora);
        const mesmDia = dAg.toISOString().split('T')[0] === dataSel;
        const mesmaHora = dAg.getHours() === parseInt(h) && dAg.getMinutes() === parseInt(m);
        const mesmoFuncionario = funcionarioSel ? ag.funcionario_id === funcionarioSel.id : true;
        return mesmDia && mesmaHora && mesmoFuncionario;
      });
      return { hora, disponivel: !ocupado };
    });
  }, [loja, agendamentos, dataSel, funcionarioSel]);

  const finalizarAgendamento = async () => {
    if (!nomeCliente || telefoneCliente.length < 14) {
      alert("Preencha seu nome e um WhatsApp válido.");
      return;
    }

    setFinalizando(true);
    try {
      let { data: cliente } = await supabase
        .from("clientes")
        .select("id")
        .eq("loja_id", lojaId)
        .eq("telefone", telefoneCliente)
        .single();

      if (!cliente) {
        const { data: novoC } = await supabase
          .from("clientes")
          .insert({ loja_id: lojaId, nome: nomeCliente, telefone: telefoneCliente, email: "" })
          .select()
          .single();
        cliente = novoC;
      }

      const dataAg = new Date(dataSel);
      const [h, m] = horaSel!.split(":");
      dataAg.setHours(parseInt(h), parseInt(m), 0, 0);

        const { error } = await supabase.from("agendamentos").insert({
          loja_id: lojaId,
          funcionario_id: funcionarioSel.id,
          cliente_id: cliente!.id,
          data_hora: dataAg.toISOString(),
          servico: servicoSel.nome
        });

      if (error) throw error;
      setSucesso(true);
      const audio = new Audio('/sounds/double.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (err: any) {
      alert("Erro ao agendar: " + err.message);
    } finally {
      setFinalizando(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-500 font-bold">Carregando loja...</div>;
  }

  const themeClasses: any = {
    "dark-gold": { bgMain: "bg-zinc-950", textMain: "text-zinc-50", textMuted: "text-zinc-400", accent: "text-amber-500", bgAccent: "bg-amber-500", border: "border-zinc-800", card: "bg-zinc-900" },
    "clean-apple": { bgMain: "bg-slate-50", textMain: "text-slate-900", textMuted: "text-slate-500", accent: "text-blue-600", bgAccent: "bg-blue-600", border: "border-slate-200", card: "bg-white" },
    "vintage": { bgMain: "bg-[#f4f1ea]", textMain: "text-[#2c1810]", textMuted: "text-[#6b5c51]", accent: "text-[#8b0000]", bgAccent: "bg-[#8b0000]", border: "border-[#d1c8b8]", card: "bg-[#fcfbf9]" },
    "neon": { bgMain: "bg-[#09090b]", textMain: "text-white", textMuted: "text-zinc-400", accent: "text-fuchsia-500", bgAccent: "bg-fuchsia-600", border: "border-fuchsia-900/30", card: "bg-[#18181b]" },
    "rosa-claro": { bgMain: "bg-[#fff5f7]", textMain: "text-rose-900", textMuted: "text-rose-400", accent: "text-rose-500", bgAccent: "bg-rose-500", border: "border-rose-100", card: "bg-white" },
    "azul-bebe": { bgMain: "bg-[#f0f7ff]", textMain: "text-blue-900", textMuted: "text-blue-400", accent: "text-blue-500", bgAccent: "bg-blue-500", border: "border-blue-100", card: "bg-white" },
    "verde-palha": { bgMain: "bg-[#f8f9f0]", textMain: "text-emerald-900", textMuted: "text-emerald-400", accent: "text-emerald-600", bgAccent: "bg-emerald-600", border: "border-emerald-100", card: "bg-white" }
  };
  const t = themeClasses[(loja.tema as keyof typeof themeClasses) || "dark-gold"];

  if (sucesso) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${t.bgMain} ${t.textMain}`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-bounce ${t.bgAccent}`}>
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Agendado com Sucesso!</h1>
        <p className={`mb-8 ${t.textMuted}`}>Seu horário foi reservado. Aguardamos você na **{loja.nome}**.</p>
        <div className={`p-6 rounded-2xl border w-full max-w-sm mb-8 ${t.card} ${t.border}`}>
           <p className="text-sm uppercase tracking-widest opacity-60 mb-2">Detalhes do Agendamento</p>
           <p className="font-bold text-lg">{servicoSel.nome}</p>
           <p className="text-base">{funcionarioSel.nome}</p>
           <p className={`font-black text-xl mt-2 ${t.accent}`}>{new Date(dataSel).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {horaSel}</p>
        </div>
        <button 
          onClick={() => {
            const msg = encodeURIComponent(`Olá! Acabei de agendar um(a) ${servicoSel.nome} na ${loja.nome} para o dia ${new Date(dataSel).toLocaleDateString('pt-BR')} às ${horaSel}.`);
            window.open(`https://wa.me/55${telefoneCliente.replace(/\D/g, '')}?text=${msg}`, '_blank');
          }}
          className={`w-full max-w-sm py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${t.bgAccent}`}
        >
          <Phone className="w-5 h-5" /> Confirmar via WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.bgMain} ${t.textMain} pb-20`}>
      <header className={`p-4 border-b flex items-center gap-4 ${t.border} backdrop-blur-md sticky top-0 z-40 bg-opacity-80 ${t.bgMain}`}>
        <button 
          onClick={() => router.back()} 
          className={`p-2 rounded-lg border ${t.border} hover:bg-white/10 transition-colors`}
        >
          <ArrowLeft className={`w-5 h-5 ${t.accent}`} />
        </button>
        <div className="flex-1 text-center">
          <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold mx-auto ${t.card} ${t.accent} border-current overflow-hidden shadow-lg`}>
            {loja.logo_url ? <img src={loja.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <span className="uppercase text-xl">{loja.nome.substring(0, 2)}</span>}
          </div>
          <h1 className="text-base font-bold tracking-tight mt-2">{loja.nome}</h1>
          <p className={`text-[10px] uppercase tracking-widest font-bold ${t.accent}`}>Agendamento</p>
        </div>
        <div className="w-9"></div>
      </header>

      <main className="max-w-md mx-auto p-6">
        
        <div className="flex justify-between items-center mb-10 px-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${passo >= i ? `${t.bgAccent} text-white` : `bg-white/10 ${t.textMuted}`}`}>
                {passo > i ? <CheckCircle2 className="w-5 h-5" /> : i}
              </div>
              {i < 4 && <div className={`flex-1 h-1 mx-2 rounded-full ${passo > i ? t.bgAccent : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {passo === 1 && (
          <div className="animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Store className="w-6 h-6" /> O que vamos fazer hoje?</h2>
            <div className="space-y-4">
              {servicos.map((s) => (
                <button 
                  key={s.id} 
                  onClick={() => { setServicoSel(s); setPasso(2); }}
                  className={`w-full p-5 rounded-2xl border text-left flex justify-between items-center transition-all active:scale-[0.98] ${servicoSel?.id === s.id ? `border-current ${t.bgAccent} text-white` : `${t.card} ${t.border} hover:border-zinc-500`}`}
                >
                  <div>
                    <p className="font-bold text-lg">{s.nome}</p>
                    <p className={`text-sm ${servicoSel?.id === s.id ? 'text-white/80' : t.textMuted}`}>{s.duracao} min</p>
                  </div>
                  <p className="font-black text-xl">R$ {s.preco},00</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {passo === 2 && (
          <div className="animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-6">
               <button onClick={() => setPasso(1)} className={`p-2 rounded-lg ${t.card} border ${t.border}`}><ChevronLeft className="w-5 h-5"/></button>
               <h2 className="text-2xl font-bold flex items-center gap-2"><UserCircle className="w-6 h-6" /> Com quem?</h2>
            </div>
            <div className="space-y-4">
              {funcionarios.map((b) => (
                <button 
                  key={b.id} 
                  onClick={() => { setFuncionarioSel(b); setPasso(3); }}
                  className={`w-full p-5 rounded-2xl border text-left flex items-center gap-4 transition-all active:scale-[0.98] ${funcionarioSel?.id === b.id ? `border-current ${t.bgAccent} text-white` : `${t.card} ${t.border} hover:border-zinc-500`}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${funcionarioSel?.id === b.id ? 'bg-white/20' : t.bgMain} border border-current uppercase`}>{b.nome.substring(0, 2)}</div>
                  <p className="font-bold text-lg flex-1">{b.nome}</p>
                  <ChevronRight className="w-5 h-5 opacity-40" />
                </button>
              ))}
            </div>
          </div>
        )}

        {passo === 3 && (
          <div className="animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-6">
               <button onClick={() => setPasso(2)} className={`p-2 rounded-lg ${t.card} border ${t.border}`}><ChevronLeft className="w-5 h-5"/></button>
               <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="w-6 h-6" /> Quando?</h2>
            </div>
            
            <input 
              type="date" 
              min={new Date().toISOString().split('T')[0]}
              value={dataSel}
              onChange={(e) => setDataSel(e.target.value)}
              className={`w-full p-4 rounded-xl border mb-8 outline-none font-bold text-lg ${t.card} ${t.border} ${t.textMain} color-scheme-dark`}
            />

            <p className={`text-sm font-bold uppercase tracking-widest mb-4 ${t.textMuted}`}>Horários para {new Date(dataSel).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</p>
            
            <div className="grid grid-cols-3 gap-3">
              {slotsDisponiveis.map(({ hora, disponivel }) => (
                <button 
                  key={hora}
                  disabled={!disponivel}
                  onClick={() => { setHoraSel(hora); setPasso(4); }}
                  className={`p-3 rounded-xl border font-bold text-sm transition-all ${!disponivel ? 'opacity-20 cursor-not-allowed grayscale' : horaSel === hora ? `${t.bgAccent} text-white border-current` : `${t.card} ${t.border} hover:border-current`}`}
                >
                  {hora}
                </button>
              ))}
            </div>
          </div>
        )}

        {passo === 4 && (
          <div className="animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-6">
               <button onClick={() => setPasso(3)} className={`p-2 rounded-lg ${t.card} border ${t.border}`}><ChevronLeft className="w-5 h-5"/></button>
               <h2 className="text-2xl font-bold flex items-center gap-2"><User className="w-6 h-6" /> Só mais um detalhe...</h2>
            </div>

            <div className={`p-6 rounded-2xl border mb-8 border-dashed ${t.border} bg-white/5`}>
               <p className="text-sm opacity-60 mb-1">Resumo do agendamento:</p>
                <p className="font-bold text-lg">{servicoSel.nome} com {funcionarioSel.nome}</p>
               <p className={`font-black ${t.accent}`}>{new Date(dataSel).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {horaSel}</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-bold mb-2 ${t.textMuted}`}>Seu Nome Completo</label>
                <input 
                  type="text" 
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  placeholder="Como quer ser chamado?"
                  className={`w-full p-4 rounded-xl border outline-none focus:ring-2 ${t.card} ${t.border} ${t.textMain}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${t.textMuted}`}>Seu WhatsApp</label>
                <input 
                  type="text" 
                  value={telefoneCliente}
                  onChange={(e) => setTelefoneCliente(formatarTelefone(e.target.value))}
                  placeholder="(00) 0 0000-0000"
                  maxLength={16}
                  className={`w-full p-4 rounded-xl border outline-none focus:ring-2 ${t.card} ${t.border} ${t.textMain}`}
                />
              </div>
              
              <button 
                onClick={finalizarAgendamento}
                disabled={finalizando}
                className={`w-full py-5 rounded-2xl font-black text-xl text-white shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${t.bgAccent}`}
              >
                {finalizando ? "Processando..." : "CONFIRMAR AGENDAMENTO"}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
