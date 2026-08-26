// src/App.jsx
import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast, { Toaster } from 'react-hot-toast';
import { Plus } from 'lucide-react';

import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import LoginScreen from './components/LoginScreen';

import CompetenceBar from './components/CompetenceBar';
import ChatIA from './components/chatIA';
import FilterCenter from './components/FilterCenter';
import TransactionTable from './components/TransactionTable';
import TransactionModal from './components/TransactionModal';
import DeleteModal from './components/DeleteModal';
import AuthRecovery from './components/AuthRecovery';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import Configuracoes from './components/Config';

export default function App() {
  const { session, viewAuth, setViewAuth, login, cadastro, recuperarSenha, definirNovaSenha, logout } = useAuth();

  // Utilizando o nosso Hook de Transações
  const {
    transacoes,
    carregando,
    buscarTransacoes,
    salvarLancamento: salvarLancamentoHook,
    excluirTransacao
  } = useTransactions(session);

  const [limites, setLimites] = useState({});
  const [abaAtiva, setAbaAtiva] = useState('dashboard');

  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('theme') === 'dark';
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  // Carrega as transações assim que a sessão estiver ativa
  useEffect(() => {
    const inicializarDados = async () => {
      if (session?.user?.id) {
        await buscarTransacoes();
      }
    };
    inicializarDados();
  }, [session, buscarTransacoes]);

  // Estados dos Filtros
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [filtroCompetencia, setFiltroCompetencia] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filtroPeriodo, setFiltroPeriodo] = useState('mensal');

  // Estados do Modal de Lançamento
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [idExclusaoConfirmar, setIdExclusaoConfirmar] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [valorMascara, setValorMascara] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipo, setTipo] = useState('Saída');
  const [status, setStatus] = useState('Pago');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [dataVencimento, setDataVencimento] = useState('');
  const [dadosPagamento, setDadosPagamento] = useState('');
  const [repetir, setRepetir] = useState(false);
  const [tipoRepeticao, setTipoRepeticao] = useState('fixo');
  const [numeroParcelas, setNumeroParcelas] = useState(2);
  const [grupoId, setGrupoId] = useState(null);

  function limparFormulario() {
    setEditandoId(null);
    setGrupoId(null);
    setDescricao('');
    setValorMascara('');
    setCategoria('');
    setData(new Date().toISOString().split('T')[0]);
    setTipo('Saída');
    setStatus('Pago');
    setDataVencimento('');
    setDadosPagamento('');
    setIsModalAberto(false);
    setRepetir(false);
    setTipoRepeticao('fixo');
    setNumeroParcelas(2);
  }

  // Função intermediária para chamar o salvamento do Hook passando os dados do estado do componente
  async function salvarLancamento(e) {
    e.preventDefault();
    await salvarLancamentoHook({
      editandoId,
      grupoId,
      descricao,
      valorMascara,
      categoria,
      tipo,
      status,
      data,
      dataVencimento,
      dadosPagamento,
      repetir,
      tipoRepeticao,
      numeroParcelas
    }, limparFormulario);
  }

  async function ejecutarExclusao(apagarEmLote) {
    if (!idExclusaoConfirmar) return;
    // Encontra o item atual para pegar o grupo_id dele se necessário
    const itemSelecionado = transacoes.find(t => t.id === idExclusaoConfirmar);
    const grupoIdAlvo = itemSelecionado?.grupo_id || null;

    await excluirTransacao(idExclusaoConfirmar, apagarEmLote, grupoIdAlvo, editandoId, limparFormulario);
    setIdExclusaoConfirmar(null);
  }

  function prepararEdicao(t) {
    setEditandoId(t.id);
    setGrupoId(t.grupo_id || null);
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

  const categoriasUnicas = [...new Set(transacoes.map(t => t.categoria))].filter(Boolean);

  const transacoesFiltradas = transacoes.filter((t) => {
    if (filtroPeriodo === 'mensal' && filtroCompetencia) {
      const [anoFiltro, mesFiltro] = filtroCompetencia.split('-');
      const dataTransacao = new Date(t.data);
      if (dataTransacao.getUTCFullYear() !== Number(anoFiltro) || (dataTransacao.getUTCMonth() + 1) !== Number(mesFiltro)) return false;
    } else if (filtroPeriodo === '3meses') {
      const dataTransacao = new Date(t.data);
      const hoje = new Date();
      const tresMesesAtras = new Date();
      tresMesesAtras.setMonth(hoje.getMonth() - 3);
      if (dataTransacao < tresMesesAtras || dataTransacao > hoje) return false;
    } else if (filtroPeriodo === 'ano') {
      if (new Date(t.data).getUTCFullYear() !== new Date().getFullYear()) return false;
    }
    if (filtroCategoria && t.categoria !== filtroCategoria) return false;

    const texto = buscaTexto ? buscaTexto.toLowerCase() : '';
    const bateTexto = !texto || (t.descricao?.toLowerCase().includes(texto)) || (t.categoria?.toLowerCase().includes(texto));
    const bateStatus = !filtroStatus || t.status === filtroStatus;
    return bateTexto && bateStatus;
  });

  const totalPaginas = Math.ceil(transacoesFiltradas.length / itensPorPagina) || 1;
  const transacoesPaginadas = transacoesFiltradas.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);
  const totalEntradas = transacoesFiltradas.filter(t => t.tipo === 'Entrada').reduce((acc, curr) => acc + curr.valor, 0);
  const totalSaidas = transacoesFiltradas.filter(t => t.tipo === 'Saída').reduce((acc, curr) => acc + curr.valor, 0);
  const saldoAtual = totalEntradas - totalSaidas;

  function exportarPDF() {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const azulInstitucional = [37, 99, 235];
    const competenceFormatada = filtroCompetencia ? filtroCompetencia.split('-').reverse().join('/') : 'Geral';

    doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.textColor = azulInstitucional[0], azulInstitucional[1], azulInstitucional[2];
    doc.text("GESTOR FINANCEIRO", 14, 20);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.textColor = 100, 116, 139;
    doc.text(`Relatório de Movimentação Mensal - Período: ${competenceFormatada}`, 14, 26);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 150, 26);

    doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.5); doc.line(14, 30, 196, 30);
    doc.setFillColor(248, 250, 252); doc.roundedRect(14, 35, 182, 22, 3, 3, "F");

    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.textColor = 148, 163, 184;
    doc.text("TOTAL ENTRADAS", 22, 41); doc.text("TOTAL SAÍDAS", 82, 41); doc.text("SALDO DO PERÍODO", 142, 41);

    doc.setFontSize(12); doc.textColor = 22, 163, 74; doc.text(`R$ ${totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 22, 50);
    doc.textColor = 220, 38, 38; doc.text(`R$ ${totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 82, 50);
    doc.textColor = saldoAtual >= 0 ? 37 : 234, saldoAtual >= 0 ? 99 : 88, saldoAtual >= 0 ? 235 : 12;
    doc.text(`R$ ${saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 142, 50);

    const canalLinhas = transacoesFiltradas.map(t => [
      new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR'),
      t.data_vencimento ? new Date(t.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR') : '-',
      t.descricao, t.categoria, `${t.tipo === 'Entrada' ? '+ ' : '- '}R$ ${t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, t.status
    ]);

    autoTable(doc, {
      startY: 64, head: [["Data Lanc.", "Vencimento", "Descrição", "Categoria", "Valor", "Status"]], body: canalLinhas,
      margin: { left: 14, right: 14 }, theme: 'striped',
      headStyles: { fillColor: azulInstitucional, textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold', halign: 'left' },
      bodyStyles: { fontSize: 8.5, textColor: [51, 65, 85] }, alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 4) {
          const textoValor = data.cell.raw || '';
          data.cell.styles.textColor = textoValor.startsWith('+') ? [22, 163, 74] : [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    doc.save(`Relatorio_Financeiro_${filtroCompetencia || 'Geral'}.pdf`);
    toast.success('PDF exportado com sucesso!');
  }

  if (viewAuth === 'definir') {
    return (
      <>
        <Toaster position="bottom-right" />
        <AuthRecovery modo="definir" aoVoltar={async () => { await logout(); setViewAuth('login'); }} aoSubmeter={(dados, setCarregando) => definirNovaSenha(dados, session?.user?.email, setCarregando)} />
      </>
    );
  }

  if (!session) {
    return (
      <LoginScreen
        viewAuth={viewAuth}
        setViewAuth={setViewAuth}
        lidarComLogin={login}
        lidarComCadastro={cadastro}
        lidarComSolicitacaoEmail={recuperarSenha}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex items-start transition-colors duration-200">
      <Toaster position="bottom-right" />
      <Sidebar abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} lidarComLogout={logout} dark={dark} setDark={setDark} />

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center min-h-12">
          <div>
            {abaAtiva === 'dashboard' && (
              <><h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Painel de Controle</h2><p className="text-xs text-gray-400 dark:text-zinc-400 font-medium">Análise visual e estatística consolidada.</p></>
            )}
            {abaAtiva === 'lancamentos' && (
              <><h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Lançamentos</h2><p className="text-xs text-gray-400 dark:text-zinc-400 font-medium">Histórico detalhado das transações.</p></>
            )}
            {abaAtiva === 'configuracoes' && (
              <><h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Ajustes</h2><p className="text-xs text-gray-400 dark:text-zinc-400 font-medium">Gerencie preferências e segurança.</p></>
            )}
          </div>
          {abaAtiva === 'lancamentos' && (
            <button onClick={() => setIsModalAberto(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer">
              <Plus className="w-4 h-4" /> Novo Lançamento
            </button>
          )}
        </div>

        {abaAtiva === 'dashboard' && (
          <>
            <CompetenceBar filtroCompetencia={filtroCompetencia} setFiltroCompetencia={setFiltroCompetencia} filtroPeriodo={filtroPeriodo} setFiltroPeriodo={setFiltroPeriodo} filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria} setPaginaAtual={setPaginaAtual} />
            <DashboardView totalEntradas={totalEntradas} totalSaidas={totalSaidas} saldoAtual={saldoAtual} transacoesFiltradas={transacoesFiltradas} limites={limites} setLimites={setLimites} />
          </>
        )}

        {abaAtiva === 'lancamentos' && (
          <>
            <CompetenceBar filtroCompetencia={filtroCompetencia} setFiltroCompetencia={setFiltroCompetencia} filtroPeriodo={filtroPeriodo} setFiltroPeriodo={setFiltroPeriodo} filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria} setPaginaAtual={setPaginaAtual} />
            <FilterCenter buscaTexto={buscaTexto} setBuscaTexto={setBuscaTexto} filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria} filtroStatus={filtroStatus} setFiltroStatus={setFiltroStatus} categoriasUnicas={categoriasUnicas} setPaginaAtual={setPaginaAtual} />
            <TransactionTable carregando={carregando} transacoesPaginadas={transacoesPaginadas} totalPaginas={totalPaginas} paginaAtual={paginaAtual} setPaginaAtual={setPaginaAtual} setIsModalAberto={setIsModalAberto} exportarPDF={exportarPDF} prepararEdicao={prepararEdicao} setIdExclusaoConfirmar={setIdExclusaoConfirmar} />
          </>
        )}

        {abaAtiva === 'configuracoes' && <Configuracoes session={session} onLogout={logout} />}
      </main>

      {isModalAberto && (
        <TransactionModal editandoId={editandoId} limparFormulario={limparFormulario} salvarLancamento={salvarLancamento} data={data} setData={setData} dataVencimento={dataVencimento} setDataVencimento={setDataVencimento} descricao={descricao} setDescricao={setDescricao} dadosPagamento={dadosPagamento} setDadosPagamento={setDadosPagamento} valorMascara={valorMascara} setValorMascara={setValorMascara} category={categoria} setCategoria={setCategoria} tipo={tipo} setTipo={setTipo} status={status} setStatus={setStatus} repetir={repetir} setRepetir={setRepetir} tipoRepeticao={tipoRepeticao} setTipoRepeticao={setTipoRepeticao} numeroParcelas={numeroParcelas} setNumeroParcelas={setNumeroParcelas} />
      )}
      {idExclusaoConfirmar && (
        <DeleteModal
          grupoId={transacoes.find(t => t.id === idExclusaoConfirmar)?.grupo_id}
          setIdExclusaoConfirmar={setIdExclusaoConfirmar}
          ejecutarExclusao={ejecutarExclusao}
        />
      )}
      <ChatIA transacoes={transacoesFiltradas} saldoAtual={saldoAtual} />
    </div>
  );
}