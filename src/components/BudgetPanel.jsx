// src/components/BudgetPanel.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import toast from 'react-hot-toast';
import { Target, AlertCircle, CheckCircle2, Pencil, Check, X, Plus, Trash2, Loader2, Wallet } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function BudgetPanel({ transacoes = [], limites = {}, setLimites }) {
  const [historicoMetas, setHistoricoMetas] = useState({});
  const [carregandoMetas, setCarregandoMetas] = useState(true);
  const [userId, setUserId] = useState(null);

  // Estados de controle para Edição e Criação
  const [categoriaEmEdicao, setCategoriaEmEdicao] = useState(null);
  const [valorTemporario, setValorTemporario] = useState('');
  const [isCriando, setIsCriando] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novoLimite, setNovoLimite] = useState('');
  const [novoTipo, setNovoTipo] = useState('orcamento');

  const containerRef = useRef(null);
  const formRef = useRef(null);

  // 1. Obter o ID do usuário autenticado
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Buscar as configurações do banco
  const carregarDadosDasMetas = useCallback(async () => {
    if (!userId) return;
    try {
      setCarregandoMetas(true);

      const { data, error } = await supabase
        .from('metas')
        .select('categoria, limite, tipo')
        .eq('user_id', userId);

      if (error) throw error;

      const objetoMetas = {};
      if (data && data.length > 0) {
        data.forEach(item => {
          objetoMetas[item.categoria] = {
            limite: Number(item.limite),
            tipo: item.tipo || 'orcamento'
          };
        });
      }

      setLimites(objetoMetas);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      toast.error('Erro ao carregar dados da nuvem.');
    } finally {
      setCarregandoMetas(false);
    }
  }, [userId, setLimites]);

  // 3. Buscar histórico total para acumular as "Saídas" das Metas
  const carregarHistoricoGeral = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('transacoes')
        .select('categoria, valor, tipo')
        .eq('user_id', userId);

      if (error) throw error;

      const acumulado = {};
      if (data) {
        data.forEach(t => {
          const cat = t.categoria || 'Outros';
          if (!acumulado[cat]) acumulado[cat] = 0;
          
          if (t.tipo === 'Saída' || t.tipo?.toLowerCase() === 'saída') {
            acumulado[cat] += t.valor;
          }
        });
      }
      setHistoricoMetas(acumulado);
    } catch (error) {
      console.error('Erro ao calcular histórico:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      const timer = setTimeout(() => {
        carregarDadosDasMetas();
        carregarHistoricoGeral();
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [userId, carregarDadosDasMetas, carregarHistoricoGeral]);

  // 🌟 GSAP: Animação de entrada dos cards de metas
  useGSAP(() => {
    if (!carregandoMetas && Object.keys(limites).length > 0) {
      gsap.fromTo(
        '.budget-card',
        { opacity: 0, y: 20, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, { dependencies: [carregandoMetas, limites], scope: containerRef });

  // 🌟 GSAP: Animação na exibição do formulário de novo registro
  useGSAP(() => {
    if (isCriando && formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: -15, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.5)' }
      );
    }
  }, { dependencies: [isCriando] });

  // 4. Salvar/Atualizar uma meta ou orçamento existente
  const salvarLimite = async (categoria) => {
    const valorNumerico = parseFloat(valorTemporario);
    if (isNaN(valorNumerico) || valorNumerico < 0) {
      toast.error('Insira um valor numérico válido.');
      return;
    }

    try {
      const tipoExiste = limites[categoria]?.tipo || 'orcamento';

      const { error } = await supabase
        .from('metas')
        .upsert({ 
          user_id: userId, 
          categoria: categoria, 
          limite: valorNumerico,
          tipo: tipoExiste
        }, { onConflict: 'user_id,categoria' });

      if (error) throw error;

      setLimites(prev => ({
        ...prev,
        [categoria]: { ...prev[categoria], limite: valorNumerico }
      }));
      setCategoriaEmEdicao(null);
      toast.success('Valor atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar no banco.');
    }
  };

  // 5. Criar um novo item (Meta ou Orçamento)
  const lidarComCriacaoMeta = async (e) => {
    e.preventDefault();
    const categoriaFormatada = novaCategoria.trim();
    const limiteNumerico = parseFloat(novoLimite);

    if (!categoriaFormatada || isNaN(limiteNumerico) || limiteNumerico < 0) return;

    try {
      const { error } = await supabase
        .from('metas')
        .upsert({
          user_id: userId,
          categoria: categoriaFormatada,
          limite: limiteNumerico,
          tipo: novoTipo
        }, { onConflict: 'user_id,categoria' });

      if (error) throw error;

      setLimites(prev => ({
        ...prev,
        [categoriaFormatada]: { limite: limiteNumerico, tipo: novoTipo }
      }));

      setNovaCategoria('');
      setNovoLimite('');
      setIsCriando(false);
      carregarHistoricoGeral();
      toast.success('Adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar:', error);
      toast.error('Erro ao registrar.');
    }
  };

  // 6. Remover definitivamente 
  const removerMeta = async (categoria) => {
    try {
      const { error } = await supabase
        .from('metas')
        .delete()
        .eq('user_id', userId)
        .eq('categoria', categoria);

      if (error) throw error;

      setLimites(prev => {
        const copia = { ...prev };
        delete copia[categoria];
        return copia;
      });
      setCategoriaEmEdicao(null);
      toast.success('Removido permanentemente.');
    } catch (error) {
      console.error('Erro ao remover:', error);
      toast.error('Erro ao deletar do banco.');
    }
  };

  // Processamento do mês atual para os Orçamentos normais
  const despesasMesAtual = transacoes.filter(t => t.tipo === 'Saída' || t.tipo?.toLowerCase() === 'saída');
  const gastosMesPorCategoria = despesasMesAtual.reduce((acc, atual) => {
    const cat = atual.categoria || 'Outros';
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += atual.valor;
    return acc;
  }, {});

  if (carregandoMetas) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#161e18] border border-gray-200 dark:border-[#273C2C] flex flex-col items-center justify-center gap-2 text-xs font-medium text-gray-600 dark:text-[#D3C1D2]">
        <Loader2 className="w-5 h-5 animate-spin text-[#273C2C] dark:text-[#D3C1D2]" />
        Sincronizando metas e orçamentos com a nuvem...
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="p-5 rounded-3xl bg-white dark:bg-[#161e18] border border-gray-200 dark:border-[#273C2C] shadow-xs space-y-4 font-sans transition-colors duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#273C2C] dark:text-[#D3C1D2]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-[#D3C1D2]">
            Metas e Orçamentos
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsCriando(!isCriando)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs bg-[#273C2C] text-white dark:bg-[#D3C1D2] dark:text-[#273C2C]"
        >
          <Plus className="w-3.5 h-3.5" />
          {isCriando ? 'Fechar' : 'Novo Registro'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isCriando && (
          <form 
            ref={formRef}
            onSubmit={lidarComCriacaoMeta} 
            className="p-4 rounded-2xl bg-gray-50 dark:bg-[#273C2C]/40 border-2 border-dashed border-gray-300 dark:border-[#626868] flex flex-col space-y-3 col-span-1 md:col-span-2 backdrop-blur-xs"
          >
            <div className="text-[11px] font-bold uppercase tracking-wide text-gray-900 dark:text-[#FFE2FE]">
              Configurar Novo Item
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase block text-gray-600 dark:text-[#D3C1D2]">
                Tipo de Destinação
              </label>
              <select 
                value={novoTipo} 
                onChange={(e) => setNovoTipo(e.target.value)}
                className="w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#273C2C] dark:focus:border-[#D3C1D2] cursor-pointer bg-white dark:bg-[#161e18] border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE]"
              >
                <option value="orcamento">Orçamento Mensal (Limite que renova todo mês)</option>
                <option value="meta">Meta Cofrinho (Acumula histórico de Saídas independente do mês)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase block text-gray-600 dark:text-[#D3C1D2]">
                  Categoria / Nome
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Viagem, Aluguel" 
                  required 
                  value={novaCategoria} 
                  onChange={(e) => setNovaCategoria(e.target.value)} 
                  className="w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#273C2C] dark:focus:border-[#D3C1D2] bg-white dark:bg-[#161e18] border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE] placeholder:text-gray-400 dark:placeholder:text-[#939196]" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase block text-gray-600 dark:text-[#D3C1D2]">
                  Valor Alvo / Limite (R$)
                </label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  required 
                  min="0" 
                  step="any" 
                  value={novoLimite} 
                  onChange={(e) => setNovoLimite(e.target.value)} 
                  className="w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#273C2C] dark:focus:border-[#D3C1D2] bg-white dark:bg-[#161e18] border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE] placeholder:text-gray-400 dark:placeholder:text-[#939196]" 
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-1.5 pt-1">
              <button 
                type="button" 
                onClick={() => setIsCriando(false)} 
                className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-gray-200 dark:bg-[#273C2C] text-gray-700 dark:text-[#D3C1D2] hover:opacity-80 transition-opacity cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 rounded-xl text-[10px] font-bold bg-[#273C2C] text-white dark:bg-[#D3C1D2] dark:text-[#273C2C] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                Adicionar
              </button>
            </div>
          </form>
        )}

        {Object.keys(limites).map((categoria) => {
          const itemConfig = limites[categoria];
          const ehMeta = itemConfig.tipo === 'meta';
          
          const valorProgresso = ehMeta ? (historicoMetas[categoria] || 0) : (gastosMesPorCategoria[categoria] || 0);
          const limiteDefinido = itemConfig.limite;
          const isEditing = categoriaEmEdicao === categoria;
          
          const porcentagem = limiteDefinido > 0 ? Math.min(Math.round((valorProgresso / limiteDefinido) * 100), 100) : 0;
          const ehExcedido = !ehMeta && porcentagem >= 100;

          const cardBgClass = ehExcedido
            ? 'bg-rose-50 dark:bg-rose-950/25 border-rose-200 dark:border-rose-500/40'
            : 'bg-gray-50 dark:bg-[#273C2C]/35 border-gray-200 dark:border-[#273C2C]';

          const corBarra = ehMeta 
            ? 'bg-emerald-500 dark:bg-emerald-400' 
            : ehExcedido 
              ? 'bg-rose-500' 
              : 'bg-[#273C2C] dark:bg-[#D3C1D2]';

          const corTexto = ehMeta 
            ? 'text-emerald-600 dark:text-emerald-400' 
            : ehExcedido 
              ? 'text-rose-600 dark:text-rose-400' 
              : 'text-[#273C2C] dark:text-[#D3C1D2]';

          return (
            <div 
              key={categoria} 
              className={`budget-card p-4 rounded-2xl border flex flex-col justify-between space-y-2.5 group transition-all hover:border-gray-300 dark:hover:border-[#626868] ${cardBgClass}`}
            >
              <div className="flex justify-between items-start text-xs">
                <div className="flex flex-col space-y-0.5 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900 dark:text-[#FFE2FE]">{categoria}</span>
                    <span 
                      className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                        ehMeta
                          ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-[#34d399] border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-purple-50 dark:bg-[#D3C1D2]/15 text-purple-700 dark:text-[#D3C1D2] border-purple-200 dark:border-[#D3C1D2]/30'
                      }`}
                    >
                      {ehMeta ? 'Meta' : 'Orçamento'}
                    </span>
                  </div>
                  
                  {isEditing ? (
                    <div className="flex items-center gap-1 mt-1.5 w-full">
                      <span className="text-[10px] text-gray-500 dark:text-[#939196]">R$</span>
                      <input 
                        type="number" 
                        value={valorTemporario} 
                        onChange={(e) => setValorTemporario(e.target.value)} 
                        autoFocus 
                        className="w-20 border rounded-lg px-2 py-0.5 text-[11px] font-bold focus:outline-none bg-white dark:bg-[#161e18] border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE]" 
                      />
                      <button 
                        type="button"
                        onClick={() => salvarLimite(categoria)} 
                        className="p-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => removerMeta(categoria)} 
                        className="p-1 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors cursor-pointer" 
                        title="Remover permanentemente"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setCategoriaEmEdicao(null)} 
                        className="p-1 rounded-lg bg-gray-200 dark:bg-[#273C2C] text-gray-700 dark:text-[#D3C1D2] hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 dark:text-[#939196]">
                        Alvo: R$ {limiteDefinido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <button 
                        type="button"
                        onClick={() => { setCategoriaEmEdicao(categoria); setValorTemporario(limiteDefinido.toString()); }} 
                        className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-[#939196] hover:text-gray-700 dark:hover:text-[#D3C1D2] transition-all p-0.5 rounded-sm cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className={`font-bold block ${corTexto}`}>{porcentagem}%</span>
                  <span className="text-[10px] font-medium block text-gray-500 dark:text-[#939196]">
                    {ehMeta ? 'Acumulado: ' : 'Gasto no Mês: '} R$ {valorProgresso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Barra de Progresso Animada */}
              <div className="w-full h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-[#273C2C]">
                <div 
                  className={`h-full transition-all duration-700 ease-out ${corBarra}`} 
                  style={{ width: `${porcentagem}%` }} 
                />
              </div>

              <div className="flex items-center gap-1 text-[10px] font-semibold">
                {ehMeta ? (
                  porcentagem >= 100 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Objetivo alcançado! Excelente!
                    </span>
                  ) : (
                    <span className="text-gray-600 dark:text-[#D3C1D2] flex items-center gap-1">
                      <Wallet className="w-3 h-3" /> Guardando parcelas na Meta...
                    </span>
                  )
                ) : (
                  porcentagem >= 100 ? (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Limite máximo do mês atingido!
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Orçamento mensal controlado.
                    </span>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}