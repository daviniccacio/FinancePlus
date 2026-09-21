// src/components/SummaryCards.jsx
import { useRef } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// Auxiliar de contagem animada de valores numéricos (R$)
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
      <div 
        style={{
          backgroundColor: '#161e18',
          borderColor: '#273C2C',
        }}
        className="p-5 rounded-3xl border shadow-lg flex items-center justify-between transition-all hover:border-[#626868] hover:-translate-y-0.5"
      >
        <div className="space-y-1">
          <p style={{ color: '#D3C1D2' }} className="text-xs font-bold uppercase tracking-wider">
            Saldo Atual
          </p>
          <AnimatedCurrency 
            value={saldoAtual} 
            className="text-2xl font-extrabold tracking-tight block text-[#FFE2FE]" 
          />
        </div>
        <div 
          style={{ backgroundColor: 'rgba(211, 193, 210, 0.12)', borderColor: '#D3C1D2' }}
          className="p-3 rounded-2xl border text-[#D3C1D2]"
        >
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      {/* 2. CARD TOTAL ENTRADAS */}
      <div 
        style={{
          backgroundColor: '#161e18',
          borderColor: '#273C2C',
        }}
        className="p-5 rounded-3xl border shadow-lg flex items-center justify-between transition-all hover:border-[#626868] hover:-translate-y-0.5"
      >
        <div className="space-y-1">
          <p style={{ color: '#939196' }} className="text-xs font-bold uppercase tracking-wider">
            Entradas
          </p>
          <AnimatedCurrency 
            value={totalEntradas} 
            className="text-2xl font-extrabold tracking-tight block text-emerald-400" 
          />
        </div>
        <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <ArrowUpCircle className="w-6 h-6" />
        </div>
      </div>

      {/* 3. CARD TOTAL SAÍDAS */}
      <div 
        style={{
          backgroundColor: '#161e18',
          borderColor: '#273C2C',
        }}
        className="p-5 rounded-3xl border shadow-lg flex items-center justify-between transition-all hover:border-[#626868] hover:-translate-y-0.5"
      >
        <div className="space-y-1">
          <p style={{ color: '#939196' }} className="text-xs font-bold uppercase tracking-wider">
            Saídas
          </p>
          <AnimatedCurrency 
            value={totalSaidas} 
            className="text-2xl font-extrabold tracking-tight block text-rose-400" 
          />
        </div>
        <div className="p-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
          <ArrowDownCircle className="w-6 h-6" />
        </div>
      </div>

    </div>
  );
}