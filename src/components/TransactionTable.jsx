import { PlusCircle, FileText, FolderOpen, Tag, CreditCard, AlertTriangle, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TransactionTable({ carregando, transacoesPaginadas, totalPaginas, paginaAtual, setPaginaAtual, setIsModalAberto, exportarPDF, prepararEdicao, setIdExclusaoConfirmar }) {

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

    if (diferencaDias < 0) return { rotulo: 'Atrasado', cor: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/30' };
    if (diferencaDias === 0) return { rotulo: 'Vence Hoje', cor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30 animate-pulse' };
    if (diferencaDias <= 3) return { rotulo: `Próximo (${diferencaDias} d)`, cor: 'text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/30' };
    return null;
  }

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/60 dark:border-zinc-800 overflow-hidden shadow-sm w-full transition-colors duration-200">
      <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center gap-2">
        <h2 className="font-bold text-xs md:text-sm text-gray-900 dark:text-zinc-100">Histórico de Lançamentos</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setIsModalAberto(true)} className="flex items-center gap-1 bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-blue-600 transition-colors shadow-sm cursor-pointer">
            <PlusCircle className="w-3.5 h-3.5" /> Novo Lançamento
          </button>
          <button type="button" onClick={exportarPDF} className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-sm cursor-pointer">
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {transacoesPaginadas.length === 0 && !carregando ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900">
          <div className="p-4 bg-neutral-50 dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 mb-3 text-neutral-400 dark:text-zinc-500">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-neutral-700 dark:text-zinc-300">Nenhum lançamento por aqui</h3>
          <p className="text-xs text-neutral-400 dark:text-zinc-500 mt-1 max-w-sm font-medium leading-relaxed">
            Não encontramos transações cadastradas ou correspondentes aos filtros ativos neste período.
          </p>
          <button type="button" onClick={() => setIsModalAberto(true)} className="mt-4 flex items-center gap-1 bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors shadow-sm active:scale-95 cursor-pointer">
            <PlusCircle className="w-3.5 h-3.5" /> Cadastrar transação
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50 dark:bg-zinc-800/50 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800">
                  <th className="p-3.5">Data Lanc. / Venc.</th>
                  <th className="p-3.5">Descrição / Informações</th>
                  <th className="p-3.5">Valor</th>
                  <th className="p-3.5 text-center">Status / Alerta</th>
                  <th className="p-3.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-xs">
                {carregando ? (
                  [1, 2, 3, 4].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-3.5">
                        <div className="h-3.5 bg-neutral-200 dark:bg-zinc-700 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-neutral-100 dark:bg-zinc-800 rounded w-20"></div>
                      </td>
                      <td className="p-3.5">
                        <div className="h-4 bg-neutral-200 dark:bg-zinc-700 rounded w-44 mb-1"></div>
                        <div className="h-3 bg-neutral-100 dark:bg-zinc-800 rounded w-28"></div>
                      </td>
                      <td className="p-3.5">
                        <div className="h-4 bg-neutral-200 dark:bg-zinc-700 rounded w-16"></div>
                      </td>
                      <td className="p-3.5">
                        <div className="h-4 bg-neutral-200 dark:bg-zinc-700 rounded w-10 mx-auto"></div>
                      </td>
                      <td className="p-3.5">
                        <div className="h-6 bg-neutral-100 dark:bg-zinc-800 rounded-lg w-14 mx-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  transacoesPaginadas.map((t) => {
                    const alertaVencimento = verificarStatusVencimento(t.data_vencimento, t.status);
                    return (
                      <tr key={t.id} className="hover:bg-neutral-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-bold text-xs text-neutral-700 dark:text-zinc-300">{formatarDataBRL(t.data)}</div>
                          {t.data_vencimento && <div className="text-xs font-semibold text-neutral-400 dark:text-zinc-500 mt-0.5">Validade: {formatarDataBRL(t.data_vencimento)}</div>}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-neutral-900 dark:text-zinc-100 text-sm">{t.descricao}</div>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px]">
                            <span className="flex items-center gap-1 bg-neutral-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-medium text-neutral-500 dark:text-zinc-400">
                              <Tag className="w-3 h-3 text-neutral-400 dark:text-zinc-500" /> {t.categoria}
                            </span>
                            {t.dados_pagamento && (
                              <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-md font-medium border border-blue-100 dark:border-blue-900/40">
                                <CreditCard className="w-3 h-3 text-blue-400" /> {t.dados_pagamento}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`p-3.5 font-bold whitespace-nowrap text-sm ${t.tipo === 'Entrada' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {t.tipo === 'Entrada' ? '+ ' : '- '}R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap space-y-1">
                          <div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${t.status === 'Pago' ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/40' : 'bg-orange-50 dark:bg-orange-950/30 text-orange-500 dark:text-orange-400 border-orange-200 dark:border-orange-900/40'}`}>{t.status}</span>
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
                            <button type="button" onClick={() => prepararEdicao(t)} className="p-1.5 bg-neutral-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-neutral-100 dark:hover:bg-zinc-700 text-neutral-500 dark:text-zinc-400 transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => setIdExclusaoConfirmar(t.id)} className="p-1.5 bg-neutral-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-neutral-100 dark:hover:bg-zinc-700 text-red-500 dark:text-red-400 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <div className="p-3 bg-neutral-50 dark:bg-zinc-800/40 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-neutral-500 dark:text-zinc-400 text-xs">
              <span>Página <b>{paginaAtual}</b> de {totalPaginas}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={paginaAtual === 1}
                  onClick={(e) => { e.stopPropagation(); setPaginaAtual(p => p - 1); }}
                  className="p-1 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-zinc-700 cursor-pointer text-gray-700 dark:text-zinc-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={paginaAtual === totalPaginas}
                  onClick={(e) => { e.stopPropagation(); setPaginaAtual(p => p + 1); }}
                  className="p-1 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-zinc-700 cursor-pointer text-gray-700 dark:text-zinc-300"
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