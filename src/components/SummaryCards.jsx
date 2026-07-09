import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

export default function SummaryCards({ carregando, totalEntradas, totalSaidas, saldoAtual }) {
  
  if (carregando) {
    return (
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border flex flex-col justify-center gap-2 shadow-sm border-gray-200/60 dark:border-zinc-800 animate-pulse h-19.5">
            <div className="h-3 bg-neutral-200 dark:bg-zinc-700 rounded w-1/4"></div>
            <div className="h-5 bg-neutral-300 dark:bg-zinc-600 rounded w-1/2"></div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border flex items-center justify-between shadow-sm border-gray-200/60 dark:border-zinc-800 transition-colors duration-200">
        <div>
          <p className="text-[10px] font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider">Entradas</p>
          <h3 className="text-lg font-bold text-green-600 dark:text-green-400">R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
        <ArrowUpCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
      </div>
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border flex items-center justify-between shadow-sm border-gray-200/60 dark:border-zinc-800 transition-colors duration-200">
        <div>
          <p className="text-[10px] font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider">Saídas</p>
          <h3 className="text-lg font-bold text-red-500 dark:text-red-400">R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
        <ArrowDownCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
      </div>
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border flex items-center justify-between shadow-sm border-gray-200/60 dark:border-zinc-800 transition-colors duration-200">
        <div>
          <p className="text-[10px] font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider">Saldo do Período</p>
          <h3 className={`text-lg font-bold ${saldoAtual >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-500 dark:text-orange-400'}`}>
            R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <Wallet className={`w-5 h-5 ${saldoAtual >= 0 ? 'text-blue-500 dark:text-blue-400' : 'text-orange-500 dark:text-orange-400'}`} />
      </div>
    </section>
  );
}