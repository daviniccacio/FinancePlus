// src/components/CompetenceBar.jsx
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import CustomSelect from './common/CustomSelect';

gsap.registerPlugin(useGSAP);

const CATEGORIAS_PADRAO = [
  'Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 
  'Lazer', 'Renda', 'Transferência', 'Contas', 'Investimentos', 'Outros'
];

export default function CompetenceBar({ 
  filtroCompetencia, 
  setFiltroCompetencia, 
  filtroPeriodo,     
  setFiltroPeriodo,    
  filtroCategoria,    
  setFiltroCategoria,  
  setPaginaAtual 
}) {
  const containerRef = useRef(null);
  const pillRef = useRef(null);
  const buttonsRef = useRef([]);

  const periodos = [
    { id: 'mensal', label: 'Mensal' },
    { id: '3meses', label: '3 Meses' },
    { id: 'ano', label: 'Este Ano' },
    { id: 'tudo', label: 'Tudo' },
  ];

  useGSAP(() => {
    const indiceAtivo = periodos.findIndex((p) => p.id === filtroPeriodo);
    const botaoAtivo = buttonsRef.current[indiceAtivo];

    if (botaoAtivo && pillRef.current) {
      gsap.to(pillRef.current, {
        x: botaoAtivo.offsetLeft,
        width: botaoAtivo.offsetWidth,
        duration: 0.35,
        ease: 'power3.out',
      });
    }
  }, { dependencies: [filtroPeriodo], scope: containerRef });

  const animarClique = (e) => {
    gsap.fromTo(
      e.currentTarget,
      { scale: 0.92 },
      { scale: 1, duration: 0.25, ease: 'back.out(2)' }
    );
  };

  function alterarCompetencia(offset) {
    if (!filtroCompetencia) {
      const hoje = new Date();
      setFiltroCompetencia(`${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`);
      return;
    }
    const [ano, mes] = filtroCompetencia.split('-').map(Number);
    const novaData = new Date(ano, mes - 1 + offset, 1);
    const novoAno = novaData.getFullYear();
    const novoMes = String(novaData.getMonth() + 1).padStart(2, '0');
    
    setFiltroCompetencia(`${novoAno}-${novoMes}`);
    setPaginaAtual(1);
  }

  function formatarCompetenciaTexto(compString) {
    if (filtroPeriodo === 'tudo') return "Histórico Completo";
    if (filtroPeriodo === '3meses') return "Últimos 3 Meses";
    if (filtroPeriodo === 'ano') return `Ano de ${new Date().getFullYear()}`;
    
    if (!compString) return "Mês Não Selecionado";
    const [ano, mes] = compString.split('-');
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return `${meses[Number(mes) - 1]} de ${ano}`;
  }

  const opcoesCategoria = [
    { value: '', label: 'Todas as Categorias' },
    ...CATEGORIAS_PADRAO.map((cat) => ({ value: cat, label: cat }))
  ];

  return (
    <section 
      ref={containerRef} 
      className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-4 rounded-3xl bg-white dark:bg-[#161e18] border border-gray-200 dark:border-[#273C2C] shadow-xs gap-4 font-sans transition-colors duration-200 relative z-30"
    >
      {/* SEÇÃO DA ESQUERDA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
        
        {/* Seletor de Período com Pílula Deslizante */}
        <div className="relative flex items-center p-1 rounded-2xl border bg-gray-100 dark:bg-[#273C2C]/35 border-gray-200 dark:border-[#273C2C] w-full sm:w-auto overflow-x-auto">
          <div
            ref={pillRef}
            className="absolute top-1 bottom-1 left-0 rounded-xl shadow-xs pointer-events-none z-0 bg-[#273C2C] dark:bg-[#D3C1D2]"
          />

          {periodos.map((p, index) => {
            const estaAtivo = filtroPeriodo === p.id;
            return (
              <button
                key={p.id}
                ref={(el) => (buttonsRef.current[index] = el)}
                onClick={(e) => {
                  animarClique(e);
                  setFiltroPeriodo(p.id);
                  setPaginaAtual(1);
                }}
                className={`relative z-10 text-[11px] font-bold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  estaAtivo 
                    ? 'text-white dark:text-[#273C2C] font-extrabold' 
                    : 'text-gray-600 dark:text-[#939196] hover:text-gray-900 dark:hover:text-[#FFE2FE]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Mês/Ano e Botões de Navegação */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
          {filtroPeriodo === 'mensal' && (
            <button 
              type="button"
              onClick={(e) => { animarClique(e); alterarCompetencia(-1); }} 
              className="p-2 rounded-xl border bg-gray-100 dark:bg-[#273C2C] border-gray-200 dark:border-[#626868] text-gray-700 dark:text-[#FFE2FE] hover:bg-gray-200 dark:hover:border-[#D3C1D2] transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-gray-100 dark:bg-[#273C2C]/35 border-gray-200 dark:border-[#273C2C] text-gray-800 dark:text-[#FFE2FE] text-xs font-bold min-w-44 justify-center shadow-inner">
            <Calendar className="w-3.5 h-3.5 text-[#273C2C] dark:text-[#D3C1D2]" />
            <span>{formatarCompetenciaTexto(filtroCompetencia)}</span>
          </div>

          {filtroPeriodo === 'mensal' && (
            <button 
              type="button"
              onClick={(e) => { animarClique(e); alterarCompetencia(1); }} 
              className="p-2 rounded-xl border bg-gray-100 dark:bg-[#273C2C] border-gray-200 dark:border-[#626868] text-gray-700 dark:text-[#FFE2FE] hover:bg-gray-200 dark:hover:border-[#D3C1D2] transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* SEÇÃO DA DIREITA */}
      <div className="w-full lg:w-60 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-200 dark:border-[#273C2C]">
        <CustomSelect
          value={filtroCategoria}
          onChange={(val) => { setFiltroCategoria(val); setPaginaAtual(1); }}
          options={opcoesCategoria}
          placeholder="Todas as Categorias"
        />
      </div>
    </section>
  );
}