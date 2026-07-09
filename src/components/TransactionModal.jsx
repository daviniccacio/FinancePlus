import { useState } from 'react'; // Apenas o useState, React removido por estar sem uso

const CATEGORIAS_PADRAO = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer'];

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
  // CORRIGIDO AQUI: Inicializa calculando direto se a categoria atual é customizada ou não
  const [modoTexto, setModoTexto] = useState(() => {
    return category && !CATEGORIAS_PADRAO.includes(category);
  });
  // DOCUMENTAÇÃO: Função responsável por aplicar a máscara de moeda (Ex: 23.250,30)
  const formatarMoeda = (valor) => {
    // Remove absolutamente tudo o que não for número/dígito
    let apenasDigitos = valor.replace(/\D/g, "");
    
    // Se o campo estiver vazio, retorna vazio para não travar com "0,00"
    if (!apenasDigitos) return "";
    
    // Transforma a string de números em um valor decimal com centavos (Ex: "250" vira "2.50")
    let valorComDecimais = (Number(apenasDigitos) / 100).toFixed(2);
    
    // Formata o número usando a API nativa do JavaScript para o padrão pt-BR
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valorComDecimais);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-150">
        
        <h2 className="text-xl font-bold mb-5 text-gray-950">
          {editandoId ? '📝 Editar Lançamento' : '✨ Nova Transação'}
        </h2>

        <form onSubmit={salvarLancamento} className="space-y-4">
          
          {/* Campo: Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 
            DOCUMENTAÇÃO DA ALTERAÇÃO (CAMPO VALOR COM MÁSCARA):
            - type="text" permite que manipulemos os pontos e vírgulas da máscara livremente.
            - inputMode="numeric" garante que os celulares abram apenas o teclado de números.
            - onChange aplica a função de máscara a cada tecla digitada pelo usuário.
          */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor (R$)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={valorMascara}
              onChange={(e) => {
                // Aplica a máscara e atualiza o estado que vai para o App.jsx
                const valorFormatado = formatarMoeda(e.target.value);
                setValorMascara(valorFormatado);
              }}
              placeholder="0,00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Campo: Categoria */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Categoria
              </label>
              <button
                type="button"
                onClick={() => {
                  setModoTexto(!modoTexto);
                  setCategoria(""); 
                }}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoFocus
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data do Lançamento
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-950"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Vencimento
              </label>
              <input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-950"
              />
            </div>
          </div>

          {/* Linha Dupla: Tipo e Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-950"
                required
              >
                <option value="Entrada">📈 Entrada</option>
                <option value="Saída">📉 Saída</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-950"
                required
              >
                <option value="Pago">✅ Pago / Recebido</option>
                <option value="Pendente">⏳ Pendente</option>
              </select>
            </div>
          </div>

          {/* Campo: Dados de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dados de Pagamento (Opcional)
            </label>
            <input
              type="text"
              value={dadosPagamento}
              onChange={(e) => setDadosPagamento(e.target.value)}
              placeholder="Chave Pix, Conta, Banco..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-950"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={limparFormulario}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-150 rounded-lg transition-colors cursor-pointer"
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