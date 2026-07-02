import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast, { Toaster } from 'react-hot-toast'; 
import { LogOut, Wallet } from 'lucide-react';

// IMPORTAÇÃO DOS COMPONENTES REFATORADOS
import CompetenceBar from './components/CompetenceBar';
import SummaryCards from './components/SummaryCards';
import FilterCenter from './components/FilterCenter';
import TransactionTable from './components/TransactionTable';
import TransactionModal from './components/TransactionModal';
import DeleteModal from './components/DeleteModal';

export default function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoId, setEditandoId] = useState(null); 
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [idExclusaoConfirmar, setIdExclusaoConfirmar] = useState(null); 

  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState(''); 
  const [filtroStatus, setFiltroStatus] = useState('');      
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  const [filtroCompetencia, setFiltroCompetencia] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });

  const [descricao, setDescricao] = useState('');
  const [valorMascara, setValorMascara] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipo, setTipo] = useState('Saída');
  const [status, setStatus] = useState('Pago');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [dataVencimento, setDataVencimento] = useState('');
  const [dadosPagamento, setDadosPagamento] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) buscarTransacoes(); }, [session]);

  async function buscarTransacoes() {
    try {
      setCarregando(true);
      const { data: dados, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', session.user.id) 
        .order('data', { ascending: false });
      if (error) throw error;
      setTransacoes(dados || []);
    } catch (error) {
      toast.error('Erro ao buscar dados do banco.');
    } finally {
      setCarregando(false);
    }
  }

  async function lidarComLogin(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error('E-mail ou senha incorretos.');
    else toast.success('Bem-vindo de volta!');
  }

  async function lidarComLogout() {
    await supabase.auth.signOut();
    setTransacoes([]);
    toast.success('Sessão encerrada.');
  }

  async function salvarLancamento(e) {
    e.preventDefault();
    const valorFloat = Number(valorMascara.replace(/\D/g, '')) / 100;

    if (!descricao || valorFloat <= 0 || !categoria) {
      toast.error('Por favor, preencha os campos obrigatórios.');
      return;
    }

    const dadosLancamento = { 
      data, descricao, categoria: categoria.trim(), valor: valorFloat, tipo, status,
      data_vencimento: dataVencimento || null, dados_pagamento: dadosPagamento || null, user_id: session.user.id 
    };

    const { error } = editandoId 
      ? await supabase.from('transacoes').update(dadosLancamento).eq('id', editandoId)
      : await supabase.from('transacoes').insert([dadosLancamento]);

    if (error) {
      toast.error(`Erro ao salvar: ${error.message}`);
    } else {
      toast.success(editandoId ? 'Lançamento atualizado!' : 'Lançamento cadastrado!');
      limparFormulario();
      buscarTransacoes();
    }
  }

  async function ejecutarExclusao() {
    if (!idExclusaoConfirmar) return;
    try {
      const { error } = await supabase.from('transacoes').delete().eq('id', idExclusaoConfirmar);
      if (error) throw error;
      toast.success('Lançamento removido.');
      if (editandoId === idExclusaoConfirmar) limparFormulario();
      buscarTransacoes();
    } catch (error) {
      toast.error('Erro ao excluir registro.');
    } finally {
      setIdExclusaoConfirmar(null); 
    }
  }

  function prepararEdicao(t) {
    setEditandoId(t.id);
    setData(t.data);
    setDescricao(t.descricao);
    setValorMascara(t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    setCategoria(t.categoria);
    setTipo(t.tipo);
    setStatus(t.status);
    setDataVencimento(t.data_vencimento || '');
    setDadosPagamento(t.dados_pagamento || '');
    setIsModalAberto(true);
  }

  function limparFormulario() {
    setEditandoId(null); setDescricao(''); setValorMascara(''); setCategoria('');
    setData(new Date().toISOString().split('T')[0]); setTipo('Saída'); setStatus('Pago');
    setDataVencimento(''); setDadosPagamento(''); setIsModalAberto(false);
  }

  const categoriasUnicas = [...new Set(transacoes.map(t => t.categoria))].filter(Boolean);

  const transacoesFiltradas = transacoes.filter(t => {
    const bateTexto = t.descricao.toLowerCase().includes(buscaTexto.toLowerCase()) || t.categoria.toLowerCase().includes(buscaTexto.toLowerCase());
    const bateCompetencia = !filtroCompetencia || t.data.substring(0, 7) === filtroCompetencia;
    const bateCategoria = !filtroCategoria || t.categoria.toLowerCase() === filtroCategoria.toLowerCase();
    const bateStatus = !filtroStatus || t.status === filtroStatus;
    return bateTexto && bateCompetencia && bateCategoria && bateStatus;
  });

  const totalPaginas = Math.ceil(transacoesFiltradas.length / itensPorPagina) || 1;
  const transacoesPaginadas = transacoesFiltradas.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  const totalEntradas = transacoesFiltradas.filter(t => t.tipo === 'Entrada').reduce((acc, curr) => acc + curr.valor, 0);
  const totalSaidas = transacoesFiltradas.filter(t => t.tipo === 'Saída').reduce((acc, curr) => acc + curr.valor, 0);
  const saldoAtual = totalEntradas - totalSaidas;

  function exportarPDF() {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold").setFontSize(20).text("Relatório Financeiro", 14, 22);
    autoTable(doc, {
      head: [["Data Lanc.", "Vencimento", "Descrição", "Categoria", "Valor", "Status"]],
      body: transacoesFiltradas.map(t => [
        new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR'),
        t.data_vencimento ? new Date(t.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR') : '-',
        t.descricao, t.categoria, `${t.tipo === 'Entrada' ? '+ ' : '- '}R$ ${t.valor.toFixed(2)}`, t.status
      ]),
      startY: 35,
      theme: 'striped'
    });
    doc.save("relatorio.pdf");
    toast.success('PDF exportado!');
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center p-4">
        <Toaster position="bottom-right" />
        <div className="bg-white p-6 rounded-2xl shadow-sm w-full max-w-sm border space-y-4">
          <div className="flex flex-col items-center gap-2 pb-2 border-b">
            <Wallet className="w-6 h-6 text-blue-500" />
            <h1 className="text-base font-bold">Gestor Financeiro</h1>
          </div>
          <form onSubmit={lidarComLogin} className="space-y-3">
            <input type="email" placeholder="E-mail" required className="w-full bg-neutral-50 border rounded-xl px-3 py-2 text-xs" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Senha" required className="w-full bg-neutral-50 border rounded-xl px-3 py-2 text-xs" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-2 rounded-xl text-xs hover:bg-blue-600">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] pb-8">
      <Toaster position="bottom-right" />
      <header className="bg-white/80 backdrop-blur-md border-b border-b-gray-100 shadow-gray-400 sticky top-0 z-40 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><Wallet className="w-5 h-5 text-blue-500" /><h1 className="text-sm font-bold">Gestor Financeiro</h1></div>
          <button onClick={lidarComLogout} className="flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold px-2.5 py-1.5 rounded-xl">Sair</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        <CompetenceBar filtroCompetencia={filtroCompetencia} setFiltroCompetencia={setFiltroCompetencia} setPaginaAtual={setPaginaAtual} />
        <SummaryCards totalEntradas={totalEntradas} totalSaidas={totalSaidas} saldoAtual={saldoAtual} />
        <FilterCenter buscaTexto={buscaTexto} setBuscaTexto={setBuscaTexto} filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria} filtroStatus={filtroStatus} setFiltroStatus={setFiltroStatus} categoriasUnicas={categoriasUnicas} setPaginaAtual={setPaginaAtual} />
        <TransactionTable transacoesPaginadas={transacoesPaginadas} totalPaginas={totalPaginas} paginaAtual={paginaAtual} setPaginaAtual={setPaginaAtual} setIsModalAberto={setIsModalAberto} exportarPDF={exportarPDF} prepararEdicao={prepararEdicao} setIdExclusaoConfirmar={setIdExclusaoConfirmar} />

        {isModalAberto && (
          <TransactionModal editandoId={editandoId} limparFormulario={limparFormulario} salvarLancamento={salvarLancamento} data={data} setData={setData} dataVencimento={dataVencimento} setDataVencimento={setDataVencimento} descricao={descricao} setDescricao={setDescricao} dadosPagamento={dadosPagamento} setDadosPagamento={setDadosPagamento} valorMascara={valorMascara} setValorMascara={setValorMascara} categoria={categoria} setCategoria={setCategoria} tipo={tipo} setTipo={setTipo} status={status} setStatus={setStatus} />
        )}

        {idExclusaoConfirmar && (
          <DeleteModal setIdExclusaoConfirmar={setIdExclusaoConfirmar} ejecutarExclusao={ejecutarExclusao} />
        )}
      </main>
    </div>
  );
}