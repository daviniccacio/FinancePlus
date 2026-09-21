// src/components/Config.jsx
import { useState } from 'react';
import { User, Shield, Info, Code, FileText, Lock, Download, Trash2, RefreshCw, Upload, Bell, DollarSign } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { jsPDF } from 'jspdf';
import ExcelJS from 'exceljs';
import toast from 'react-hot-toast';

export default function Configuracoes({ session, onLogout }) {
  const [abaAtiva, setAbaAtiva] = useState('ajustes');
  
  // Estados de Perfil
  const [nomeUsuario, setNomeUsuario] = useState(session?.user?.user_metadata?.full_name || '');
  const [prevSessionName, setPrevSessionName] = useState(session?.user?.user_metadata?.full_name);
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);

  // Sincronização do nome do utilizador com os metadados da sessão
  const currentSessionName = session?.user?.user_metadata?.full_name;
  if (currentSessionName !== prevSessionName) {
    setPrevSessionName(currentSessionName);
    setNomeUsuario(currentSessionName || '');
  }

  // Estados de Senha
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregandoSenha, setCarregandoSenha] = useState(false);

  // Estados de Exportação / Importação / Reset
  const [formatoExport, setFormatoExport] = useState('excel');
  const [carregandoExport, setCarregandoExport] = useState(false);
  const [carregandoImport, setCarregandoImport] = useState(false);
  const [carregandoReset, setCarregandoReset] = useState(false);

  // Estados de Preferências
  const [moedaPadrao, setMoedaPadrao] = useState('BRL');
  const [notificarVencimentos, setNotificarVencimentos] = useState(true);

  // Auxiliar para formatação de data
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

  // 1. Atualizar Nome do Utilizador no Supabase
  const lidarComAtualizacaoPerfil = async (e) => {
    e.preventDefault();
    try {
      setCarregandoPerfil(true);
      const { error } = await supabase.auth.updateUser({
        data: { full_name: nomeUsuario }
      });
      if (error) throw error;
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setCarregandoPerfil(false);
    }
  };

  // 2. Alteração de Senha
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

  // 3. Funções de Exportação (JSON, Excel Contábil, PDF)
  const baixarJSON = (transacoes) => {
    const dadosJsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transacoes, null, 2));
    const link = document.createElement('a');
    link.setAttribute("href", dadosJsonStr);
    link.setAttribute("download", `financeplus_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const baixarExcelContabil = async (transacoes) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Extrato Financeiro');
    worksheet.views = [{ showGridLines: true }];

    worksheet.columns = [
      { header: 'Data', key: 'data', width: 15 },
      { header: 'Descrição', key: 'descricao', width: 32 },
      { header: 'Categoria', key: 'categoria', width: 22 },
      { header: 'Tipo', key: 'tipo', width: 14 },
      { header: 'Valor Contábil', key: 'valor', width: 22 }
    ];

    const linhaCabecalho = worksheet.getRow(1);
    linhaCabecalho.height = 26;
    linhaCabecalho.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    linhaCabecalho.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '273C2C' } };
    linhaCabecalho.alignment = { vertical: 'middle', horizontal: 'left' };
    linhaCabecalho.getCell('valor').alignment = { vertical: 'middle', horizontal: 'right' };

    const mascaraContabil = '_("R$"* #,##0.00_);[Red]_("R$"* (#,##0.00);_("R$"* "-"_);_(@_)';
    
    transacoes.forEach((t) => {
      const tipoTratado = String(t.tipo || '').toLowerCase().trim();
      const ehReceita = tipoTratado === 'receita' || tipoTratado === 'entrada' || tipoTratado === 'ganho';

      let valorFinal = Number(t.valor) || 0;
      if (!ehReceita && valorFinal > 0) {
        valorFinal = -valorFinal;
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
      celulaTipo.font = { color: { argb: ehReceita ? '10B981' : 'EF4444' }, bold: true, name: 'Segoe UI' };

      novaLinha.eachCell((cell) => {
        cell.border = { bottom: { style: 'thin', color: { argb: 'F3F4F6' } } };
      });
    });

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

  const baixarPDF = (transacoes) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(39, 60, 44);
    doc.text("FinancePlus", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(98, 104, 104);
    doc.setFont("helvetica", "normal");
    doc.text("Relatório Geral de Transações Financeiras", 14, 26);
    doc.text(`Gerado em: ${formatarDataSegura(new Date().toISOString())}`, 14, 31);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 35, 196, 35);

    let y = 45;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(39, 60, 44);
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
      const ehReceita = t.tipo === 'Entrada';

      doc.setTextColor(ehReceita ? 16 : 239, ehReceita ? 185 : 68, ehReceita ? 129 : 68);

      doc.text(dataFormatada, 14, y);
      doc.text(t.descricao || '-', 40, y);
      doc.text(t.categoria || '-', 100, y);
      doc.text(ehReceita ? 'Receita' : 'Despesa', 150, y);
      doc.text(valorFormatado, 175, y);
      y += 7;
    });

    doc.save(`financeplus_relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
  };

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

      if (formatoExport === 'json') baixarJSON(data);
      else if (formatoExport === 'excel') await baixarExcelContabil(data);
      else if (formatoExport === 'pdf') baixarPDF(data);

      toast.success(`Exportação concluída com sucesso!`);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao exportar dados.');
    } finally {
      setCarregandoExport(false);
    }
  };

  // 4. Importar Backup JSON
  const importarBackupJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evento) => {
      try {
        setCarregandoImport(true);
        const transacoesImportadas = JSON.parse(evento.target.result);

        if (!Array.isArray(transacoesImportadas)) {
          toast.error('O ficheiro selecionado não tem um formato JSON válido.');
          return;
        }

        const dadosFormatados = transacoesImportadas.map(t => ({
          user_id: session.user.id,
          descricao: t.descricao,
          valor: t.valor,
          categoria: t.categoria,
          tipo: t.tipo,
          status: t.status || 'Pago',
          data: t.data,
          data_vencimento: t.data_vencimento || null,
          dados_pagamento: t.dados_pagamento || null
        }));

        const { error } = await supabase.from('transacoes').insert(dadosFormatados);
        if (error) throw error;

        toast.success(`${dadosFormatados.length} lançamentos importados com sucesso!`);
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        console.error(error);
        toast.error('Erro ao ler e importar o ficheiro de backup.');
      } finally {
        setCarregandoImport(false);
      }
    };
    reader.readAsText(file);
  };

  // 5. Resetar Histórico
  const resetarDadosConta = async () => {
    const confirmou = window.confirm(
      "ATENÇÃO: Tens a certeza absoluta de que desejas APAGAR permanentemente todas as tuas transações? Esta ação não pode ser desfeita."
    );
    if (!confirmou) return;
    try {
      setCarregandoReset(true);
      const uid = session?.user?.id;
      const { error } = await supabase.from('transacoes').delete().eq('user_id', uid);
      if (error) throw error;

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
    <div className="max-w-4xl mx-auto p-6 rounded-3xl border shadow-md transition-colors duration-200 bg-white dark:bg-[#161e18] border-gray-200 dark:border-[#273C2C] text-gray-900 dark:text-[#FFE2FE] font-sans">

      {/* Cabeçalho */}
      <div className="border-b pb-4 mb-6 border-gray-200 dark:border-[#273C2C]">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#FFE2FE]">Configurações do Sistema</h1>
        <p className="text-xs font-medium text-gray-500 dark:text-[#D3C1D2] mt-0.5">Gerencie sua conta, preferências e dados locais do FinancePlus.</p>
      </div>

      {/* Navegação por Abas */}
      <div className="flex space-x-2 md:space-x-3 mb-6 border-b pb-2 border-gray-200 dark:border-[#273C2C]">
        <button
          type="button"
          onClick={() => setAbaAtiva('ajustes')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            abaAtiva === 'ajustes'
              ? 'bg-[#273C2C] text-white dark:bg-[#D3C1D2] dark:text-[#273C2C] shadow-xs'
              : 'text-gray-600 dark:text-[#939196] hover:text-gray-900 dark:hover:text-[#FFE2FE]'
          }`}
        >
          <User size={16} />
          Minha Conta
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva('preferencias')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            abaAtiva === 'preferencias'
              ? 'bg-[#273C2C] text-white dark:bg-[#D3C1D2] dark:text-[#273C2C] shadow-xs'
              : 'text-gray-600 dark:text-[#939196] hover:text-gray-900 dark:hover:text-[#FFE2FE]'
          }`}
        >
          <Bell size={16} />
          Preferências
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva('sobre')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            abaAtiva === 'sobre'
              ? 'bg-[#273C2C] text-white dark:bg-[#D3C1D2] dark:text-[#273C2C] shadow-xs'
              : 'text-gray-600 dark:text-[#939196] hover:text-gray-900 dark:hover:text-[#FFE2FE]'
          }`}
        >
          <Info size={16} />
          Sobre o Projeto
        </button>
      </div>

      <div className="space-y-6">
        
        {/* ABA 1: MINHA CONTA */}
        {abaAtiva === 'ajustes' && (
          <div className="space-y-6">

            {/* Informações Pessoais & Nome */}
            <div className="p-4 rounded-2xl border space-y-4 bg-gray-50 dark:bg-[#273C2C]/20 border-gray-200 dark:border-[#273C2C]">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-gray-700 dark:text-[#D3C1D2]">
                <Shield size={16} className="text-[#273C2C] dark:text-[#D3C1D2]" />
                Perfil do Utilizador
              </h3>

              <form onSubmit={lidarComAtualizacaoPerfil} className="flex flex-col sm:flex-row items-end gap-3 max-w-xl">
                <div className="w-full space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-[#D3C1D2]">Nome de Exibição</label>
                  <input
                    type="text"
                    placeholder="Seu Nome Completo"
                    value={nomeUsuario}
                    onChange={(e) => setNomeUsuario(e.target.value)}
                    className="w-full rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none transition-all bg-white dark:bg-[#161e18] border border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE] focus:border-[#273C2C] dark:focus:border-[#D3C1D2]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={carregandoPerfil}
                  className="px-4 py-2 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0 bg-[#273C2C] text-white dark:bg-[#D3C1D2] dark:text-[#273C2C]"
                >
                  {carregandoPerfil ? 'A guardar...' : 'Salvar Nome'}
                </button>
              </form>

              <div className="pt-2 border-t space-y-1 border-gray-200 dark:border-[#273C2C]">
                <p className="text-xs text-gray-600 dark:text-[#D3C1D2]">
                  <span className="font-semibold text-gray-500 dark:text-[#939196]">E-mail conectado:</span> {session?.user?.email}
                </p>
                <p className="text-xs text-gray-600 dark:text-[#D3C1D2]">
                  <span className="font-semibold text-gray-500 dark:text-[#939196]">ID de Segurança:</span> <code className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-gray-200 dark:bg-[#273C2C] text-gray-800 dark:text-[#FFE2FE]">{session?.user?.id}</code>
                </p>
              </div>
            </div>

            {/* Alteração de Senha */}
            <div className="p-4 rounded-2xl border bg-gray-50 dark:bg-[#273C2C]/20 border-gray-200 dark:border-[#273C2C]">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-gray-700 dark:text-[#D3C1D2]">
                <Lock size={16} className="text-[#273C2C] dark:text-[#D3C1D2]" />
                Alterar Senha de Acesso
              </h3>
              <form onSubmit={lidarComAlteracaoSenha} className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                <input
                  type="password"
                  placeholder="Nova senha (mín. 6 dígitos)"
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none transition-all bg-white dark:bg-[#161e18] border border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE] focus:border-[#273C2C] dark:focus:border-[#D3C1D2]"
                />
                <input
                  type="password"
                  placeholder="Confirme a nova senha"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none transition-all bg-white dark:bg-[#161e18] border border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE] focus:border-[#273C2C] dark:focus:border-[#D3C1D2]"
                />
                <div className="sm:col-span-2 flex justify-start pt-1">
                  <button
                    type="submit"
                    disabled={carregandoSenha}
                    className="flex items-center gap-1.5 px-4 py-2 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 bg-[#273C2C] text-white dark:bg-[#D3C1D2] dark:text-[#273C2C]"
                  >
                    <RefreshCw size={14} className={carregandoSenha ? "animate-spin" : ""} />
                    {carregandoSenha ? 'Atualizando...' : 'Atualizar Senha'}
                  </button>
                </div>
              </form>
            </div>

            {/* Portabilidade & Importação */}
            <div className="p-4 rounded-2xl border space-y-4 bg-gray-50 dark:bg-[#273C2C]/20 border-gray-200 dark:border-[#273C2C]">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-gray-700 dark:text-[#D3C1D2]">
                <Download size={16} className="text-[#273C2C] dark:text-[#D3C1D2]" />
                Portabilidade e Backup
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Exportar */}
                <div className="space-y-2 p-3.5 rounded-xl border bg-white dark:bg-[#161e18] border-gray-200 dark:border-[#273C2C]">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-[#FFE2FE]">Exportar Dados</h4>
                  <div className="flex flex-col gap-2">
                    <select
                      value={formatoExport}
                      onChange={(e) => setFormatoExport(e.target.value)}
                      className="rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none bg-gray-50 dark:bg-[#273C2C]/30 border border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE]"
                    >
                      <option value="excel">Planilha Contábil (.xlsx)</option>
                      <option value="pdf">Documento PDF (.pdf)</option>
                      <option value="json">Cópia de Segurança (.json)</option>
                    </select>

                    <button
                      type="button"
                      onClick={exportarDadosFinanceiros}
                      disabled={carregandoExport}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Download size={14} />
                      {carregandoExport ? 'A exportar...' : 'Descarregar'}
                    </button>
                  </div>
                </div>

                {/* Importar */}
                <div className="space-y-2 p-3.5 rounded-xl border bg-white dark:bg-[#161e18] border-gray-200 dark:border-[#273C2C]">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-[#FFE2FE]">Restaurar Backup (.json)</h4>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-[#939196]">Importe transações salvas de outro arquivo JSON do FinancePlus.</p>
                  
                  <label className="flex items-center justify-center gap-1.5 px-3 py-2 font-bold text-xs rounded-xl transition-all cursor-pointer bg-[#273C2C] text-white dark:bg-[#D3C1D2] dark:text-[#273C2C]">
                    <Upload size={14} />
                    {carregandoImport ? 'Importando...' : 'Selecionar Ficheiro'}
                    <input type="file" accept=".json" onChange={importarBackupJSON} className="hidden" disabled={carregandoImport} />
                  </label>
                </div>
              </div>
            </div>

            {/* Zona de Perigo */}
            <div className="p-4 rounded-2xl border space-y-3 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40">
              <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Zona de Perigo</h3>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b pb-3 border-rose-200/60 dark:border-rose-900/30">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-[#FFE2FE]">Resetar Dados Financeiros</h4>
                  <p className="text-[11px] font-medium text-gray-600 dark:text-[#D3C1D2]">Apaga permanentemente todo o histórico de lançamentos sem excluir o seu perfil.</p>
                </div>
                <button
                  type="button"
                  onClick={resetarDadosConta}
                  disabled={carregandoReset}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Trash2 size={14} />
                  Limpar Histórico
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-[#FFE2FE]">Desconexão Protegida</h4>
                  <p className="text-[11px] font-medium text-gray-600 dark:text-[#D3C1D2]">Encerra de forma segura a sua sessão ativa neste dispositivo.</p>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Desconectar da Conta
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ABA 2: PREFERÊNCIAS */}
        {abaAtiva === 'preferencias' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl border space-y-4 bg-gray-50 dark:bg-[#273C2C]/20 border-gray-200 dark:border-[#273C2C]">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-gray-700 dark:text-[#D3C1D2]">
                <DollarSign size={16} className="text-[#273C2C] dark:text-[#D3C1D2]" />
                Formato Monetário
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-[#FFE2FE]">Moeda Padrão da Aplicação</h4>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-[#939196]">Define o símbolo monetário exibido nos relatórios e tabelas.</p>
                </div>
                <select
                  value={moedaPadrao}
                  onChange={(e) => {
                    setMoedaPadrao(e.target.value);
                    toast.success('Formato monetário atualizado!');
                  }}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none bg-white dark:bg-[#161e18] border border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE]"
                >
                  <option value="BRL">Real Brasileiro (R$)</option>
                  <option value="USD">Dólar Americano ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl border space-y-4 bg-gray-50 dark:bg-[#273C2C]/20 border-gray-200 dark:border-[#273C2C]">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-gray-700 dark:text-[#D3C1D2]">
                <Bell size={16} className="text-[#273C2C] dark:text-[#D3C1D2]" />
                Lembretes do Sistema
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-[#FFE2FE]">Notificação de Contas a Vencer</h4>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-[#939196]">Exibe alertas na barra superior para lançamentos próximos do vencimento.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificarVencimentos}
                  onChange={(e) => {
                    setNotificarVencimentos(e.target.checked);
                    toast.success('Preferência de notificação salva!');
                  }}
                  className="w-4 h-4 rounded cursor-pointer accent-[#273C2C] dark:accent-[#D3C1D2]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: SOBRE O PROJETO */}
        {abaAtiva === 'sobre' && (
          <div className="space-y-6 text-gray-700 dark:text-[#FFE2FE]">
            <div className="text-center py-4">
              <h2 className="text-3xl font-black text-[#273C2C] dark:text-[#D3C1D2]">FinancePlus</h2>
              <p className="text-xs font-bold text-gray-400 dark:text-[#939196] mt-1">Versão 1.6.0</p>
              <p className="mt-4 max-w-xl mx-auto text-xs font-medium leading-relaxed text-gray-600 dark:text-[#D3C1D2]">
                Uma aplicação moderna de controle financeiro desenvolvida para oferecer autonomia, clareza visual e inteligência na gestão de receitas e despesas.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border bg-gray-50 dark:bg-[#273C2C]/20 border-gray-200 dark:border-[#273C2C]">
                <h4 className="font-bold text-xs mb-2 flex items-center gap-2 text-gray-900 dark:text-[#FFE2FE]">
                  <Code size={16} className="text-[#273C2C] dark:text-[#D3C1D2]" />
                  Tecnologias Utilizadas
                </h4>
                <ul className="list-disc list-inside text-xs font-medium space-y-1 text-gray-600 dark:text-[#D3C1D2]">
                  <li>React & Vite</li>
                  <li>Tailwind CSS & GSAP</li>
                  <li>Supabase (Banco de dados & Autenticação)</li>
                  <li>ExcelJS (Planilhas nativas inteligentes)</li>
                  <li>jsPDF (Geração de relatórios PDF)</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl border bg-gray-50 dark:bg-[#273C2C]/20 border-gray-200 dark:border-[#273C2C]">
                <h4 className="font-bold text-xs mb-2 flex items-center gap-2 text-gray-900 dark:text-[#FFE2FE]">
                  <FileText size={16} className="text-[#273C2C] dark:text-[#D3C1D2]" />
                  Licenciamento
                </h4>
                <p className="text-xs font-medium leading-relaxed text-gray-600 dark:text-[#D3C1D2]">
                  Este projeto está protegido legalmente sob a <b>Licença MIT</b>. O software é de código aberto para uso comercial, modificação e distribuição.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t text-center text-[11px] font-bold border-gray-200 dark:border-[#273C2C] text-gray-400 dark:text-[#939196]">
              Desenvolvido por Davi Nicacio &copy; 2026
            </div>
          </div>
        )}

      </div>
    </div>
  );
}