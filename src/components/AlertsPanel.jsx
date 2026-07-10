import { AlertTriangle, CalendarClock, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Componente AlertsPanel - Monitora vencimentos e limites de orçamentos
 */
export default function AlertsPanel({ transacoes = [], limites = {} }) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const mesAtualTexto = hoje.toISOString().substring(0, 7); // Formato "AAAA-MM"

  // --- PARTE A: ALERTAS DE CONTAS A PAGAR/VENCIMENTOS ---
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

  // --- PARTE B: ALERTAS DE ORÇAMENTO ESTOURADO (MÊS ATUAL) ---
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
            diferencaDias: porcentagem >= 100 ? -999 : -100 // Garante prioridade visual no topo
          });
        }
      }
    }
  });

  // Combinar e ordenar os alertas por criticidade
  const todosAlertas = [...alertasOrcamento, ...alertasVencimento].sort((a, b) => a.diferencaDias - b.diferencaDias);

  if (todosAlertas.length === 0) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/30 flex items-center gap-3 transition-colors duration-200">
        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          Tudo sob controle! Nenhuma conta atrasada ou orçamento estourando neste mês.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200/60 dark:border-zinc-800 shadow-xs space-y-3 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
          Central de Notificações e Avisos
        </h3>
      </div>
      
      <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
        {todosAlertas.map((alerta) => (
          <div 
            key={alerta.id} 
            className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
              alerta.statusVencimento === 'vencida'
                ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400'
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
                {alerta.tipoAlerta === 'orcamento' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                {alerta.descricao}
              </span>
              <span className="text-[10px] opacity-80 flex items-center gap-1">
                <CalendarClock className="w-3.5 h-3.5" /> {alerta.mensagem}
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold block text-gray-900 dark:text-zinc-100">
                R$ {alerta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/60 dark:bg-zinc-800/60 font-semibold border border-current/10 inline-block mt-0.5">
                {alerta.categoria}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}