"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, HelpCircle, User, Store, Calendar, ShoppingBag, Package, Settings, ChevronDown, ChevronUp, Printer, LogOut, TrendingUp, Users, Briefcase, Upload, Image, ShoppingCart, CreditCard, Smartphone, Monitor, Tablet, CheckCircle, AlertCircle, Shield, Search, Edit2, XCircle, Database } from "lucide-react";
import { supabase } from "@/lib/supabase";

function Secao({ titulo, icone: Icone, cor, children }: { titulo: string; icone: any; cor: string; children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button onClick={() => setAberto(!aberto)} className="w-full flex items-center justify-between p-5 hover:bg-zinc-800/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${cor}`}>
            <Icone className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold">{titulo}</h2>
        </div>
        {aberto ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
      </button>
      {aberto && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

function Topico({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-amber-500/50 pl-4">
      <h3 className="font-bold text-zinc-200 text-sm">{titulo}</h3>
      <div className="text-zinc-400 text-sm mt-1 leading-relaxed">{children}</div>
    </div>
  );
}

export default function Ajuda() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data?.user?.email?.toLowerCase() || null);
    });
  }, []);

  const isAdmin = userEmail === 'wwbcinformatica@gmail.com';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-6 font-bold text-sm">
          <ArrowLeft className="w-5 h-5" />
          Voltar para Home
        </Link>

        <h1 className="text-3xl font-bold text-amber-500 mb-2">📖 Manual Completo</h1>
        <p className="text-zinc-400 mb-8">Aprenda a usar o sistema do zero — clique nos tópicos para expandir</p>

        {/* Novidades */}
        <div className="bg-green-900/20 border border-green-800 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-green-400">🆕 Novidades (Maio/2026)</h2>
          </div>
          <ul className="text-zinc-300 text-sm space-y-2">
            <li>✅ <strong>Novo domínio:</strong> <code className="bg-zinc-800 px-1 rounded text-xs">loja-saas-ten.vercel.app</code> (o antigo redireciona automaticamente)</li>
            <li>✅ <strong>Novo banco de dados:</strong> Projeto Supabase recriado com todas as tabelas e segurança</li>
            <li>✅ <strong>Modais melhorados:</strong> Agora rolam quando o conteúdo é grande (não fica cortado)</li>
            <li>✅ <strong>Menu lateral:</strong> Botões Ajuda e Sair agora estão no topo do menu</li>
          </ul>
        </div>

        <div className="space-y-3">
          {/* ========== MANUAL DO ADMINISTRADOR (ROOT) ========== */}
          {isAdmin && (
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-500 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold">⚡ Painel do Administrador (Root)</h2>
              </div>
              <p className="text-zinc-400 text-sm mb-4">Acesso total ao sistema — gerencie todas as lojas e configurações globais.</p>
              
              <div className="space-y-2">
                <Secao titulo="1. Acessar Painel Root" icone={Shield} cor="bg-red-500">
                  <Topico titulo="URL do Admin">
                    Acesse <Link href="/admin" className="text-amber-500 underline">/admin</Link> — disponível apenas para o email <strong>wwbcinformatica@gmail.com</strong>.
                  </Topico>
                  <Topico titulo="Funcionalidades">
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Ver todas as lojas cadastradas</li>
                      <li>Ativar/desativar lojas</li>
                      <li>Ver estatísticas globais</li>
                      <li>Gerenciar assinatura de cada lojista</li>
                    </ul>
                  </Topico>
                </Secao>

                <Secao titulo="2. Configurações do SaaS" icone={Settings} cor="bg-red-500">
                  <Topico titulo="Módulos disponíveis">
                    Cada lojista pode ativar/desativar módulos nas configurações:
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>📅 Agenda — agendamento de horários</li>
                      <li>✂️ Serviços — catálogo de serviços</li>
                      <li>📦 Produtos — gestão de estoque e loja virtual</li>
                      <li>🛒 Pedidos — pedidos da loja virtual</li>
                      <li>📋 Ordens de Serviço</li>
                      <li>📄 Orçamentos</li>
                      <li>👥 Equipe/Funcionários</li>
                      <li>🔁 Devoluções</li>
                    </ul>
                  </Topico>
                  <Topico titulo="Cadastro completo de clientes">
                    Ative para campos extras: CPF/CNPJ, CEP (busca automática), Email, Estado, Endereço, Bairro, Cidade, Data de Nascimento, Observações.
                  </Topico>
                </Secao>

                <Secao titulo="3. Banco de Dados" icone={Database} cor="bg-red-500">
                  <Topico titulo="Supabase">
                    O banco está em <strong>db.nrokzgsxljjrgoebbajn.supabase.co</strong> — accessível pelo painel do Supabase (projeto: <code className="bg-zinc-700 px-1 rounded text-xs">loja-saas-ten</code>).
                  </Topico>
                  <Topico titulo="Tabelas principais">
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li><strong>lojas</strong> — configurações de cada loja</li>
                      <li><strong>clientes</strong> — clientes de todas as lojas</li>
                      <li><strong>produtos</strong> — catálogo de produtos</li>
                      <li><strong>servicos</strong> — serviços oferecidos</li>
                      <li><strong>agendamentos</strong> — agendamentos marcados</li>
                      <li><strong>pedidos</strong> — pedidos da loja virtual</li>
                      <li><strong>funcionarios</strong> — equipe de funcionários/colaboradores</li>
                    </ul>
                  </Topico>
                </Secao>
              </div>
            </div>
          )}

          {/* ========== MANUAL DO LOJISTA ========== */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Store className="w-5 h-5 text-zinc-950" />
              </div>
              <h2 className="text-xl font-bold">📋 Manual do Lojista</h2>
            </div>
            <p className="text-zinc-400 text-sm mb-4">Guia completo para gerenciar sua loja, produtos e agendamentos.</p>
            
            <div className="space-y-2">
              <Secao titulo="1. Primeiro Acesso e Login" icone={LogOut} cor="bg-amber-500">
                <Topico titulo="Criar conta">
                  Acesse a página de <Link href="/cadastro" className="text-amber-500 underline">Cadastro</Link>, preencha seu e-mail e senha. Após confirmar o e-mail, você já pode fazer login.
                </Topico>
                <Topico titulo="Fazer login">
                  Vá em <Link href="/login" className="text-amber-500 underline">Login</Link> e insira seu e-mail e senha. Seu dashboard será carregado automaticamente.
                </Topico>
                <Topico titulo="Dashboard">
                  A tela principal mostra: total de clientes, agendamentos do dia e previsão de receita. Use o menu lateral para navegar entre as seções.
                </Topico>
              </Secao>

              <Secao titulo="2. Configurações da Loja" icone={Settings} cor="bg-amber-500">
                <Topico titulo="Dados da loja">
                  Na aba "Configurações" você pode definir:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><strong>Nome da Loja</strong> — aparece na loja virtual e agendamento</li>
                    <li><strong>Logotipo</strong> — faça upload da sua logo (aparece no topo)</li>
                    <li><strong>Tema Visual</strong> — escolha entre Dark Gold, Clean Apple, Vintage, Neon, Rosa, Azul, Verde</li>
                    <li><strong>Horário de funcionamento</strong> — define os horários disponíveis para agendamento</li>
                    <li><strong>Seus dados</strong> — nome completo, WhatsApp, e-mail e site</li>
                  </ul>
                </Topico>
                <Topico titulo="Salvar configurações">
                  Após alterar, clique em "Salvar Configurações". As mudanças se aplicam na hora para toda plataforma.
                </Topico>
              </Secao>

              <Secao titulo="3. Gerenciar Produtos" icone={Package} cor="bg-amber-500">
                <Topico titulo="Cadastrar produto simples">
                  Vá em "Produtos" &gt; "Novo Produto". Preencha:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><strong>Foto</strong> — clique em "Selecionar Foto" e escolha uma imagem</li>
                    <li><strong>Nome</strong> — ex: "Pomada Modeladora"</li>
                    <li><strong>Categoria</strong> — ex: "Cosméticos" (opcional)</li>
                    <li><strong>Preço</strong> — valor de venda</li>
                    <li><strong>Unidade</strong> — UN, KG, ML, etc.</li>
                    <li><strong>Estoque</strong> — quantidade disponível</li>
                  </ul>
                </Topico>
                <Topico titulo="Cadastrar produto com variações de ML (perfumes)">
                  Para produtos que têm vários tamanhos (ex: 15ml, 50ml, 100ml):
                  <ol className="list-decimal pl-5 mt-1 space-y-1">
                    <li>Preencha nome e categoria normalmente</li>
                    <li>Na seção <strong>"Variações (ML)"</strong>, clique em "+ Adicionar variação"</li>
                    <li>Para cada tamanho, preencha: <strong>ML</strong> (ex: 15), <strong>Preço</strong> (ex: 30) e <strong>Estoque</strong> (ex: 10)</li>
                    <li>Adicione quantas variações precisar (15ml, 50ml, 100ml, etc.)</li>
                    <li>O campo "Preço de Venda" e "Estoque" debaixo desaparecem automaticamente</li>
                    <li>Clique em "Cadastrar Produto"</li>
                  </ol>
                </Topico>
                <Topico titulo="Como fica na loja virtual">
                  <div className="bg-zinc-800 p-3 rounded-lg mt-2 text-xs">
                    <p className="font-bold text-amber-400">Perfume Importado</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-3 py-1.5 bg-zinc-700 rounded-lg border border-zinc-600">15ml · R$ 30</span>
                      <span className="px-3 py-1.5 bg-zinc-700 rounded-lg border border-zinc-600">50ml · R$ 50</span>
                      <span className="px-3 py-1.5 bg-zinc-700 rounded-lg border border-zinc-600">100ml · R$ 80</span>
                    </div>
                    <p className="text-zinc-500 mt-2">Cliente toca no tamanho desejado e vai direto pro carrinho</p>
                  </div>
                </Topico>
                <Topico titulo="Editar ou excluir produto">
                  Na lista de produtos, clique no ícone de lápis para editar ou na lixeira para excluir. Ao editar, as variações carregam automaticamente.
                </Topico>
              </Secao>

              <Secao titulo="4. Loja Virtual" icone={ShoppingBag} cor="bg-amber-500">
                <Topico titulo="O que é?">
                  Sua loja online onde os clientes podem ver os produtos, escolher tamanhos e enviar pedidos via WhatsApp.
                </Topico>
                <Topico titulo="Link da loja">
                  Nas Configurações, você encontra o link da sua loja. Copie e compartilhe no Instagram, WhatsApp ou site.
                </Topico>
                <Topico titulo="Como funciona para o cliente">
                  <ol className="list-decimal pl-5 mt-1 space-y-1">
                    <li>Cliente abre o link da loja</li>
                    <li>Vê os produtos disponíveis com fotos e preços</li>
                    <li>Se for perfume com variações, toca no ML desejado</li>
                    <li>O produto vai direto para o carrinho</li>
                    <li>Clica no carrinho, preenche nome e WhatsApp</li>
                    <li>Finaliza e o pedido vai para seu WhatsApp</li>
                  </ol>
                </Topico>
                <Topico titulo="Pedido no WhatsApp">
                  Quando o cliente finaliza a compra, você recebe uma mensagem no WhatsApp com todos os detalhes: produtos, quantidades, ML escolhido, preços e nome do cliente.
                </Topico>
                <Topico titulo="Formas de Recebimento">
                  Nas Configurações do painel, você pode configurar opções para clientes pagarem à distância:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><strong>Chave Pix:</strong> CPF, CNPJ, telefone ou e-mail - o cliente copia e paga no app do banco</li>
                    <li><strong>Link de Pagamento:</strong> URL do Mercado Pago, PicPay, etc - abre a tela de pagamento</li>
                    <li><strong>QR Code:</strong> Imagem do QR Code Pix - o cliente escaneia com a câmera</li>
                  </ul>
                  Estas opções aparecem na loja virtual para os clientes visualizarem.
                </Topico>
              </Secao>

              <Secao titulo="5. Gerenciar Agendamentos" icone={Calendar} cor="bg-amber-500">
                <Topico titulo="Visão geral">
                  A aba "Agenda" mostra todos os horários do dia. Você pode alternar entre visão de Dia e Mês.
                </Topico>
                <Topico titulo="Criar agendamento">
                  Clique em um horário vazio, selecione o cliente, profissional e serviço. Confirme para agendar.
                </Topico>
                <Topico titulo="Editar ou cancelar">
                  Clique em um agendamento existente para editar data, horário, profissional ou serviço. Use o botão de lixeira para cancelar.
                </Topico>
                <Topico titulo="Agendamento público">
                  Seus clientes também podem agendar direto pelo link: <code className="bg-zinc-800 px-1 rounded text-xs">/agendar/[id]</code>. O link está nas Configurações.
                </Topico>
              </Secao>

              <Secao titulo="6. Gerenciar Clientes e Profissionais" icone={Users} cor="bg-amber-500">
                <Topico titulo="Clientes">
                  Na aba "Clientes" você vê todos os clientes cadastrados. Pode adicionar novos, editar telefone ou excluir.
                </Topico>
                <Topico titulo="Profissionais (Funcionários)">
                  Na aba "Funcionários" você gerencia a equipe. Adicione funcionários para vincular aos agendamentos.
                </Topico>
                <Topico titulo="Serviços">
                  Na aba "Serviços" cadastre o catálogo de serviços (corte, barba, hidratação...) com preço e duração.
                </Topico>
              </Secao>

              <Secao titulo="7. Relatórios e Impressão" icone={Printer} cor="bg-amber-500">
                <Topico titulo="Gerar relatório em PDF">
                  Nas abas Clientes, Serviços ou Produtos, clique no botão "Relatório (PDF)". Abrirá uma nova janela com os dados formatados para impressão.
                </Topico>
                <Topico titulo="O que é impresso">
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Clientes: lista completa com nomes e telefones</li>
                    <li>Serviços: lista com duração e preço</li>
                    <li>Produtos: lista com preço e estoque</li>
                  </ul>
                </Topico>
              </Secao>

              <Secao titulo="8. Dicas Importantes" icone={AlertCircle} cor="bg-amber-500">
                <Topico titulo="Produtos com variações">
                  Quando um produto tem variações (ML), o estoque é controlado POR TAMANHO, não pelo estoque geral do produto. Deixe o campo "Estoque" do produto principal como 0.
                </Topico>
                <Topico titulo="Imagens dos produtos">
                  Use fotos de boa qualidade (quadradas ou próximas disso). O sistema ajusta automaticamente para ficar bonito na loja.
                </Topico>
                <Topico titulo="Compartilhe os links">
                  Coloque o link da loja e do agendamento na bio do Instagram para seus clientes acessarem facilmente.
                </Topico>
              </Secao>
            </div>
          </div>

          {/* ========== MANUAL DO CLIENTE ========== */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold">👤 Manual do Cliente</h2>
            </div>
            <p className="text-zinc-400 text-sm mb-4">Saiba como agendar serviços e comprar produtos na loja virtual.</p>
            
            <div className="space-y-2">
              <Secao titulo="Como comprar na loja virtual" icone={ShoppingBag} cor="bg-blue-500">
                <Topico titulo="Acessar a loja">
                   A Loja vai te enviar um link. Clique nele para abrir a loja virtual no seu celular ou computador.
                </Topico>
                <Topico titulo="Escolher um produto">
                  <ol className="list-decimal pl-5 mt-1 space-y-1">
                    <li>Navegue pelos produtos disponíveis</li>
                    <li>Veja as fotos, nomes e preços</li>
                    <li>Se o produto tiver tamanhos (ml), toque no tamanho desejado</li>
                    <li>O produto vai direto para o carrinho</li>
                  </ol>
                </Topico>
                <Topico titulo="Finalizar a compra">
                  <ol className="list-decimal pl-5 mt-1 space-y-1">
                    <li>Clique no ícone do carrinho (🛒) no topo da tela</li>
                    <li>Revise os produtos, quantidades e preços</li>
                    <li>Clique em "Finalizar Pedido"</li>
                    <li>Preencha seu nome e WhatsApp</li>
                    <li>Clique em "Enviar Pedido via WhatsApp"</li>
                     <li>O pedido será enviado para a Loja pelo WhatsApp</li>
                  </ol>
                </Topico>
                <Topico titulo="Funciona em qualquer dispositivo">
                  <div className="flex gap-3 mt-1 text-amber-500">
                    <span className="flex items-center gap-1"><Smartphone className="w-4 h-4" /> Celular</span>
                    <span className="flex items-center gap-1"><Tablet className="w-4 h-4" /> Tablet</span>
                    <span className="flex items-center gap-1"><Monitor className="w-4 h-4" /> Computador</span>
                  </div>
                </Topico>
              </Secao>

              <Secao titulo="Como agendar um serviço" icone={Calendar} cor="bg-blue-500">
                <Topico titulo="Acessar o agendamento">
                   A Loja vai te enviar um link de agendamento. Clique para abrir a página.
                </Topico>
                <Topico titulo="Escolher horário">
                  <ol className="list-decimal pl-5 mt-1 space-y-1">
                    <li>Selecione o serviço desejado (corte, barba, etc.)</li>
                    <li>Escolha a data disponível</li>
                    <li>Veja os horários em verde (disponíveis) e clique no que preferir</li>
                    <li>Confirme seus dados</li>
                  </ol>
                </Topico>
                <Topico titulo="Confirmar agendamento">
                  Após confirmar, você receberá uma confirmação. Pode chegar no horário marcado!
                </Topico>
              </Secao>

              <Secao titulo="Perguntas Frequentes" icone={HelpCircle} cor="bg-blue-500">
                <Topico titulo="Preciso criar conta para comprar?">
                  Não! Você só precisa preencher seu nome e WhatsApp na hora de finalizar o pedido.
                </Topico>
                <Topico titulo="Como pagar?">
                   O pagamento é combinado diretamente com a Loja pelo WhatsApp após o pedido.
                </Topico>
                <Topico titulo="Posso cancelar um pedido?">
                   Sim, entre em contato com a Loja pelo WhatsApp e cancele ou altere seu pedido.
                </Topico>
                <Topico titulo="Como vejo o valor do frete?">
                   O frete é combinado diretamente com a Loja. Eles vão te informar após receberem seu pedido.
                </Topico>
              </Secao>
            </div>
          </div>

          {/* ========== MANUAL DO ADMIN ========== */}
          {isAdmin && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold">🔐 Manual do Administrador (Master)</h2>
            </div>
            <p className="text-zinc-400 text-sm mb-4">Painel Master para gerenciar todas as lojas do sistema. Acesso exclusivo do administrador.</p>
            
            <div className="space-y-2">
              <Secao titulo="Acessar o Painel Mestre" icone={Shield} cor="bg-purple-500">
                <Topico titulo="Quem pode acessar">
                  Apenas o e-mail do administrador master (<code className="bg-zinc-800 px-1 rounded text-xs">wwbcinformatica@gmail.com</code>) tem acesso ao painel. Ao fazer login com este e-mail, aparece o link <strong>"Painel Mestre SaaS"</strong> no menu do dashboard.
                </Topico>
                <Topico titulo="Onde encontrar">
                  No dashboard do lojista, role o menu lateral até a seção <strong>"Administração Mestre"</strong> e clique em <strong>"Painel Mestre SaaS"</strong>.
                </Topico>
              </Secao>

              <Secao titulo="Gerenciar Lojas" icone={Store} cor="bg-purple-500">
                <Topico titulo="Lista de lojas">
                  O painel mostra todas as lojas cadastradas, ordenadas da mais recente para a mais antiga. Cada loja exibe: logo, nome, status, plano, data de expiração e dados de contato.
                </Topico>
                <Topico titulo="Buscar loja">
                  Use o campo de busca para encontrar lojas pelo nome. A lista filtra em tempo real.
                </Topico>
                <Topico titulo="Editar dados da loja">
                  Clique no ícone de lápis (<Edit2 className="w-3.5 h-3.5 inline" />) ao lado de uma loja para editar nome completo, telefone, e-mail e site.
                </Topico>
                <Topico titulo="Bloquear/Desbloquear loja">
                  Use o botão de ativar/bloquear para liberar ou suspender o acesso de um lojista. Quando bloqueado, o lojista vê a tela de "Acesso Suspenso" e não pode usar o sistema.
                </Topico>
              </Secao>

              <Secao titulo="Gerenciar Assinaturas" icone={CreditCard} cor="bg-purple-500">
                <Topico titulo="Status das assinaturas">
                  Na lista de lojas você vê o plano de cada uma (ex: "Mensal") e a data de expiração. Lojas com expiração vencida são bloqueadas automaticamente.
                </Topico>
                <Topico titulo="Ativar manualmente">
                  Para liberar o acesso de um lojista com expiração vencida, edite a data de expiração diretamente no banco ou aguarde o pagamento via Mercado Pago.
                </Topico>
              </Secao>

              <Secao titulo="Como funciona o Pedido via WhatsApp" icone={ShoppingBag} cor="bg-purple-500">
                <Topico titulo="Fluxo completo">
                  <ol className="list-decimal pl-5 mt-1 space-y-1">
                    <li>Cliente acessa a loja virtual (<code className="bg-zinc-800 px-1 rounded text-xs">/loja/[id]</code>)</li>
                    <li>Adiciona produtos ao carrinho (se tiver variações de ML, toca no tamanho desejado)</li>
                    <li>Clica no ícone do carrinho e revisa os itens</li>
                    <li>Clica em "Finalizar Pedido"</li>
                    <li>Preenche nome e WhatsApp</li>
                    <li>Clica em "Enviar Pedido via WhatsApp"</li>
                    <li>O navegador abre o WhatsApp Web ou App com a mensagem pronta</li>
                    <li>A mensagem chega no WhatsApp do <strong>próprio cliente</strong> (não do lojista)</li>
                    <li>O cliente vê a mensagem e pode encaminhar para o WhatsApp da Loja ou mostrar no balcão</li>
                  </ol>
                </Topico>
                <Topico titulo="IMPORTANTE: Para quem vai a mensagem">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-2 text-xs">
                    <p className="font-bold text-amber-400 mb-1">⚠️ Atenção</p>
                    <p>A mensagem do pedido é enviada para o WhatsApp que o <strong>cliente preencheu</strong>, não para o WhatsApp do lojista.</p>
                    <p className="mt-1">O cliente recebe algo como:</p>
                    <div className="bg-zinc-800 p-2 rounded mt-1 text-zinc-300">
                      "Olá! Gostaria de fazer o seguinte pedido na Minha Loja:<br />
                      1x Perfume Importado (50ml) - R$ 50,00<br />
                      Total: R$ 50,00<br />
                      Nome: João"
                    </div>
                     <p className="mt-1">O cliente então <strong>encaminha</strong> essa mensagem para o WhatsApp da Loja, ou o lojista configura o número de destino.</p>
                  </div>
                </Topico>
                <Topico titulo="Personalização futura">
                  Futuramente podemos implementar envio direto para o WhatsApp do lojista (sem o cliente precisar encaminhar). Isso exigiria integração com API do WhatsApp Business.
                </Topico>
                <Topico titulo="Opções de Pagamento">
                  Na loja virtual, o lojista pode configurar opções de pagamento à distância que aparecem na página:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><strong>Chave Pix:</strong> Clique na chave para copiar e depois cole no app do banco</li>
                    <li><strong>Link de Pagamento:</strong> Toque para abrir e finalize no app do lojista</li>
                    <li><strong>QR Code Pix:</strong> Use a câmera do celular para escanear e pagar</li>
                  </ul>
                </Topico>
              </Secao>

              <Secao titulo="Dicas Importantes" icone={AlertCircle} cor="bg-purple-500">
                <Topico titulo="Segurança">
                  O e-mail master é a chave de acesso ao painel. Não compartilhe. Mantenha a conta segura com autenticação de dois fatores do Supabase.
                </Topico>
                <Topico titulo="Suporte aos lojistas">
                  Use o painel para verificar dados de contato dos lojistas e ajudar com problemas. Você pode ver telefone, e-mail e site de cada loja.
                </Topico>
                <Topico titulo="Deploy e manutenção">
                  O deploy é feito via Vercel: <code className="bg-zinc-800 px-1 rounded text-xs">npx vercel --prod --yes</code>. Alterações no banco (SQL) são feitas no Supabase Studio.
                </Topico>
              </Secao>

              <Secao titulo="Configurar Pagamentos (Mercado Pago)" icone={CreditCard} cor="bg-purple-500">
                <Topico titulo="Visão geral">
                  O sistema já tem integração com Mercado Pago para cobrar a mensalidade dos lojistas (R$ 49,90/mês). Aceita <strong>Pix, cartão de crédito e boleto bancário</strong>. Liberação automática via webhook.
                </Topico>
                <Topico titulo="Credenciais utilizadas">
                  <div className="bg-zinc-800 rounded-lg p-3 text-xs space-y-1 mt-1">
                    <p><strong>Access Token:</strong> <code className="bg-zinc-700 px-1 rounded">APP_USR-1184405145724765-051423-32ee5751086974e51a41a7860c672653-3404522428</code></p>
                    <p><strong>Public Key:</strong> <code className="bg-zinc-700 px-1 rounded">APP_USR-661f27ec-644c-4aad-a11d-e09d9c7babea</code></p>
                    <p><strong>Webhook URL:</strong> <code className="bg-zinc-700 px-1 rounded">https://loja-saas-ten.vercel.app/api/pagamento</code></p>
                    <p><strong>Site URL:</strong> <code className="bg-zinc-700 px-1 rounded">https://loja-saas-ten.vercel.app</code></p>
                  </div>
                </Topico>
                <Topico titulo="Modo produção (obrigatório)">
                  No Mercado Pago, em Credenciais, o toggle no topo deve estar em <strong>"Produção"</strong> (não em teste). O Access Token de produção começa com <code className="bg-zinc-800 px-1 rounded text-xs">APP_USR-...</code>. Se for <code className="bg-zinc-800 px-1 rounded text-xs">TEST-...</code>, está em modo teste e não funciona.
                </Topico>
                <Topico titulo="Webhook configurado">
                  No Mercado Pago &gt; Suas integrações &gt; LojaSaaS &gt; Webhooks:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><strong>URL:</strong> <code className="bg-zinc-800 px-1 rounded text-xs">https://loja-saas-ten.vercel.app/api/pagamento</code></li>
                    <li><strong>Evento:</strong> "Pagamentos" (marcado)</li>
                    <li><strong>Assinatura secreta:</strong> deixar em branco (não usamos)</li>
                  </ul>
                </Topico>
                <Topico titulo="Variáveis no Vercel">
                  No Vercel &gt; Settings &gt; Environment Variables, adicionar:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><code className="bg-zinc-800 px-1 rounded text-xs">MERCADO_PAGO_ACCESS_TOKEN</code> com o Access Token de produção</li>
                    <li><code className="bg-zinc-800 px-1 rounded text-xs">NEXT_PUBLIC_SITE_URL</code> com <code className="bg-zinc-800 px-1 rounded text-xs">https://loja-saas-ten.vercel.app</code></li>
                    <li><code className="bg-zinc-800 px-1 rounded text-xs">SUPABASE_SERVICE_ROLE_KEY</code> com a Service Role do Supabase</li>
                  </ul>
                  Marcar ambientes: Production, Preview e Development.
                </Topico>
                <Topico titulo="Fluxo completo">
                  <ol className="list-decimal pl-5 mt-1 space-y-1">
                    <li>Lojista com assinatura vencida vê tela de bloqueio</li>
                    <li>Clica em "Pagar Mensalidade (R$ 49,90)"</li>
                    <li>É redirecionado ao Mercado Pago (Pix aprovado na hora, cartão ou boleto)</li>
                    <li>Após pagamento, Mercado Pago envia notificação ao sistema (webhook)</li>
                    <li>O sistema consulta a API do Mercado Pago para confirmar o pagamento</li>
                    <li>Se aprovado, ativa a loja: status = ativo, expira_em = +30 dias</li>
                    <li>Lojista volta a usar o sistema normalmente</li>
                  </ol>
                </Topico>
                <Topico titulo="Solução de problemas">
                  <div className="bg-zinc-800 rounded-lg p-3 text-xs mt-1 space-y-2">
                    <p><strong>❌ "Pagamento aprovado mas loja continua bloqueada"</strong><br />
                    Verificar se o webhook está configurado no Mercado Pago. Verificar se <code className="bg-zinc-700 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> está no Vercel. Verificar logs em: Vercel &gt; Deployments &gt; Functions &gt; pagamento.</p>
                    <p><strong>❌ "Erro ao criar preferência no Mercado Pago"</strong><br />
                    Verificar se o Access Token está correto no .env.local e no Vercel. Verificar se a conta Mercado Pago está ativa.</p>
                    <p><strong>❌ Preferir boleto não aparece?</strong><br />
                    O código já libera todos os métodos. Verificar se não há restrição na conta Mercado Pago.</p>
                  </div>
                </Topico>
              </Secao>
            </div>
          </div>
          )}

          {/* Links Rápidos */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500 p-2 rounded-lg">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold">Links Úteis</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link href="/login" className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-center">
                <span className="font-bold text-amber-500 block">Entrar</span>
                <p className="text-xs text-zinc-400 mt-1">Login do lojista</p>
              </Link>
              <Link href="/cadastro" className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-center">
                <span className="font-bold text-amber-500 block">Cadastrar</span>
                <p className="text-xs text-zinc-400 mt-1">Criar nova conta</p>
              </Link>
              <a href="#" onClick={() => window.history.back()} className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-center cursor-pointer">
                <span className="font-bold text-amber-500 block">Voltar</span>
                <p className="text-xs text-zinc-400 mt-1">Página anterior</p>
              </a>
            </div>
          </div>

          {/* Contato */}
          <div className="text-center text-zinc-500 text-sm py-4">
            <p>Em caso de dúvidas, entre em contato com o administrador do sistema.</p>
          </div>
        </div>
      </div>
    </div>
  );
}