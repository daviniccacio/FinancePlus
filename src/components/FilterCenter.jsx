export default function FilterCenter({ buscaTexto, setBuscaTexto, filtroCategoria, setFiltroCategoria, filtroStatus, setFiltroStatus, categoriasUnicas, setPaginaAtual }) {
  const atualizarFiltro = (setter, valor) => {
    setter(valor);
    setPaginaAtual(1);
  };

  return (
    <section className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-gray-200/60 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 shadow-sm transition-colors duration-200">
      <input 
        type="text" 
        placeholder="Buscar descrição..." 
        className="bg-neutral-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all text-neutral-700 dark:text-zinc-300 placeholder:text-gray-400" 
        value={buscaTexto} 
        onChange={(e) => atualizarFiltro(setBuscaTexto, e.target.value)} 
      />
      <select 
        className="bg-neutral-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-neutral-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all cursor-pointer" 
        value={filtroCategoria} 
        onChange={(e) => atualizarFiltro(setFiltroCategoria, e.target.value)}
      >
        <option value="">Todas Categorias</option>
        {categoriasUnicas.map((c, i) => <option key={i} value={c}>{c}</option>)}
      </select>
      <select 
        className="bg-neutral-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-neutral-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all cursor-pointer" 
        value={filtroStatus} 
        onChange={(e) => atualizarFiltro(setFiltroStatus, e.target.value)}
      >
        <option value="">Todos Status</option>
        <option value="Pago">Pago</option>
        <option value="Pendente">Pendente</option>
      </select>
    </section>
  );
}