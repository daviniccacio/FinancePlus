// src/components/LandingPage.jsx
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  ListFilter, 
  ShieldCheck, 
  CircleDollarSign, 
  ArrowRight,
  Sparkles
} from 'lucide-react';


/**
 * Landing Page Oficial do Kashio
 * Inclui a nova Hero Section topo com Mockup e todas as secções informativas.
 */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans bg-[#1b3022] text-white selection:bg-[#f7dcf2] selection:text-[#1b3022]">
      
      {/* 🌟 CABEÇALHO / NAVBAR (Integrado no Fundo Escuro) */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex p-1.5 items-center gap-2.5 rounded-lg cursor-pointer" onClick={() => navigate('/')}>
          <img src="/kashiologobranco.png" alt="Kashio Logo" className="w-16 h-16" />
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#f7dcf2]/80">
          <a href="#hero" className="hover:text-white transition-colors">Painel</a>
          <a href="#visoes" className="hover:text-white transition-colors">Lançamentos</a>
          <a href="#beneficios" className="hover:text-white transition-colors">Benefícios</a>
        </nav>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="px-5 py-2.5 text-xs font-bold rounded-full border border-[#f7dcf2]/30 text-[#f7dcf2] hover:bg-[#f7dcf2] hover:text-[#1b3022] transition-all cursor-pointer flex items-center gap-2"
        >
          <span>Acessar sistema</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* 🌟 HERO SECTION PRINCIPAL (NOVO INÍCIO DA PÁGINA) */}
      <section id="hero" className="max-w-7xl mx-auto px-6 pt-8 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* COLUNA ESQUERDA: TEXTO E BOTOES */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#2f4e39] bg-[#233d2c]/60 text-[11px] font-bold tracking-wide text-[#f7dcf2]">
            <Sparkles className="w-3.5 h-3.5 text-[#f7dcf2]" />
            <span>GESTÃO FINANCEIRA PESSOAL</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Seu dinheiro, <br /> sob controle.
          </h1>

          {/* Subtítulo */}
          <p className="text-sm md:text-base text-gray-300 font-medium leading-relaxed max-w-md">
            Kashio reúne painel, lançamentos e metas em um só lugar. Menos planilha, mais clareza.
          </p>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-6 py-3.5 text-xs font-bold rounded-full bg-[#f7dcf2] text-[#1b3022] hover:scale-105 transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            >
              <span>Acessar o sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#visoes"
              className="px-6 py-3.5 text-xs font-bold rounded-full border border-[#2f4e39] bg-[#233d2c]/40 text-white hover:bg-[#233d2c] transition-all cursor-pointer"
            >
              Ver o painel
            </a>
          </div>

          {/* Métricas Inferiores */}
          <div className="grid grid-cols-2 gap-4 pt-4 max-w-sm">
            <div className="p-4 rounded-2xl bg-[#233d2c]/60 border border-[#2f4e39]">
              <p className="text-xl font-black text-white">R$ 4.280</p>
              <p className="text-[10px] text-gray-400 font-semibold">Saldo disponível</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#233d2c]/60 border border-[#2f4e39]">
              <p className="text-xl font-black text-[#f7dcf2]">+12%</p>
              <p className="text-[10px] text-gray-400 font-semibold">Economia no mês</p>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: MOCKUP INTERATIVO */}
        <div className="lg:col-span-6">
          <div className="p-6 md:p-8 rounded-3xl bg-[#233d2c] border border-[#2f4e39] shadow-2xl space-y-6">
            
            {/* Controlos de Janela */}
            <div className="flex items-center justify-between border-b border-[#2f4e39] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#2f4e39]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#2f4e39]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#2f4e39]" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dashboard Demo</span>
            </div>

            {/* Painel Visão Geral */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-gray-300">
                <span>PAINEL / Visão geral</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-[#1b3022]/80 border border-[#2f4e39]">
                  <p className="text-[9px] text-gray-400 font-medium">Saldo</p>
                  <p className="text-xs md:text-sm font-extrabold text-white">R$ 4.280</p>
                </div>
                <div className="p-3 rounded-xl bg-[#1b3022]/80 border border-[#2f4e39]">
                  <p className="text-[9px] text-gray-400 font-medium">Receitas</p>
                  <p className="text-xs md:text-sm font-extrabold text-emerald-400">R$ 6.900</p>
                </div>
                <div className="p-3 rounded-xl bg-[#1b3022]/80 border border-[#2f4e39]">
                  <p className="text-[9px] text-gray-400 font-medium">Despesas</p>
                  <p className="text-xs md:text-sm font-extrabold text-rose-400">R$ 2.620</p>
                </div>
              </div>

              {/* Gráfico de Linha do Fluxo Mensal */}
              <div className="p-4 rounded-2xl bg-[#1b3022]/80 border border-[#2f4e39] space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-300">
                  <span>Fluxo mensal</span>
                  <span className="text-emerald-400 font-extrabold">+ 12%</span>
                </div>
                <div className="h-16 w-full flex items-end pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 200 50">
                    <path
                      d="M 0 40 Q 40 10, 80 30 T 160 15 T 200 5"
                      fill="none"
                      stroke="#f7dcf2"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Lançamentos Rápidos */}
            <div className="space-y-3 pt-2 border-t border-[#2f4e39]">
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block">
                LANÇAMENTOS
              </span>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b3022]/60 border border-[#2f4e39]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#2f4e39] text-[#f7dcf2] text-[9px] font-bold flex items-center justify-center">
                      SA
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Salário</p>
                      <p className="text-[9px] text-gray-400">Rendimento</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">+ R$ 6.900</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b3022]/60 border border-[#2f4e39]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#2f4e39] text-[#f7dcf2] text-[9px] font-bold flex items-center justify-center">
                      AL
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Aluguel</p>
                      <p className="text-[9px] text-gray-400">Moradia</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-400">- R$ 1.450</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b3022]/60 border border-[#2f4e39]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#2f4e39] text-[#f7dcf2] text-[9px] font-bold flex items-center justify-center">
                      CO
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Supermercado</p>
                      <p className="text-[9px] text-gray-400">Alimentação</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-400">- R$ 380</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* 🌟 TRANSIÇÃO PARA O FUNDO ROSA CLARO ("O QUE VOCÊ CONTROLA") */}
      <div className="bg-[#fbf5f9] text-[#111827] rounded-t-[2.5rem] pt-12">
        
        {/* SECÇÃO 1: O QUE VOCÊ CONTROLA */}
        <section id="visoes" className="max-w-7xl mx-auto px-6 py-12 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block">
                O que você controla
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#111827] leading-tight">
                Três visões. Toda a sua <br className="hidden md:block" /> vida financeira.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-xs md:text-sm text-gray-600 font-medium leading-relaxed">
                Do acesso ao painel, cada tela mostra o essencial sem ruído. Você vê, ajusta e decide.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4 transition-transform hover:-translate-y-1 duration-200">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1b3022]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#111827]">Painel de controle</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Saldo, receitas e despesas em um olhar, com indicadores que acompanham o mês.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4 transition-transform hover:-translate-y-1 duration-200">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1b3022]">
                <ListFilter className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#111827]">Lançamentos</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Entradas e saídas organizadas por período, categoria, valor e situação.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4 transition-transform hover:-translate-y-1 duration-200">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1b3022]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#111827]">Acesso direto</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Entre na sua conta e retome sua organização financeira com segurança.
              </p>
            </div>
          </div>
        </section>

        {/* SECÇÃO 2: O PRODUTO EM AÇÃO */}
        <section className="bg-[#1b3022] text-white py-20 px-6 rounded-t-[2.5rem]">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#f7dcf2]/80 block">
                O produto em ação
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                O painel e os lançamentos, lado a lado.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-[#233d2c] border border-[#2f4e39] space-y-8 shadow-xl">
                <div className="flex justify-between items-center border-b border-[#2f4e39] pb-4">
                  <span className="text-xs font-bold text-gray-200">Painel de controle</span>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#1b3022] text-[#f7dcf2]">
                    Setembro
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#1b3022]/60 border border-[#2f4e39]">
                    <p className="text-[10px] text-gray-400 font-semibold mb-1">Saldo atual</p>
                    <p className="text-2xl font-extrabold text-white">R$ 143,27</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#1b3022]/60 border border-[#2f4e39]">
                    <p className="text-[10px] text-gray-400 font-semibold mb-1">Meta de economia</p>
                    <p className="text-2xl font-extrabold text-white mb-2">68%</p>
                    <div className="w-full h-1.5 bg-[#2f4e39] rounded-full overflow-hidden">
                      <div className="h-full bg-[#f7dcf2] w-[68%]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-300">
                    <span>Entradas × saídas</span>
                    <span className="text-gray-400">Este mês</span>
                  </div>
                  <div className="h-28 flex items-end justify-between gap-3 pt-4 border-b border-[#2f4e39] pb-2">
                    <div className="w-full bg-[#2f4e39] hover:bg-[#f7dcf2] transition-colors h-[60%] rounded-t-lg" />
                    <div className="w-full bg-[#f7dcf2] h-[90%] rounded-t-lg" />
                    <div className="w-full bg-[#2f4e39] hover:bg-[#f7dcf2] transition-colors h-[40%] rounded-t-lg" />
                    <div className="w-full bg-[#f7dcf2] h-[75%] rounded-t-lg" />
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-[#f7dcf2] text-[#1b3022] space-y-6 shadow-xl">
                <div className="flex justify-between items-center border-b border-[#ebd0e6] pb-4">
                  <span className="text-xs font-extrabold text-[#1b3022]">Lançamentos</span>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#1b3022] text-[#f7dcf2]">
                    Setembro
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 backdrop-blur-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#1b3022] text-[#f7dcf2] text-[10px] font-bold flex items-center justify-center">
                        SA
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1b3022]">Salário</p>
                        <p className="text-[10px] text-gray-500 font-medium">Rendimento</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-700">+ R$ 6.900</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 backdrop-blur-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#1b3022] text-[#f7dcf2] text-[10px] font-bold flex items-center justify-center">
                        AL
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1b3022]">Aluguel</p>
                        <p className="text-[10px] text-gray-500 font-medium">Moradia</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-rose-700">- R$ 1.450</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 backdrop-blur-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#1b3022] text-[#f7dcf2] text-[10px] font-bold flex items-center justify-center">
                        CO
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1b3022]">Supermercado</p>
                        <p className="text-[10px] text-gray-500 font-medium">Alimentação</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-rose-700">- R$ 380</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 backdrop-blur-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#1b3022] text-[#f7dcf2] text-[10px] font-bold flex items-center justify-center">
                        TR
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1b3022]">Combustível</p>
                        <p className="text-[10px] text-gray-500 font-medium">Transporte</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-rose-700">- R$ 210</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 backdrop-blur-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#1b3022] text-[#f7dcf2] text-[10px] font-bold flex items-center justify-center">
                        AS
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1b3022]">Assinaturas</p>
                        <p className="text-[10px] text-gray-500 font-medium">Lazer</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-rose-700">- R$ 96</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECÇÃO 3: BENEFÍCIOS OBJETIVOS */}
        <section id="beneficios" className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block">
                Benefícios objetivos
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#111827] leading-tight">
                Feito para decidir com calma.
              </h2>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#f7dcf2] flex items-center justify-center text-[#1b3022] mb-3">
                  <CircleDollarSign className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-[#111827]">Clareza imediata</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Números legíveis e hierarquia direta para entender seu momento financeiro.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#f7dcf2] flex items-center justify-center text-[#1b3022] mb-3">
                  <CircleDollarSign className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-[#111827]">Tudo organizado</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Categorias e períodos que deixam cada lançamento no lugar certo.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#f7dcf2] flex items-center justify-center text-[#1b3022] mb-3">
                  <CircleDollarSign className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-[#111827]">Metas visíveis</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Acompanhe o progresso sem perder de vista o saldo atual.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#f7dcf2] flex items-center justify-center text-[#1b3022] mb-3">
                  <CircleDollarSign className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-[#111827]">Relatórios prontos</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Consolide suas informações e leve seus dados quando precisar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECÇÃO 4: CTA BANNER */}
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="p-10 md:p-16 rounded-[2.5rem] bg-[#1b3022] text-white space-y-6 shadow-2xl relative overflow-hidden">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#f7dcf2]/80 block">
              Sua rotina, mais clara
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Acesse o Kashio.
            </h2>
            <p className="text-xs md:text-sm text-[#f7dcf2]/90 max-w-lg font-medium leading-relaxed">
              Abra o sistema e acompanhe seu painel, seus lançamentos e suas metas em um só lugar.
            </p>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-6 py-3.5 text-xs font-bold rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer bg-[#f7dcf2] text-[#1b3022] flex items-center gap-2 shadow-lg"
            >
              <span>Acessar o sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* RODAPÉ */}
        <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-200/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-500">
          <div className="flex items-center gap-2">
            <img src="/kashiologo.png" alt="Kashio Logo" className="w-12 h-12" />
            <span className="font-bold text-lg text-[#1b3022]">Kashio</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-[#1b3022] transition-colors">Painel</a>
            <a href="#visoes" className="hover:text-[#1b3022] transition-colors">Lançamentos</a>
            <a href="#beneficios" className="hover:text-[#1b3022] transition-colors">Benefícios</a>
          </div>

          <p>Kashio © 2026</p>
        </footer>

      </div>

    </div>
  );
}