// src/components/TransactionModal.jsx
import { useState, useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import CustomSelect from './common/CustomSelect';

gsap.registerPlugin(useGSAP);

const CATEGORIAS_PADRAO = [
  'Alimentação', 'Moradia', 'Transporte', 'Saúde',
  'Educação', 'Lazer', 'Renda', 'Transferência',
  'Contas', 'Investimentos', 'Outros'
];

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
  setStatus,
  repetir,
  setRepetir,
  tipoRepeticao,
  setTipoRepeticao,
  numeroParcelas,
  setNumeroParcelas,
  transacoes = []
}) {
  const [modoTexto, setModoTexto] = useState(() => {
    return category && !CATEGORIAS_PADRAO.includes(category);
  });

  const backdropRef = useRef(null);
  const modalBoxRef = useRef(null);
  const pillFrequenciaRef = useRef(null);
  const btnFixoRef = useRef(null);
  const btnParceladoRef = useRef(null);
  const secaoRepetirRef = useRef(null);
  const campoCategoriaRef = useRef(null);

  // 🌟 GSAP: Animação de entrada do Modal e do Backdrop
  useGSAP(() => {
    gsap.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: 'power2.out' }
    );

    gsap.fromTo(
      modalBoxRef.current,
      { y: -45, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.2)' }
    );
  }, { scope: backdropRef });

  // 🌟 GSAP: Animação ao alternar entre seleção ou texto da Categoria
  useGSAP(() => {
    if (campoCategoriaRef.current) {
      gsap.fromTo(
        campoCategoriaRef.current,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      );
    }
  }, { dependencies: [modoTexto] });

  // 🌟 GSAP: Pílula deslizante de frequência (Fixo / Parcelado)
  useGSAP(() => {
    if (!repetir) return;
    const alvo = tipoRepeticao === 'fixo' ? btnFixoRef.current : btnParceladoRef.current;

    if (alvo && pillFrequenciaRef.current) {
      gsap.to(pillFrequenciaRef.current, {
        x: alvo.offsetLeft,
        width: alvo.offsetWidth,
        duration: 0.3,
        ease: 'power3.out',
      });
    }
  }, { dependencies: [tipoRepeticao, repetir] });

  // 🌟 GSAP: Expansão fluida do painel de repetição
  useEffect(() => {
    if (secaoRepetirRef.current) {
      if (repetir) {
        gsap.fromTo(
          secaoRepetirRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.35, ease: 'power2.out' }
        );
      } else {
        gsap.to(secaoRepetirRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.25,
          ease: 'power2.in',
        });
      }
    }
  }, [repetir]);

  const fecharComAnimacao = (acao) => {
    gsap.to(modalBoxRef.current, {
      y: -30,
      opacity: 0,
      scale: 0.96,
      duration: 0.2,
      ease: 'power2.in',
    });

    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        if (acao) acao();
        else limparFormulario();
      },
    });
  };

  const todasCategorias = useMemo(() => {
    const categoriasExistentes = transacoes
      .map((t) => t.categoria)
      .filter((c) => c && Boolean(c.trim()));

    if (category && category.trim()) {
      categoriasExistentes.push(category.trim());
    }

    const combinadas = [...CATEGORIAS_PADRAO, ...categoriasExistentes];
    return Array.from(new Set(combinadas)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [transacoes, category]);

  const formatarMoeda = (valor) => {
    let apenasDigitos = valor.replace(/\D/g, "");
    if (!apenasDigitos) return "";
    let valorComDecimais = (Number(apenasDigitos) / 100).toFixed(2);
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valorComDecimais);
  };

  const opcoesTipo = [
    { value: 'Entrada', label: '📈 Entrada' },
    { value: 'Saída', label: '📉 Saída' }
  ];

  const opcoesStatus = [
    { value: 'Pago', label: '✅ Pago / Recebido' },
    { value: 'Pendente', label: '⏳ Pendente' }
  ];

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-hidden font-sans"
    >
      <div
        ref={modalBoxRef}
        className="rounded-3xl p-6 w-full max-w-2xl shadow-2xl border bg-white dark:bg-[#161e18] border-gray-200 dark:border-[#273C2C] text-gray-900 dark:text-[#FFE2FE] transition-colors duration-200 my-auto max-h-[90vh] overflow-y-auto"
      >

        <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-900 dark:text-[#FFE2FE]">
          {editandoId ? '📝 Editar Lançamento' : '✨ Nova Transação'}
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); salvarLancamento(e); }} className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

            {/* Descrição */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700 dark:text-[#D3C1D2]">
                Descrição
              </label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#273C2C] dark:focus:border-[#D3C1D2] transition-all bg-gray-50 dark:bg-[#273C2C]/25 border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE] placeholder:text-gray-400 dark:placeholder:text-[#939196]"
                required
              />
            </div>

            {/* Valor */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700 dark:text-[#D3C1D2]">
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
                className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#273C2C] dark:focus:border-[#D3C1D2] transition-all bg-gray-50 dark:bg-[#273C2C]/25 border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE] placeholder:text-gray-400 dark:placeholder:text-[#939196]"
                required
              />
            </div>

            {/* Categoria com CustomSelect */}
            <div className="md:col-span-3 relative z-30">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-[#D3C1D2]">
                  Categoria
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setModoTexto(!modoTexto);
                    setCategoria("");
                  }}
                  className="text-xs font-semibold text-[#273C2C] dark:text-[#D3C1D2] hover:underline cursor-pointer"
                >
                  {modoTexto ? "📋 Ver Lista" : "➕ Nova Categoria"}
                </button>
              </div>

              <div ref={campoCategoriaRef}>
                {modoTexto ? (
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Nome da nova categoria"
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#273C2C] dark:focus:border-[#D3C1D2] transition-all bg-gray-50 dark:bg-[#273C2C]/25 border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE] placeholder:text-gray-400 dark:placeholder:text-[#939196]"
                    required
                    autoFocus
                  />
                ) : (
                  <CustomSelect
                    value={category}
                    onChange={(val) => setCategoria(val)}
                    options={todasCategorias}
                    placeholder="Selecione uma categoria"
                  />
                )}
              </div>
            </div>

            {/* Dados de Pagamento */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700 dark:text-[#D3C1D2]">
                Dados de Pagamento (Opcional)
              </label>
              <input
                type="text"
                value={dadosPagamento}
                onChange={(e) => setDadosPagamento(e.target.value)}
                placeholder="Chave Pix, Conta, Banco..."
                className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#273C2C] dark:focus:border-[#D3C1D2] transition-all bg-gray-50 dark:bg-[#273C2C]/25 border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE] placeholder:text-gray-400 dark:placeholder:text-[#939196]"
              />
            </div>

            {/* Data Lançamento */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700 dark:text-[#D3C1D2]">
                Data do Lançamento
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#273C2C] dark:focus:border-[#D3C1D2] cursor-pointer bg-gray-50 dark:bg-[#273C2C]/25 border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE]"
                required
              />
            </div>

            {/* Data Vencimento */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700 dark:text-[#D3C1D2]">
                Data de Vencimento
              </label>
              <input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#273C2C] dark:focus:border-[#D3C1D2] cursor-pointer bg-gray-50 dark:bg-[#273C2C]/25 border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE]"
              />
            </div>

            {/* Tipo (com CustomSelect) */}
            <div className="md:col-span-3 relative z-20">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700 dark:text-[#D3C1D2]">
                Tipo
              </label>
              <CustomSelect
                value={tipo}
                onChange={(val) => setTipo(val)}
                options={opcoesTipo}
              />
            </div>

            {/* Status (com CustomSelect) */}
            <div className="md:col-span-3 relative z-20">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700 dark:text-[#D3C1D2]">
                Status
              </label>
              <CustomSelect
                value={status}
                onChange={(val) => setStatus(val)}
                options={opcoesStatus}
              />
            </div>

            {/* Repetição / Parcelamento */}
            {!editandoId && (
              <div className="md:col-span-6 border p-4 rounded-2xl space-y-3 mt-1 overflow-hidden bg-gray-50 dark:bg-[#273C2C]/25 border-gray-200 dark:border-[#273C2C]">
                <label className="flex items-center gap-2.5 text-xs font-bold cursor-pointer select-none text-gray-900 dark:text-[#FFE2FE]">
                  <input
                    type="checkbox"
                    checked={repetir}
                    onChange={(e) => setRepetir(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-[#626868] focus:ring-0 cursor-pointer accent-[#273C2C] dark:accent-[#D3C1D2]"
                  />
                  <span>Repetir lançamento / Parcelamento</span>
                </label>

                <div ref={secaoRepetirRef} className="overflow-hidden opacity-0 h-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-dashed border-gray-300 dark:border-[#626868]">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase text-gray-700 dark:text-[#D3C1D2]">
                        Frequência
                      </label>
                      <div className="relative flex border p-1 rounded-xl gap-1 bg-white dark:bg-[#161e18] border-gray-300 dark:border-[#626868]">

                        <div
                          ref={pillFrequenciaRef}
                          className="absolute top-1 bottom-1 left-0 rounded-lg pointer-events-none z-0 bg-[#273C2C] dark:bg-[#D3C1D2]"
                        />

                        <button
                          type="button"
                          ref={btnFixoRef}
                          onClick={() => setTipoRepeticao('fixo')}
                          className={`relative z-10 flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors cursor-pointer ${
                            tipoRepeticao === 'fixo' 
                              ? 'text-white dark:text-[#273C2C]' 
                              : 'text-gray-600 dark:text-[#939196]'
                          }`}
                        >
                          Fixo Mensal
                        </button>
                        <button
                          type="button"
                          ref={btnParceladoRef}
                          onClick={() => setTipoRepeticao('parcelado')}
                          className={`relative z-10 flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors cursor-pointer ${
                            tipoRepeticao === 'parcelado' 
                              ? 'text-white dark:text-[#273C2C]' 
                              : 'text-gray-600 dark:text-[#939196]'
                          }`}
                        >
                          Parcelado
                        </button>
                      </div>
                    </div>

                    {tipoRepeticao === 'parcelado' ? (
                      <div className="space-y-1">
                        <label className="block text-xs font-bold uppercase text-gray-700 dark:text-[#D3C1D2]">
                          Nº de Parcelas
                        </label>
                        <input
                          type="number"
                          min="2"
                          max="72"
                          value={numeroParcelas}
                          onChange={(e) => setNumeroParcelas(Math.max(2, Number(e.target.value)))}
                          className="w-full px-3.5 py-1.5 border rounded-xl text-xs font-bold focus:outline-none focus:border-[#273C2C] dark:focus:border-[#D3C1D2] transition-all bg-white dark:bg-[#161e18] border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE]"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-center px-3 text-xs font-medium rounded-xl border mt-4 sm:mt-0 bg-white dark:bg-[#161e18] border-gray-200 dark:border-[#273C2C] text-gray-600 dark:text-[#939196]">
                        Lança automaticamente este valor para os próximos 12 meses.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Botões do Rodapé */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-[#273C2C]">
            <button
              type="button"
              onClick={() => fecharComAnimacao(null)}
              className="px-4 py-2 text-xs font-bold rounded-xl transition-opacity cursor-pointer bg-gray-200 dark:bg-[#273C2C] text-gray-700 dark:text-[#D3C1D2] hover:opacity-80"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer bg-[#273C2C] text-white dark:bg-[#D3C1D2] dark:text-[#273C2C]"
            >
              {editandoId ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}