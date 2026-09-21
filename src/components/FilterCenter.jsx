// src/components/FilterCenter.jsx
import { useRef } from 'react';
import { Search } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import CustomSelect from './common/CustomSelect';

gsap.registerPlugin(useGSAP);

export default function FilterCenter({ 
  buscaTexto, 
  setBuscaTexto, 
  filtroCategoria, 
  setFiltroCategoria, 
  filtroStatus, 
  setFiltroStatus, 
  categoriasUnicas = [], 
  setPaginaAtual 
}) {
  const containerRef = useRef(null);

  // 🌟 GSAP: Animação de entrada suave no carregamento da barra
  useGSAP(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: -12, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
    );
  }, { scope: containerRef });

  const atualizarFiltro = (setter, valor) => {
    setter(valor);
    setPaginaAtual(1);
  };

  const opcoesCategoria = [
    { value: '', label: 'Todas Categorias' },
    ...categoriasUnicas.map((c) => ({ value: c, label: c }))
  ];

  const opcoesStatus = [
    { value: '', label: 'Todos Status' },
    { value: 'Pago', label: '✅ Pago' },
    { value: 'Pendente', label: '⏳ Pendente' }
  ];

  return (
    <section 
      ref={containerRef} 
      className="p-3 rounded-2xl bg-white dark:bg-[#161e18] border border-gray-200 dark:border-[#273C2C] grid grid-cols-1 sm:grid-cols-3 gap-2.5 shadow-xs transition-colors duration-200 relative z-30 font-sans"
    >
      
      {/* 1. CAMPO DE BUSCA POR DESCRIÇÃO */}
      <div className="relative flex items-center w-full">
        <Search className="w-3.5 h-3.5 absolute left-3 pointer-events-none text-gray-400 dark:text-[#939196]" />
        <input 
          type="text" 
          placeholder="Buscar descrição..." 
          className="w-full bg-gray-50 dark:bg-[#273C2C]/25 border border-gray-200 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE] placeholder:text-gray-400 dark:placeholder:text-[#939196] rounded-xl pl-8 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#273C2C] dark:focus:border-[#D3C1D2] transition-all" 
          value={buscaTexto} 
          onChange={(e) => atualizarFiltro(setBuscaTexto, e.target.value)} 
        />
      </div>

      {/* 2. SELETOR PERSONALIZADO DE CATEGORIA */}
      <div className="relative z-30">
        <CustomSelect
          value={filtroCategoria}
          onChange={(val) => atualizarFiltro(setFiltroCategoria, val)}
          options={opcoesCategoria}
          placeholder="Todas Categorias"
        />
      </div>

      {/* 3. SELETOR PERSONALIZADO DE STATUS */}
      <div className="relative z-20">
        <CustomSelect
          value={filtroStatus}
          onChange={(val) => atualizarFiltro(setFiltroStatus, val)}
          options={opcoesStatus}
          placeholder="Todos Status"
        />
      </div>

    </section>
  );
}