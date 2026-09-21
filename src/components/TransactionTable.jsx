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

gsap.registerPlugin(useGSAP);

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

  // 🌟 Gera uma chave baseada nos IDs para impedir re-renders desnecessários
  const idsTransacoes = useMemo(() => {
    return transacoesPaginadas.map(t => `${t.id}-${t.valor}-${t.status}`).join('|');
  }, [transacoesPaginadas]);

  // 🌟 GSAP: Animação fluida executada quando o conteúdo muda
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

    if (diferencaDias < 0) return { rotulo: 'Atrasado', cor: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/40' };
    if (diferencaDias === 0) return { rotulo: 'Vence Hoje', cor: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/40 animate-pulse' };
    if (diferencaDias <= 3) return { rotulo: `Próximo (${diferencaDias} d)`, cor: 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/30 dark:border-orange-900/40' };
    return null;
  }

  return (
    <section 
      ref={containerRef} 
      className="rounded-3xl border overflow-hidden shadow-xs w-full transition-colors duration-200 font-sans bg-white dark:bg-[#161e18] border-gray-200 dark:border-[#273C2C]"
    >
      
      {/* Cabeçalho */}
      <div className="p-4 border-b flex justify-between items-center gap-2 border-gray-200 dark:border-[#273C2C]">
        <h2 className="font-bold text-xs md:text-sm text-gray-900 dark:text-[#FFE2FE]">
          Histórico de Lançamentos
        </h2>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={(e) => { animarClique(e); setIsModalAberto(true); }} 
            className="flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-xl hover:scale-105 transition-all shadow-xs cursor-pointer bg-[#273C2C] text-white dark:bg-[#D3C1D2] dark:text-[#273C2C]"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Novo Lançamento
          </button>
          <button 
            type="button" 
            onClick={(e) => { animarClique(e); exportarPDF(); }} 
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all shadow-xs cursor-pointer bg-gray-100 dark:bg-[#D3C1D2]/15 border-gray-300 dark:border-[#D3C1D2] text-gray-700 dark:text-[#D3C1D2] hover:bg-gray-200 dark:hover:bg-[#D3C1D2]/20"
          >
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {transacoesPaginadas.length === 0 && !carregando ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="p-4 rounded-2xl border mb-3 bg-gray-100 dark:bg-[#273C2C] border-gray-200 dark:border-[#626868] text-gray-400 dark:text-[#939196]">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-[#FFE2FE]">
            Nenhum lançamento por aqui
          </h3>
          <p className="text-xs mt-1 max-w-sm font-medium leading-relaxed text-gray-500 dark:text-[#939196]">
            Não encontramos transações cadastradas ou correspondentes aos filtros ativos neste período.
          </p>
          <button 
            type="button" 
            onClick={(e) => { animarClique(e); setIsModalAberto(true); }} 
            className="mt-4 flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-xl hover:scale-105 transition-all shadow-xs cursor-pointer bg-[#273C2C] text-white dark:bg-[#D3C1D2] dark:text-[#273C2C]"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Cadastrar transação
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wider border-b bg-gray-50 dark:bg-[#273C2C]/35 border-gray-200 dark:border-[#273C2C] text-gray-700 dark:text-[#D3C1D2]">
                  <th className="p-3.5">Data Lanc. / Venc.</th>
                  <th className="p-3.5">Descrição / Informações</th>
                  <th className="p-3.5">Valor</th>
                  <th className="p-3.5 text-center">Status / Alerta</th>
                  <th className="p-3.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs divide-gray-200 dark:divide-[#273C2C]">
                {carregando ? (
                  [1, 2, 3, 4].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-3.5">
                        <div className="h-3.5 rounded w-16 mb-1 bg-gray-200 dark:bg-[#273C2C]"></div>
                        <div className="h-3 rounded w-20 bg-gray-100 dark:bg-[#626868]"></div>
                      </td>
                      <td className="p-3.5">
                        <div className="h-4 rounded w-44 mb-1 bg-gray-200 dark:bg-[#273C2C]"></div>
                        <div className="h-3 rounded w-28 bg-gray-100 dark:bg-[#626868]"></div>
                      </td>
                      <td className="p-3.5">
                        <div className="h-4 rounded w-16 bg-gray-200 dark:bg-[#273C2C]"></div>
                      </td>
                      <td className="p-3.5">
                        <div className="h-4 rounded w-10 mx-auto bg-gray-200 dark:bg-[#273C2C]"></div>
                      </td>
                      <td className="p-3.5">
                        <div className="h-6 rounded-lg w-14 mx-auto bg-gray-200 dark:bg-[#626868]"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  transacoesPaginadas.map((t) => {
                    const alertaVencimento = verificarStatusVencimento(t.data_vencimento, t.status);
                    return (
                      <tr 
                        key={t.id} 
                        className="transaction-row transition-colors hover:bg-gray-50 dark:hover:bg-[#273C2C]/30"
                      >
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-bold text-xs text-gray-900 dark:text-[#FFE2FE]">
                            {formatarDataBRL(t.data)}
                          </div>
                          {t.data_vencimento && (
                            <div className="text-xs font-semibold mt-0.5 text-gray-500 dark:text-[#939196]">
                              Validade: {formatarDataBRL(t.data_vencimento)}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-sm text-gray-900 dark:text-[#FFE2FE]">
                            {t.descricao}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px]">
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border bg-gray-100 dark:bg-[#273C2C]/60 border-gray-200 dark:border-[#626868] text-gray-700 dark:text-[#D3C1D2]">
                              <Tag className="w-3 h-3 text-gray-400 dark:text-[#939196]" /> {t.categoria}
                            </span>
                            {t.dados_pagamento && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border bg-purple-50 dark:bg-[#D3C1D2]/15 border-purple-200 dark:border-[#D3C1D2]/30 text-purple-800 dark:text-[#FFE2FE]">
                                <CreditCard className="w-3 h-3 text-purple-600 dark:text-[#D3C1D2]" /> {t.dados_pagamento}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`p-3.5 font-bold whitespace-nowrap text-sm ${t.tipo === 'Entrada' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {t.tipo === 'Entrada' ? '+ ' : '- '}R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap space-y-1">
                          <div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              t.status === 'Pago' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40' 
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40'
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
                              className="p-1.5 rounded-lg border transition-colors cursor-pointer bg-gray-100 dark:bg-[#273C2C] border-gray-300 dark:border-[#626868] text-gray-700 dark:text-[#D3C1D2] hover:bg-gray-200 dark:hover:bg-[#626868]/40"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button" 
                              onClick={(e) => { animarClique(e); setIdExclusaoConfirmar(t.id); }} 
                              className="p-1.5 rounded-lg border transition-colors cursor-pointer bg-gray-100 dark:bg-[#273C2C] border-gray-300 dark:border-[#626868] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#626868]/40"
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
            <div className="p-3 border-t flex items-center justify-between text-xs bg-gray-50 dark:bg-[#273C2C]/25 border-gray-200 dark:border-[#273C2C] text-gray-600 dark:text-[#939196]">
              <span>Página <b className="text-gray-900 dark:text-[#FFE2FE]">{paginaAtual}</b> de {totalPaginas}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={paginaAtual === 1}
                  onClick={(e) => { animarClique(e); e.stopPropagation(); setPaginaAtual(p => p - 1); }}
                  className="p-1 border rounded-lg disabled:opacity-30 transition-colors cursor-pointer bg-white dark:bg-[#273C2C] border-gray-300 dark:border-[#626868] text-gray-800 dark:text-[#FFE2FE] hover:bg-gray-100 dark:hover:bg-[#626868]/40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={paginaAtual === totalPaginas}
                  onClick={(e) => { animarClique(e); e.stopPropagation(); setPaginaAtual(p => p + 1); }}
                  className="p-1 border rounded-lg disabled:opacity-30 transition-colors cursor-pointer bg-white dark:bg-[#273C2C] border-gray-300 dark:border-[#626868] text-gray-800 dark:text-[#FFE2FE] hover:bg-gray-100 dark:hover:bg-[#626868]/40"
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