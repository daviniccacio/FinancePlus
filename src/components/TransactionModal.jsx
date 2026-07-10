import { useState } from 'react';

const CATEGORIAS_PADRAO = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Renda', 'Transferência', 'Contas', 'Investimentos', 'Outros'];

export default function TransactionModal({
  editandoId,
  limparFormulario,
  salvarLancamento,
  data,
  setData,
  dataVencimento,
  setDataVencimento,
  descricao,
  setDescricao,
  dadosPagamento,
  setDadosPagamento,
  valorMascara,
  setValorMascara,
  category,
  setCategoria,
  tipo,
  setTipo,
  status,
  setStatus
}) {
  const [modoTexto, setModoTexto] = useState(() => {
    return category && !CATEGORIAS_PADRAO.includes(category);
  });

  const formatarMoeda = (valor) => {
    let apenasDigitos = valor.replace(/\D/g, "");
    if (!apenasDigitos) return "";
    let valorComDecimais = (Number(apenasDigitos) / 100).toFixed(2);
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valorComDecimais);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-150 dark:border-zinc-800 text-gray-950 dark:text-zinc-50 transition-colors duration-200">
        
        <h2 className="text-xl font-bold mb-5 text-gray-950 dark:text-zinc-100">
          {editandoId ? '📝 Editar Lançamento' : '✨ Nova Transação'}
        </h2>

        <form onSubmit={salvarLancamento} className="space-y-4">
          
          {/* Campo: Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
          </div>

          {/* Campo: Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              Valor (R$)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={valorMascara}
              onChange={(e) => {
                const valorFormatado = formatarMoeda(e.target.value);
                setValorMascara(valorFormatado);
              }}
              placeholder="0,00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-500"
              required
            />
          </div>

          {/* Campo: Categoria */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Categoria
              </label>
              <button
                type="button"
                onClick={() => {
                  setModoTexto(!modoTexto);
                  setCategoria(""); 
                }}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {modoTexto ? "📋 Ver Lista" : "➕ Nova Categoria"}
              </button>
            </div>

            {modoTexto ? (
              <input
                type="text"
                value={category}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Nome da nova categoria"
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
                autoFocus
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                required
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIAS_PADRAO.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Linha Dupla: Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Data do Lançamento
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-950 dark:text-zinc-100 cursor-pointer"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Data de Vencimento
              </label>
              <input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-950 dark:text-zinc-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Linha Dupla: Tipo e Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-950 dark:text-zinc-100 cursor-pointer"
                required
              >
                <option value="Entrada">📈 Entrada</option>
                <option value="Saída">📉 Saída</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-950 dark:text-zinc-100 cursor-pointer"
                required
              >
                <option value="Pago">✅ Pago / Recebido</option>
                <option value="Pendente">⏳ Pendente</option>
              </select>
            </div>
          </div>

          {/* Campo: Dados de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              Dados de Pagamento (Opcional)
            </label>
            <input
              type="text"
              value={dadosPagamento}
              onChange={(e) => setDadosPagamento(e.target.value)}
              placeholder="Chave Pix, Conta, Banco..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-950 dark:text-zinc-100 placeholder:text-gray-500"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={limparFormulario}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-150 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all cursor-pointer"
            >
              {editandoId ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}