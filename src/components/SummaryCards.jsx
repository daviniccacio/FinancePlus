import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

export default function SummaryCards({ totalEntradas, totalSaidas, saldoAtual }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm border-gray-200/60">
        <div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Entradas</p>
          <h3 className="text-lg font-bold text-green-600">R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
        <ArrowUpCircle className="w-5 h-5 text-green-500" />
      </div>
      <div className="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm border-gray-200/60">
        <div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Saídas</p>
          <h3 className="text-lg font-bold text-red-500">R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
        <ArrowDownCircle className="w-5 h-5 text-red-500" />
      </div>
      <div className="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm border-gray-200/60">
        <div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Saldo do Período</p>
          <h3 className={`text-lg font-bold ${saldoAtual >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
            R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <Wallet className={`w-5 h-5 ${saldoAtual >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
      </div>
    </section>
  );
}