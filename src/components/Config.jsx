import { useState } from 'react';
import { User, Shield, Info, Code, FileText, Lock, Download, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { jsPDF } from 'jspdf';
import ExcelJS from 'exceljs';
import toast from 'react-hot-toast';

export default function Configuracoes({ session, onLogout }) {
  const [abaAtiva, setAbaAtiva] = useState('ajustes');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregandoSenha, setCarregandoSenha] = useState(false);
  const [formatoExport, setFormatoExport] = useState('excel');
  const [carregandoExport, setCarregandoExport] = useState(false);
  const [carregandoReset, setCarregandoReset] = useState(false);

  // Função auxiliar para formatar a data com segurança (DD/MM/AAAA)
  const formatarDataSegura = (dataInput) => {
    if (!dataInput) return '';
    const apenasData = dataInput.split('T')[0];
    const partes = apenasData.split('-');
    if (partes.length === 3) {
      const [ano, mes, dia] = partes;
      return `${dia}/${mes}/${ano}`;
    }
    return dataInput;
  };

  // 1. Alteração de Senha do Usuário
  const lidarComAlteracaoSenha = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas não coincidem!');
      return;
    }
    if (novaSenha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    try {
      setCarregandoSenha(true);
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;
      toast.success('Senha atualizada com sucesso!');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar senha: ' + error.message);
    } finally {
      setCarregandoSenha(false);
    }
  };

  // 2. Funções Internas de Geração de Arquivos

  // A. Cópia de Segurança em JSON
  const baixarJSON = (transacoes) => {
    const dadosJsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transacoes, null, 2));
    const link = document.createElement('a');
    link.setAttribute("href", dadosJsonStr);
    link.setAttribute("download", `financeplus_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // B. Planilha Excel Contábil Nativa (.xlsx)
  const baixarExcelContabil = async (transacoes) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Extrato Financeiro');

    // Ativa a exibição das linhas de grade nativas do Excel
    worksheet.views = [{ showGridLines: true }];

    // Configuração das colunas principais
    worksheet.columns = [
      { header: 'Data', key: 'data', width: 15 },
      { header: 'Descrição', key: 'descricao', width: 32 },
      { header: 'Categoria', key: 'categoria', width: 22 },
      { header: 'Tipo', key: 'tipo', width: 14 },
      { header: 'Valor Contábil', key: 'valor', width: 22 }
    ];

    // Estilo do cabeçalho principal (Azul Profissional)
    const linhaCabecalho = worksheet.getRow(1);
    linhaCabecalho.height = 26;
    linhaCabecalho.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    linhaCabecalho.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };
    linhaCabecalho.alignment = { vertical: 'middle', horizontal: 'left' };
    linhaCabecalho.getCell('valor').alignment = { vertical: 'middle', horizontal: 'right' };

    // Máscara contábil oficial (Padrão internacional para Real R$)
    const mascaraContabil = '_("R$"* #,##0.00_);[Red]_("R$"* (#,##0.00);_("R$"* "-"_);_(@_)';
    // Alimentação das linhas de dados
    transacoes.forEach((t) => {
      const tipoTratado = String(t.tipo || '').toLowerCase().trim();
      const ehReceita = tipoTratado === 'receita' || tipoTratado === 'entrada' || tipoTratado === 'ganho';

      let valorFinal = Number(t.valor) || 0;
      if (!ehReceita && valorFinal > 0) {
        valorFinal = -valorFinal; // Mantém a despesa negativa para o balanço contábil
      }

      const novaLinha = worksheet.addRow({
        data: formatarDataSegura(t.data),
        descricao: t.descricao || '-',
        categoria: t.categoria || '-',
        tipo: ehReceita ? 'Receita' : 'Despesa',
        valor: valorFinal
      });

      novaLinha.height = 20;
      novaLinha.alignment = { vertical: 'middle', horizontal: 'left' };

      const celulaValor = novaLinha.getCell('valor');
      celulaValor.numberFormat = mascaraContabil;
      celulaValor.alignment = { vertical: 'middle', horizontal: 'right' };

      const celulaTipo = novaLinha.getCell('tipo');
      if (ehReceita) {
        celulaTipo.font = { color: { argb: '10B981' }, bold: true, name: 'Segoe UI' };
      } else {
        celulaTipo.font = { color: { argb: 'EF4444' }, bold: true, name: 'Segoe UI' };
      }

      novaLinha.eachCell((cell) => {
        cell.border = { bottom: { style: 'thin', color: { argb: 'F3F4F6' } } };
      });
    });

    // ==========================================
    // NOVA MINI TABELA DE RESUMO (DASHBOARD)
    // ==========================================
    const totalRegistros = transacoes.length;
    const ultimaLinhaDados = totalRegistros + 1; // A linha 1 é o cabeçalho

    // 1. Indicador de Total de Entradas
    const linhaEntradas = worksheet.getRow(ultimaLinhaDados + 3); // Pula 2 linhas para dar espaçamento
    linhaEntradas.height = 20;
    linhaEntradas.getCell('categoria').value = 'Total Entradas (+):';
    linhaEntradas.getCell('categoria').font = { bold: true, name: 'Segoe UI', size: 10, color: { argb: '10B981' } };
    linhaEntradas.getCell('categoria').alignment = { horizontal: 'right', vertical: 'middle' };

    const celulaEntradas = linhaEntradas.getCell('valor');
    celulaEntradas.value = { formula: `SUMIF(D2:D${ultimaLinhaDados}, "Receita", E2:E${ultimaLinhaDados})` };
    celulaEntradas.font = { bold: true, name: 'Segoe UI', size: 10, color: { argb: '10B981' } };
    celulaEntradas.numberFormat = mascaraContabil;
    celulaEntradas.alignment = { horizontal: 'right', vertical: 'middle' };

    // 2. Indicador de Total de Saídas
    const linhaSaidas = worksheet.getRow(ultimaLinhaDados + 4);
    linhaSaidas.height = 20;
    linhaSaidas.getCell('categoria').value = 'Total Saídas (-):';
    linhaSaidas.getCell('categoria').font = { bold: true, name: 'Segoe UI', size: 10, color: { argb: 'EF4444' } };
    linhaSaidas.getCell('categoria').alignment = { horizontal: 'right', vertical: 'middle' };

    const celulaSaidas = linhaSaidas.getCell('valor');
    celulaSaidas.value = { formula: `SUMIF(D2:D${ultimaLinhaDados}, "Despesa", E2:E${ultimaLinhaDados})` };
    celulaSaidas.font = { bold: true, name: 'Segoe UI', size: 10, color: { argb: 'EF4444' } };
    celulaSaidas.numberFormat = mascaraContabil;
    celulaSaidas.alignment = { horizontal: 'right', vertical: 'middle' };

    // 3. Indicador de Saldo Líquido Final
    const linhaSaldoGeral = worksheet.getRow(ultimaLinhaDados + 5);
    linhaSaldoGeral.height = 24;
    linhaSaldoGeral.getCell('categoria').value = 'Saldo Líquido Final:';
    linhaSaldoGeral.getCell('categoria').font = { bold: true, name: 'Segoe UI', size: 11 };
    linhaSaldoGeral.getCell('categoria').alignment = { horizontal: 'right', vertical: 'middle' };

    const celulaSaldoGeral = linhaSaldoGeral.getCell('valor');
    celulaSaldoGeral.value = { formula: `SUM(E2:E${ultimaLinhaDados})` };
    celulaSaldoGeral.font = { bold: true, name: 'Segoe UI', size: 11 };
    celulaSaldoGeral.numberFormat = mascaraContabil;
    celulaSaldoGeral.alignment = { horizontal: 'right', vertical: 'middle' };

    // Aplicação da borda dupla contábil clássica apenas no Saldo Final
    celulaSaldoGeral.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'double', color: { argb: '000000' } }
    };

    // Execução do download do arquivo modificado
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financeplus_balanco_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // C. Documento Imprimível PDF
  const baixarPDF = (transacoes) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text("FinancePlus", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text("Relatório Geral de Transações Financeiras", 14, 26);
    doc.text(`Gerado em: ${formatarDataSegura(new Date().toISOString())}`, 14, 31);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 35, 196, 35);

    let y = 45;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("Data", 14, y);
    doc.text("Descrição", 40, y);
    doc.text("Categoria", 100, y);
    doc.text("Tipo", 150, y);
    doc.text("Valor", 175, y);

    doc.line(14, y + 2, 196, y + 2);
    y += 9;

    doc.setFont("helvetica", "normal");
    transacoes.forEach((t) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }

      const dataFormatada = formatarDataSegura(t.data);
      const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.valor);

      const tipoTratado = String(t.tipo || '').toLowerCase().trim();
      const ehReceita = tipoTratado === 'receita' || tipoTratado === 'entrada' || tipoTratado === 'ganho';
      const tipoFormatado = ehReceita ? 'Receita' : 'Despesa';

      if (ehReceita) {
        doc.setTextColor(16, 185, 129);
      } else {
        doc.setTextColor(239, 68, 68);
      }

      doc.text(dataFormatada, 14, y);
      doc.text(t.descricao || '-', 40, y);
      doc.text(t.categoria || '-', 100, y);
      doc.text(tipoFormatado, 150, y);
      doc.text(valorFormatado, 175, y);
      y += 7;
    });

    doc.save(`financeplus_relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // 3. Função Centralizadora de Execução (CORRIGIDA COM ASYNC)
  const exportarDadosFinanceiros = async () => {
    if (!session?.user?.id) return;
    try {
      setCarregandoExport(true);
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        toast.error('Não tens transações para exportar.');
        return;
      }

      if (formatoExport === 'json') {
        baixarJSON(data);
      } else if (formatoExport === 'excel') {
        await baixarExcelContabil(data);
      } else if (formatoExport === 'pdf') {
        baixarPDF(data);
      }

      toast.success(`Ficheiro descarregado com sucesso!`);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao exportar dados.');
    } finally {
      setCarregandoExport(false);
    }
  };

  // 4. Reset Completo do Histórico
  const resetarDadosConta = async () => {
    const confirmou = window.confirm(
      "ATENÇÃO: Tens a certeza absoluta de que desejas APAGAR permanentemente todas as tuas transações e metas? Esta ação não pode ser desfeita."
    );
    if (!confirmou) return;
    try {
      setCarregandoReset(true);
      const uid = session?.user?.id;
      const exclusaoTransacoes = supabase.from('transacoes').delete().eq('user_id', uid);
      const exclusaoMetas = supabase.from('metas').delete().eq('user_id', uid);
      const [resTransacoes, resMetas] = await Promise.all([exclusaoTransacoes, exclusaoMetas]);

      if (resTransacoes.error) throw resTransacoes.error;
      if (resMetas.error) throw resMetas.error;

      toast.success('Todos os teus dados financeiros foram limpos!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error(error);
      toast.error('Ocorreu um erro ao limpar os dados.');
    } finally {
      setCarregandoReset(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md transition-colors duration-200 border border-gray-100 dark:border-zinc-800">

      {/* Cabeçalho */}
      <div className="border-b border-gray-200 dark:border-zinc-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">Configurações do Sistema</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">Gerencie sua conta e conheça mais sobre o FinancePlus.</p>
      </div>

      {/* Navegação por Abas */}
      <div className="flex space-x-4 mb-6 border-b border-gray-100 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setAbaAtiva('ajustes')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${abaAtiva === 'ajustes'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
        >
          <User size={18} />
          Minha Conta
        </button>
        <button
          onClick={() => setAbaAtiva('sobre')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${abaAtiva === 'sobre'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
        >
          <Info size={18} />
          Sobre o Projeto
        </button>
      </div>

      <div className="space-y-6">
        {abaAtiva === 'ajustes' && (
          <div className="space-y-6">

            {/* Informações da Conta */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-800/40 rounded-xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Shield size={18} className="text-blue-500" />
                Segurança e Identificação
              </h3>
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-zinc-300">
                  <span className="font-semibold text-gray-400 dark:text-zinc-500">E-mail conectado:</span> {session?.user?.email || 'usuario@email.com'}
                </p>
                <p className="text-xs text-gray-600 dark:text-zinc-300">
                  <span className="font-semibold text-gray-400 dark:text-zinc-500">ID do Usuário:</span> <code className="bg-gray-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] font-mono">{session?.user?.id || 'id-exemplo'}</code>
                </p>
              </div>
            </div>

            {/* Painel de Alteração de Senha */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-800/40 rounded-xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Lock size={18} className="text-blue-500" />
                Alterar Senha de Acesso
              </h3>
              <form onSubmit={lidarComAlteracaoSenha} className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                <div className="flex flex-col space-y-1">
                  <input
                    type="password"
                    placeholder="Nova senha (mín. 6 dígitos)"
                    required
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <input
                    type="password"
                    placeholder="Confirme a nova senha"
                    required
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-start">
                  <button
                    type="submit"
                    disabled={carregandoSenha}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={carregandoSenha ? "animate-spin" : ""} />
                    {carregandoSenha ? 'Atualizando...' : 'Atualizar Senha'}
                  </button>
                </div>
              </form>
            </div>

            {/* Configuração de Portabilidade */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-800/40 rounded-xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Download size={18} className="text-blue-500" />
                Portabilidade de Dados
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
                Selecione o formato desejado e faça o download de todas as suas transações para o seu dispositivo local.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <select
                  value={formatoExport}
                  onChange={(e) => setFormatoExport(e.target.value)}
                  className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="excel">Planilha Formatada Contábil (.xlsx)</option>
                  <option value="pdf">Documento Imprimível (.pdf)</option>
                  <option value="json">Cópia de Segurança (.json)</option>
                </select>

                <button
                  onClick={exportarDadosFinanceiros}
                  disabled={carregandoExport}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download size={14} />
                  {carregandoExport ? 'Exportando...' : 'Exportar Dados'}
                </button>
              </div>
            </div>

            {/* Zona de Risco e Desconexão */}
            <div className="p-4 border border-red-100 dark:border-red-900/30 rounded-xl bg-red-50/30 dark:bg-red-950/10 space-y-3">
              <h3 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Zona de Perigo</h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-red-100/50 dark:border-red-900/20 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-zinc-200">Resetar Dados Financeiros</h4>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">Apaga permanentemente o histórico de lançamentos e metas sem excluir o perfil de acesso.</p>
                </div>
                <button
                  onClick={resetarDadosConta}
                  disabled={carregandoReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Trash2 size={14} />
                  Limpar Histórico
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-zinc-200">Desconexão Protegida</h4>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">Encerra de forma segura a sua sessão activa neste dispositivo.</p>
                </div>
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Desconectar da Conta
                </button>
              </div>
            </div>

          </div>
        )}

        {abaAtiva === 'sobre' && (
          <div className="space-y-6 text-gray-600 dark:text-zinc-300">
            <div className="text-center py-4">
              <h2 className="text-3xl font-black text-blue-600 dark:text-blue-400">FinancePlus</h2>
              <p className="text-sm font-semibold text-gray-400 mt-1">Versão 1.5.0</p>
              <p className="mt-4 max-w-xl mx-auto text-sm leading-relaxed">
                Uma aplicação moderna de controle financeiro desenvolvida para oferecer autonomia, clareza visual e inteligência na gestão de receitas e despesas.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-zinc-800/40 rounded-xl border border-gray-100 dark:border-zinc-800">
                <h4 className="font-semibold text-gray-800 dark:text-zinc-100 mb-2 flex items-center gap-2">
                  <Code size={16} className="text-blue-500" />
                  Tecnologias Utilizadas
                </h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-500 dark:text-zinc-400">
                  <li>React & Vite</li>
                  <li>Tailwind CSS</li>
                  <li>Supabase (Banco de dados & Autenticação)</li>
                  <li>ExcelJS (Planilhas nativas inteligentes)</li>
                  <li>jsPDF (Geração de relatórios PDF)</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-zinc-800/40 rounded-xl border border-gray-100 dark:border-zinc-800">
                <h4 className="font-semibold text-gray-800 dark:text-zinc-100 mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" />
                  Licenciamento
                </h4>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Este projeto está protegido legalmente sob a **Licença MIT**. O software é de código aberto para uso comercial, modificação e distribuição.
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 text-center text-xs text-gray-400">
              Desenvolvido por daviniccacio &copy; 2026
            </div>
          </div>
        )}
      </div>
    </div>
  );
}