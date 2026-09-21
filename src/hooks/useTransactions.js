// src/hooks/useTransactions.js
import { useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { notify } from '../utils/notify';

function parseMascaraParaNumero(valor) {
  if (!valor) return 0;
  if (typeof valor === 'number') return valor;
  const valorLimpo = valor.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(valorLimpo);
}

export function useTransactions(session) {
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // 1. Buscar transações do utilizador autenticado
  const buscarTransacoes = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setCarregando(true);
      const { data: dados, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTransacoes(dados || []);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      notify.error('Erro ao buscar dados do banco.');
    } finally {
      setCarregando(false);
    }
  }, [session]);

  // 2. Guardar ou atualizar um lançamento
  const salvarLancamento = async ({
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
  }, limparFormularioCallback) => {
    if (!session?.user?.id) {
      notify.error('Sessão inválida. Faça login novamente.');
      return;
    }

    if (!descricao || !valorMascara || !data) {
      notify.error('Preencha os campos obrigatórios.');
      return;
    }

    const valorNumerico = parseMascaraParaNumero(valorMascara);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      notify.error('Insira um valor válido maior que zero.');
      return;
    }

    try {
      let lotesDeTransacoes = [];
      const [anoBase, mesBase, diaBase] = data.split('-').map(Number);
      const temVencimento = !!dataVencimento;
      const [anoVencBase, mesVencBase, diaVencBase] = temVencimento ? dataVencimento.split('-').map(Number) : [null, null, null];

      if (editandoId) {
        if (grupoId) {
          const { error: erroGrupo } = await supabase
            .from('transacoes')
            .update({ valor: valorNumerico, categoria, tipo, dados_pagamento: dadosPagamento || null })
            .eq('grupo_id', grupoId)
            .eq('user_id', session.user.id);
          if (erroGrupo) throw erroGrupo;

          const { error: erroIndividual } = await supabase
            .from('transacoes')
            .update({ descricao, status, data, data_vencimento: dataVencimento || null })
            .eq('id', editandoId)
            .eq('user_id', session.user.id);
          if (erroIndividual) throw erroIndividual;
        } else {
          const { error } = await supabase
            .from('transacoes')
            .update({
              user_id: session.user.id,
              descricao,
              valor: valorNumerico,
              categoria,
              data,
              tipo,
              status,
              data_vencimento: dataVencimento || null,
              dados_pagamento: dadosPagamento || null
            })
            .eq('id', editandoId)
            .eq('user_id', session.user.id);
          if (error) throw error;
        }
      } else {
        const novoGrupoId = repetir ? crypto.randomUUID() : null;

        if (!repetir) {
          lotesDeTransacoes.push({
            user_id: session.user.id,
            descricao,
            valor: valorNumerico,
            categoria,
            data,
            tipo,
            status,
            data_vencimento: dataVencimento || null,
            dados_pagamento: dadosPagamento || null,
            grupo_id: null
          });
        } else if (tipoRepeticao === 'parcelado' || tipoRepeticao === 'fixo') {
          const limit = tipoRepeticao === 'parcelado' ? numeroParcelas : 12;
          for (let i = 1; i <= limit; i++) {
            const dateObj = new Date(Date.UTC(anoBase, mesBase - 1 + (i - 1), diaBase));
            const dataString = dateObj.toISOString().split('T')[0];
            
            let vencimentoString = null;
            if (temVencimento) {
              const vencObj = new Date(Date.UTC(anoVencBase, mesVencBase - 1 + (i - 1), diaVencBase));
              vencimentoString = vencObj.toISOString().split('T')[0];
            }

            lotesDeTransacoes.push({
              user_id: session.user.id,
              descricao: tipoRepeticao === 'parcelado' ? `${descricao} (${i}/${numeroParcelas})` : descricao,
              valor: valorNumerico,
              categoria,
              data: dataString,
              tipo,
              status: i === 1 ? status : 'Pendente',
              data_vencimento: vencimentoString,
              dados_pagamento: dadosPagamento || null,
              grupo_id: novoGrupoId
            });
          }
        }

        const { error } = await supabase.from('transacoes').insert(lotesDeTransacoes);
        if (error) throw error;
      }

      if (limparFormularioCallback) limparFormularioCallback();
      await buscarTransacoes();
      notify.success('Lançamento guardado com sucesso!');
    } catch (err) {
      console.error('Erro ao guardar lançamento:', err);
      notify.error('Erro ao guardar as informações na base de dados.');
    }
  };

  // 3. Excluir uma transação
  const excluirTransacao = async (idExclusaoConfirmar, apagarEmLote, grupoIdAlvo, editandoId, limparFormularioCallback) => {
    if (!idExclusaoConfirmar || !session?.user?.id) return;
    try {
      let query = supabase
        .from('transacoes')
        .delete()
        .eq('user_id', session.user.id);

      if (apagarEmLote && grupoIdAlvo) {
        query = query.eq('grupo_id', grupoIdAlvo);
      } else {
        query = query.eq('id', idExclusaoConfirmar);
      }

      const { error } = await query;
      if (error) throw error;
      
      notify.success(apagarEmLote ? 'Série de lançamentos removida com sucesso!' : 'Lançamento removido.');
      
      if (editandoId === idExclusaoConfirmar && limparFormularioCallback) {
        limparFormularioCallback();
      }
      await buscarTransacoes();
    } catch (error) {
      console.error('Erro de exclusão:', error);
      notify.error('Erro ao excluir registo.');
    }
  };

  return {
    transacoes,
    setTransacoes,
    carregando,
    buscarTransacoes,
    salvarLancamento,
    excluirTransacao
  };
}