// src/components/TransactionTable.jsx
import { useRef, useMemo } from 'react';
import { 
  PlusCircle, 
  FileText, 
  FolderOpen, 
  Tag, 
  CreditCard, 
  AlertTriangle, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Registro obrigatório do plugin GSAP
gsap.registerPlugin(useGSAP);

/**
 * PALETA DE CORES PERSONALIZADA:
 * 1. Evergreen:       #273C2C
 * 2. Dim Grey:        #626868
 * 3. Rosy Granite:    #939196
 * 4. Thistle:         #D3C1D2
 * 5. Lavender Veil:   #FFE2FE
 */

export default function TransactionTable({ 
  carregando, 
  transacoesPaginadas, 
  totalPaginas, 
  paginaAtual, 
  setPaginaAtual, 
  setIsModalAberto, 
  exportarPDF, 
  prepararEdicao, 
  setIdExclusaoConfirmar 
}) {
  const containerRef = useRef(null);

  // 🌟 Gera uma chave baseada nos IDs para impedir re-renders de digitação no formulário
  const idsTransacoes = useMemo(() => {
    return transacoesPaginadas.map(t => `${t.id}-${t.valor}-${t.status}`).join('|');
  }, [transacoesPaginadas]);

  // 🌟 GSAP: Animação fluida executada apenas quando o conteúdo real muda
  useGSAP(() => {
    if (!carregando && transacoesPaginadas.length > 0) {
      gsap.fromTo(
        '.transaction-row',
        { opacity: 0, y: -18, scaleY: 0.96 },
        { 
          opacity: 1, 
          y: 0, 
          scaleY: 1, 
          duration: 0.35, 
          stagger: 0.05,
          ease: 'power2.out',
          clearProps: 'transform'
        }
      );
    }
  }, { dependencies: [idsTransacoes, carregando, paginaAtual], scope: containerRef });

  // Resposta tátil para botões
  const animarClique = (e) => {
    gsap.fromTo(
      e.currentTarget,
      { scale: 0.9 },
      { scale: 1, duration: 0.25, ease: 'back.out(2)' }
    );
  };

  function formatarDataBRL(dataString) {
    if (!dataString) return '-';
    const partes = dataString.split('-');
    if (partes.length !== 3) return dataString;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function verificarStatusVencimento(dataVenc, statusAtual) {
    if (!dataVenc || statusAtual === 'Pago') return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dataVenc + 'T00:00:00');
    vencimento.setHours(0, 0, 0, 0);

    const diferencaTempo = vencimento.getTime() - hoje.getTime();
    const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

    if (diferencaDias < 0) return { rotulo: 'Atrasado', cor: 'text-rose-400 bg-rose-950/30 border-rose-900/40' };
    if (diferencaDias === 0) return { rotulo: 'Vence Hoje', cor: 'text-amber-400 bg-amber-950/30 border-amber-900/40 animate-pulse' };
    if (diferencaDias <= 3) return { rotulo: `Próximo (${diferencaDias} d)`, cor: 'text-orange-400 bg-orange-950/30 border-orange-900/40' };
    return null;
  }

  return (
    <section 
      ref={containerRef} 
      style={{
        backgroundColor: '#161e18',
        borderColor: '#273C2C'
      }}
      className="rounded-3xl border overflow-hidden shadow-lg w-full transition-colors duration-200 font-sans"
    >
      
      {/* Cabeçalho */}
      <div style={{ borderColor: '#273C2C' }} className="p-4 border-b flex justify-between items-center gap-2">
        <h2 style={{ color: '#FFE2FE' }} className="font-bold text-xs md:text-sm">Histórico de Lançamentos</h2>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={(e) => { animarClique(e); setIsModalAberto(true); }} 
            style={{ backgroundColor: '#D3C1D2', color: '#273C2C' }}
            className="flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-xl hover:scale-105 transition-all shadow-md cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Novo Lançamento
          </button>
          <button 
            type="button" 
            onClick={(e) => { animarClique(e); exportarPDF(); }} 
            style={{
              backgroundColor: 'rgba(211, 193, 210, 0.15)',
              borderColor: '#D3C1D2',
              color: '#D3C1D2'
            }}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border hover:bg-[#D3C1D2]/20 transition-all shadow-xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {transacoesPaginadas.length === 0 && !carregando ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div 
            style={{ backgroundColor: '#273C2C', borderColor: '#626868' }}
            className="p-4 rounded-2xl border mb-3 text-[#939196]"
          >
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 style={{ color: '#FFE2FE' }} className="text-sm font-bold">Nenhum lançamento por aqui</h3>
          <p style={{ color: '#939196' }} className="text-xs mt-1 max-w-sm font-medium leading-relaxed">
            Não encontramos transações cadastradas ou correspondentes aos filtros ativos neste período.
          </p>
          <button 
            type="button" 
            onClick={(e) => { animarClique(e); setIsModalAberto(true); }} 
            style={{ backgroundColor: '#D3C1D2', color: '#273C2C' }}
            className="mt-4 flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-xl hover:scale-105 transition-all shadow-md cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Cadastrar transação
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr 
                  style={{
                    backgroundColor: 'rgba(39, 60, 44, 0.35)',
                    borderColor: '#273C2C',
                    color: '#D3C1D2'
                  }}
                  className="text-[10px] font-bold uppercase tracking-wider border-b"
                >
                  <th className="p-3.5">Data Lanc. / Venc.</th>
                  <th className="p-3.5">Descrição / Informações</th>
                  <th className="p-3.5">Valor</th>
                  <th className="p-3.5 text-center">Status / Alerta</th>
                  <th className="p-3.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody style={{ borderColor: '#273C2C' }} className="divide-y text-xs">
                {carregando ? (
                  [1, 2, 3, 4].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-3.5">
                        <div style={{ backgroundColor: '#273C2C' }} className="h-3.5 rounded w-16 mb-1"></div>
                        <div style={{ backgroundColor: '#626868' }} className="h-3 rounded w-20"></div>
                      </td>
                      <td className="p-3.5">
                        <div style={{ backgroundColor: '#273C2C' }} className="h-4 rounded w-44 mb-1"></div>
                        <div style={{ backgroundColor: '#626868' }} className="h-3 rounded w-28"></div>
                      </td>
                      <td className="p-3.5">
                        <div style={{ backgroundColor: '#273C2C' }} className="h-4 rounded w-16"></div>
                      </td>
                      <td className="p-3.5">
                        <div style={{ backgroundColor: '#273C2C' }} className="h-4 rounded w-10 mx-auto"></div>
                      </td>
                      <td className="p-3.5">
                        <div style={{ backgroundColor: '#626868' }} className="h-6 rounded-lg w-14 mx-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  transacoesPaginadas.map((t) => {
                    const alertaVencimento = verificarStatusVencimento(t.data_vencimento, t.status);
                    return (
                      <tr 
                        key={t.id} 
                        className="transaction-row transition-colors hover:bg-[#273C2C]/30"
                      >
                        <td className="p-3.5 whitespace-nowrap">
                          <div style={{ color: '#FFE2FE' }} className="font-bold text-xs">{formatarDataBRL(t.data)}</div>
                          {t.data_vencimento && (
                            <div style={{ color: '#939196' }} className="text-xs font-semibold mt-0.5">
                              Validade: {formatarDataBRL(t.data_vencimento)}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div style={{ color: '#FFE2FE' }} className="font-semibold text-sm">{t.descricao}</div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px]">
                            <span 
                              style={{
                                backgroundColor: 'rgba(39, 60, 44, 0.6)',
                                borderColor: '#626868',
                                color: '#D3C1D2'
                              }}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border"
                            >
                              <Tag className="w-3 h-3 text-[#939196]" /> {t.categoria}
                            </span>
                            {t.dados_pagamento && (
                              <span 
                                style={{
                                  backgroundColor: 'rgba(211, 193, 210, 0.15)',
                                  borderColor: 'rgba(211, 193, 210, 0.3)',
                                  color: '#FFE2FE'
                                }}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border"
                              >
                                <CreditCard className="w-3 h-3 text-[#D3C1D2]" /> {t.dados_pagamento}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`p-3.5 font-bold whitespace-nowrap text-sm ${t.tipo === 'Entrada' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.tipo === 'Entrada' ? '+ ' : '- '}R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap space-y-1">
                          <div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              t.status === 'Pago' 
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' 
                                : 'bg-amber-950/40 text-amber-400 border-amber-900/40'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          {alertaVencimento && (
                            <div className="flex justify-center">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold border flex items-center gap-0.5 ${alertaVencimento.cor}`}>
                                <AlertTriangle className="w-2.5 h-2.5" /> {alertaVencimento.rotulo}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button 
                              type="button" 
                              onClick={(e) => { animarClique(e); prepararEdicao(t); }} 
                              style={{ backgroundColor: '#273C2C', borderColor: '#626868', color: '#D3C1D2' }}
                              className="p-1.5 rounded-lg border hover:bg-[#626868]/40 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button" 
                              onClick={(e) => { animarClique(e); setIdExclusaoConfirmar(t.id); }} 
                              style={{ backgroundColor: '#273C2C', borderColor: '#626868' }}
                              className="p-1.5 rounded-lg border hover:bg-[#626868]/40 text-rose-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!carregando && (
            <div 
              style={{
                backgroundColor: 'rgba(39, 60, 44, 0.25)',
                borderColor: '#273C2C',
                color: '#939196'
              }}
              className="p-3 border-t flex items-center justify-between text-xs"
            >
              <span>Página <b style={{ color: '#FFE2FE' }}>{paginaAtual}</b> de {totalPaginas}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={paginaAtual === 1}
                  onClick={(e) => { animarClique(e); e.stopPropagation(); setPaginaAtual(p => p - 1); }}
                  style={{ backgroundColor: '#273C2C', borderColor: '#626868', color: '#FFE2FE' }}
                  className="p-1 border rounded-lg disabled:opacity-30 hover:bg-[#626868]/40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={paginaAtual === totalPaginas}
                  onClick={(e) => { animarClique(e); e.stopPropagation(); setPaginaAtual(p => p + 1); }}
                  style={{ backgroundColor: '#273C2C', borderColor: '#626868', color: '#FFE2FE' }}
                  className="p-1 border rounded-lg disabled:opacity-30 hover:bg-[#626868]/40 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}