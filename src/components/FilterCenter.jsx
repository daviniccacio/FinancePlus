// src/components/FilterCenter.jsx
import { useRef } from 'react';
import { Search } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import CustomSelect from './common/CustomSelect';

// Registro obrigatório do plugin GSAP para React
gsap.registerPlugin(useGSAP);

/**
 * PALETA DE CORES PERSONALIZADA:
 * 1. Evergreen:       #273C2C
 * 2. Dim Grey:        #626868
 * 3. Rosy Granite:    #939196
 * 4. Thistle:         #D3C1D2
 * 5. Lavender Veil:   #FFE2FE
 */

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

  // Função para atualizar o filtro e retornar à primeira página
  const atualizarFiltro = (setter, valor) => {
    setter(valor);
    setPaginaAtual(1);
  };

  // Mapeia a lista de categorias únicas para o formato esperado pelo CustomSelect
  const opcoesCategoria = [
    { value: '', label: 'Todas Categorias' },
    ...categoriasUnicas.map((c) => ({ value: c, label: c }))
  ];

  // Opções de Status com indicadores visuais
  const opcoesStatus = [
    { value: '', label: 'Todos Status' },
    { value: 'Pago', label: '✅ Pago' },
    { value: 'Pendente', label: '⏳ Pendente' }
  ];

  return (
    <section 
      ref={containerRef} 
      style={{
        backgroundColor: '#161e18',
        borderColor: '#273C2C',
      }}
      className="p-3 rounded-2xl border grid grid-cols-1 sm:grid-cols-3 gap-2.5 shadow-lg transition-colors duration-200 relative z-30 font-sans"
    >
      
      {/* 1. CAMPO DE BUSCA POR DESCRIÇÃO */}
      <div className="relative flex items-center w-full">
        <Search 
          style={{ color: '#939196' }} 
          className="w-3.5 h-3.5 absolute left-3 pointer-events-none" 
        />
        <input 
          type="text" 
          placeholder="Buscar descrição..." 
          style={{
            backgroundColor: 'rgba(39, 60, 44, 0.25)',
            borderColor: '#626868',
            color: '#FFE2FE'
          }}
          className="w-full border rounded-xl pl-8 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#D3C1D2] transition-all placeholder:text-[#939196]" 
          value={buscaTexto} 
          onChange={(e) => atualizarFiltro(setBuscaTexto, e.target.value)} 
        />
      </div>

      {/* 2. SELETOR PERSONALIZADO DE CATEGORIA (z-30 garante prioridade de sobreposição) */}
      <div className="relative z-30">
        <CustomSelect
          value={filtroCategoria}
          onChange={(val) => atualizarFiltro(setFiltroCategoria, val)}
          options={opcoesCategoria}
          placeholder="Todas Categorias"
        />
      </div>

      {/* 3. SELETOR PERSONALIZADO DE STATUS (z-20) */}
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