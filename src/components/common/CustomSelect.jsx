// src/components/common/CustomSelect.jsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/**
 * PALETA DE CORES PERSONALIZADA:
 * 1. Evergreen:       #273C2C
 * 2. Dim Grey:        #626868
 * 3. Rosy Granite:    #939196
 * 4. Thistle:         #D3C1D2
 * 5. Lavender Veil:   #FFE2FE
 */

export default function CustomSelect({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Selecione uma opção',
  icon: IconComponent
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const chevronRef = useRef(null);

  // GSAP: Animação de Recolhimento (Fechamento)
  const fecharMenu = (callback) => {
    if (chevronRef.current) {
      gsap.to(chevronRef.current, { rotate: 0, duration: 0.2, ease: 'power2.in' });
    }

    if (listRef.current) {
      gsap.to(listRef.current, {
        height: 0,
        opacity: 0,
        y: -10,
        scaleY: 0.95,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          setIsOpen(false);
          if (callback) callback();
        }
      });
    } else {
      setIsOpen(false);
      if (callback) callback();
    }
  };

  // Fecha o menu se clicar fora do componente
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (isOpen) fecharMenu();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // GSAP: Animação de Deslize para Baixo (Abertura da Lista)
  useGSAP(() => {
    if (isOpen && listRef.current) {
      gsap.to(chevronRef.current, { rotate: 180, duration: 0.25, ease: 'power2.out' });

      gsap.fromTo(
        listRef.current,
        { height: 0, opacity: 0, y: -10, scaleY: 0.95 },
        { height: 'auto', opacity: 1, y: 0, scaleY: 1, duration: 0.3, ease: 'back.out(1.2)' }
      );
    }
  }, { dependencies: [isOpen] });

  const toggleOpen = () => {
    if (isOpen) {
      fecharMenu();
    } else {
      setIsOpen(true);
    }
  };

  const selecionarOpcao = (val) => {
    fecharMenu(() => {
      onChange(val);
    });
  };

  const itemSelecionado = options.find((opt) => 
    typeof opt === 'object' ? opt.value === value : opt === value
  );

  const labelExibida = itemSelecionado 
    ? (typeof itemSelecionado === 'object' ? itemSelecionado.label : itemSelecionado)
    : placeholder;

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full font-sans transition-all ${isOpen ? 'z-50' : 'z-10'}`}
    >
      
      {/* BOTÃO DO SELETOR */}
      <button
        type="button"
        onClick={toggleOpen}
        style={{
          backgroundColor: 'rgba(39, 60, 44, 0.25)',
          borderColor: isOpen ? '#D3C1D2' : '#626868',
          color: '#FFE2FE'
        }}
        className="w-full flex items-center justify-between px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none transition-all cursor-pointer shadow-xs hover:border-[#D3C1D2]"
      >
        <div className="flex items-center gap-2 truncate">
          {IconComponent && <IconComponent className="w-3.5 h-3.5 text-[#D3C1D2] shrink-0" />}
          <span style={{ color: !value ? '#939196' : '#FFE2FE' }} className="truncate">
            {labelExibida}
          </span>
        </div>
        <div ref={chevronRef} style={{ color: '#D3C1D2' }} className="shrink-0">
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {/* LISTA SUSPENSA */}
      {isOpen && (
        <div
          ref={listRef}
          style={{
            backgroundColor: '#161e18',
            borderColor: '#273C2C'
          }}
          className="absolute left-0 right-0 top-full mt-1.5 border rounded-2xl shadow-2xl overflow-hidden z-50 origin-top"
        >
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {options.length === 0 ? (
              <div style={{ color: '#939196' }} className="px-3 py-2 text-xs text-center">
                Nenhuma opção disponível
              </div>
            ) : (
              options.map((opt) => {
                const val = typeof opt === 'object' ? opt.value : opt;
                const label = typeof opt === 'object' ? opt.label : opt;
                const estaSelecionado = value === val;

                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => selecionarOpcao(val)}
                    style={{
                      backgroundColor: estaSelecionado ? 'rgba(211, 193, 210, 0.15)' : 'transparent',
                      color: estaSelecionado ? '#FFE2FE' : '#D3C1D2'
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between hover:bg-[#273C2C]/50"
                  >
                    <span>{label}</span>
                    {estaSelecionado && <span className="w-1.5 h-1.5 rounded-full bg-[#D3C1D2]"></span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}