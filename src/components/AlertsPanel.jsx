// src/components/AlertsPanel.jsx
import { useRef } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/**
 * PALETA DE CORES PERSONALIZADA:
 * 1. Evergreen:       #273C2C
 * 2. Dim Grey:        #626868
 * 3. Rosy Granite:    #939196
 * 4. Thistle:         #D3C1D2
 * 5. Lavender Veil:   #FFE2FE
 */

export default function AlertsPanel({ transacoes = [], limites = {} }) {
  const containerRef = useRef(null);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const mesAtualTexto = hoje.toISOString().substring(0, 7);

  const contasPendentes = transacoes.filter((t) => {
    const tipoTexto = t.tipo ? t.tipo.toLowerCase().trim() : '';
    const statusTexto = t.status ? t.status.toLowerCase().trim() : '';

    const ehSaida = tipoTexto === 'saída' || tipoTexto === 'saida' || tipoTexto === 'despesa';
    const ehPendente = statusTexto === 'pendente' || statusTexto === 'a pagar' || statusTexto === 'em aberto';
    
    const dataAlvo = t.data_vencimento || t.dataVencimento;
    return ehSaida && ehPendente && !!dataAlvo;
  });

  const alertasVencimento = contasPendentes.map((transacao) => {
    const dataAlvo = transacao.data_vencimento || transacao.dataVencimento;
    let vencimento;

    if (typeof dataAlvo === 'string') {
      const separador = dataAlvo.includes('/') ? '/' : '-';
      const partes = dataAlvo.split(separador).map(Number);
      vencimento = separador === '-' 
        ? new Date(partes[0], partes[1] - 1, partes[2])
        : new Date(partes[2], partes[1] - 1, partes[0]);
    } else {
      vencimento = new Date(dataAlvo);
    }
    vencimento.setHours(0, 0, 0, 0);

    const diferencaDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    let statusVencimento = 'em-dia'; 
    let mensagem = '';

    if (diferencaDias < 0) {
      statusVencimento = 'vencida';
      mensagem = `Vencida há ${Math.abs(diferencaDias)} ${Math.abs(diferencaDias) === 1 ? 'dia' : 'dias'}`;
    } else if (diferencaDias <= 3) {
      statusVencimento = 'urgente';
      mensagem = diferencaDias === 0 ? 'Vence HOJE!' : `Vence em ${diferencaDias} ${diferencaDias === 1 ? 'dia' : 'dias'}`;
    }

    return {
      id: `vencim-${transacao.id}`,
      descricao: transacao.descricao,
      valor: transacao.valor,
      categoria: transacao.categoria,
      tipoAlerta: 'vencimento',
      statusVencimento,
      mensagem,
      diferencaDias
    };
  }).filter(item => item.statusVencimento === 'vencida' || item.statusVencimento === 'urgente');

  const despesasMesAtual = transacoes.filter(t => {
    const tipoTexto = t.tipo ? t.tipo.toLowerCase().trim() : '';
    const ehSaida = tipoTexto === 'saída' || tipoTexto === 'saida' || tipoTexto === 'despesa';
    const noMes = t.data && t.data.substring(0, 7) === mesAtualTexto;
    return ehSaida && noMes;
  });

  const alertasOrcamento = [];
  Object.keys(limites).forEach((cat) => {
    const config = limites[cat];
    if (config.tipo === 'orcamento') {
      const totalGasto = despesasMesAtual
        .filter(t => t.categoria?.toLowerCase().trim() === cat.toLowerCase().trim())
        .reduce((soma, t) => soma + t.valor, 0);

      const limite = config.limite;
      if (limite > 0) {
        const porcentagem = (totalGasto / limite) * 100;
        
        if (porcentagem >= 80) {
          alertasOrcamento.push({
            id: `budget-${cat}`,
            descricao: `Orçamento: ${cat}`,
            valor: totalGasto,
            categoria: cat,
            tipoAlerta: 'orcamento',
            statusVencimento: porcentagem >= 100 ? 'vencida' : 'urgente',
            mensagem: porcentagem >= 100 
              ? `Limite esgotado! (${Math.round(porcentagem)}% consumido)` 
              : `Atenção! Você atingiu ${Math.round(porcentagem)}% do limite.`,
            diferencaDias: porcentagem >= 100 ? -999 : -100 
          });
        }
      }
    }
  });

  const todosAlertas = [...alertasOrcamento, ...alertasVencimento].sort((a, b) => a.diferencaDias - b.diferencaDias);

  // 🌟 GSAP: Animação de entrada nas notificações de alerta
  useGSAP(() => {
    if (todosAlertas.length > 0) {
      gsap.fromTo(
        '.alert-row',
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' }
      );
    }
  }, { dependencies: [todosAlertas.length], scope: containerRef });

  if (todosAlertas.length === 0) {
    return (
      <div 
        style={{
          backgroundColor: '#161e18',
          borderColor: '#273C2C',
        }}
        className="p-4 rounded-2xl border flex items-center gap-3 transition-colors duration-200 shadow-md"
      >
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
        <p style={{ color: '#FFE2FE' }} className="text-xs font-semibold">
          Tudo sob controle! Nenhuma conta atrasada ou orçamento estourando neste mês.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{
        backgroundColor: '#161e18',
        borderColor: '#273C2C',
      }}
      className="p-5 rounded-3xl border shadow-lg space-y-3 font-sans transition-colors duration-200"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-400" />
        <h3 style={{ color: '#D3C1D2' }} className="text-xs font-bold uppercase tracking-wider">
          Central de Notificações e Avisos
        </h3>
      </div>
      
      <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
        {todosAlertas.map((alerta) => (
          <div 
            key={alerta.id} 
            style={{
              backgroundColor: alerta.statusVencimento === 'vencida' ? 'rgba(98, 48, 48, 0.25)' : 'rgba(98, 80, 40, 0.25)',
              borderColor: alerta.statusVencimento === 'vencida' ? 'rgba(244, 63, 94, 0.35)' : 'rgba(251, 191, 36, 0.35)',
            }}
            className="alert-row flex items-center justify-between p-3 rounded-2xl border text-xs font-medium transition-all hover:scale-[1.01]"
          >
            <div className="flex flex-col gap-0.5">
              <span style={{ color: '#FFE2FE' }} className="font-bold flex items-center gap-1.5">
                {alerta.tipoAlerta === 'orcamento' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                {alerta.descricao}
              </span>
              <span 
                style={{ color: alerta.statusVencimento === 'vencida' ? '#f87171' : '#fbbf24' }} 
                className="text-[10px] flex items-center gap-1 font-semibold"
              >
                <CalendarClock className="w-3.5 h-3.5" /> {alerta.mensagem}
              </span>
            </div>
            <div className="text-right">
              <span style={{ color: '#FFE2FE' }} className="font-bold block">
                R$ {alerta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span 
                style={{
                  backgroundColor: '#161e18',
                  color: '#D3C1D2',
                  borderColor: '#273C2C'
                }}
                className="text-[9px] px-2 py-0.5 rounded-md font-semibold border inline-block mt-0.5"
              >
                {alerta.categoria}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}