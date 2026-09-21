// src/components/SummaryCards.jsx
import { useRef } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

function AnimatedCurrency({ value, className }) {
  const spanRef = useRef(null);
  const valorObj = useRef({ val: 0 });

  useGSAP(() => {
    const destino = Number(value) || 0;

    gsap.to(valorObj.current, {
      val: destino,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => {
        if (spanRef.current) {
          spanRef.current.innerText = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(valorObj.current.val);
        }
      },
    });
  }, [value]);

  return <span ref={spanRef} className={className}>R$ 0,00</span>;
}

export default function SummaryCards({ totalEntradas, totalSaidas, saldoAtual }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
      
      {/* 1. CARD SALDO ATUAL */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#161e18] border border-gray-200 dark:border-[#273C2C] shadow-xs flex items-center justify-between transition-all hover:border-gray-300 dark:hover:border-[#626868] hover:-translate-y-0.5">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#D3C1D2]">
            Saldo Atual
          </p>
          <AnimatedCurrency 
            value={saldoAtual} 
            className="text-2xl font-extrabold tracking-tight block text-gray-900 dark:text-[#FFE2FE]" 
          />
        </div>
        <div className="p-3 rounded-2xl border bg-gray-100 dark:bg-[#D3C1D2]/12 border-gray-200 dark:border-[#D3C1D2] text-[#273C2C] dark:text-[#D3C1D2]">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      {/* 2. CARD TOTAL ENTRADAS */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#161e18] border border-gray-200 dark:border-[#273C2C] shadow-xs flex items-center justify-between transition-all hover:border-gray-300 dark:hover:border-[#626868] hover:-translate-y-0.5">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#939196]">
            Entradas
          </p>
          <AnimatedCurrency 
            value={totalEntradas} 
            className="text-2xl font-extrabold tracking-tight block text-emerald-600 dark:text-emerald-400" 
          />
        </div>
        <div className="p-3 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <ArrowUpCircle className="w-6 h-6" />
        </div>
      </div>

      {/* 3. CARD TOTAL SAÍDAS */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#161e18] border border-gray-200 dark:border-[#273C2C] shadow-xs flex items-center justify-between transition-all hover:border-gray-300 dark:hover:border-[#626868] hover:-translate-y-0.5">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#939196]">
            Saídas
          </p>
          <AnimatedCurrency 
            value={totalSaidas} 
            className="text-2xl font-extrabold tracking-tight block text-rose-600 dark:text-rose-400" 
          />
        </div>
        <div className="p-3 rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <ArrowDownCircle className="w-6 h-6" />
        </div>
      </div>

    </div>
  );
}