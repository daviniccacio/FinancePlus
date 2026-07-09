import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function CompetenceBar({ filtroCompetencia, setFiltroCompetencia, setPaginaAtual }) {
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
    if (!compString) return "Histórico Completo";
    const [ano, mes] = compString.split('-');
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return `${meses[Number(mes) - 1]} de ${ano}`;
  }

  return (
    <section className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200/60 dark:border-zinc-800 shadow-sm gap-3 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-xl text-blue-500 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20 hidden sm:block">
          <Calendar className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => alterarCompetencia(-1)} 
            className="p-1.5 bg-neutral-50 dark:bg-zinc-800 hover:bg-neutral-100 dark:hover:bg-zinc-700 rounded-xl border border-gray-200/40 dark:border-zinc-700 transition-all active:scale-95 text-neutral-600 dark:text-zinc-400 cursor-pointer"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-neutral-700 dark:text-zinc-300 min-w-37.5 text-center bg-neutral-50 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-gray-200/30 dark:border-zinc-700">
            {formatarCompetenciaTexto(filtroCompetencia)}
          </span>
          <button 
            onClick={() => alterarCompetencia(1)} 
            className="p-1.5 bg-neutral-50 dark:bg-zinc-800 hover:bg-neutral-100 dark:hover:bg-zinc-700 rounded-xl border border-gray-200/40 dark:border-zinc-700 transition-all active:scale-95 text-neutral-600 dark:text-zinc-400 cursor-pointer"
            title="Próximo Mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <button 
        onClick={() => {
          if (filtroCompetencia) {
            setFiltroCompetencia('');
          } else {
            const hoje = new Date();
            setFiltroCompetencia(`${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`);
          }
          setPaginaAtual(1);
        }}
        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-[0.98] cursor-pointer ${
          !filtroCompetencia 
            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30 shadow-sm' 
            : 'bg-neutral-50 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-400 border-gray-200/80 dark:border-zinc-700 hover:bg-neutral-100 dark:hover:bg-zinc-700'
        }`}
      >
        {!filtroCompetencia ? 'Voltar para Visão Mensal' : 'Ver Histórico Completo'}
      </button>
    </section>
  );
}