// src/hooks/useRateLimit.js
import { useState, useRef } from 'react';
import { notify } from '../utils/notify';

/**
 * Hook para limitar a frequência de chamadas de funções no frontend (Rate Limiting / Throttling).
 * 
 * @param {number} tempoEsperaMs - Tempo de bloqueio em milissegundos (padrão: 3000ms / 3 segundos).
 * @returns {Object} { executarComLimite, bloqueado }
 */
export function useRateLimit(tempoEsperaMs = 3000) {
  const [bloqueado, setBloqueado] = useState(false);
  const ultimoExecucaoRef = useRef(0);

  /**
   * Executa uma função apenas se o tempo limite tiver decorrido.
   * 
   * @param {Function} funcaoParaExecutar - Função que realiza a ação (ex: login, salvar lançamento).
   */
  const executarComLimite = async (funcaoParaExecutar) => {
    const agora = Date.now();
    const tempoDecorrido = agora - ultimoExecucaoRef.current;

    // Se a tentativa ocorrer dentro do intervalo de bloqueio
    if (tempoDecorrido < tempoEsperaMs) {
      const segundosRestantes = Math.ceil((tempoEsperaMs - tempoDecorrido) / 1000);
      notify.error(`Muitas tentativas seguidas. Aguarde ${segundosRestantes}s.`);
      return false;
    }

    // Atualiza o horário da última execução bem-sucedida e ativa o bloqueio
    ultimoExecucaoRef.current = agora;
    setBloqueado(true);

    try {
      return await funcaoParaExecutar();
    } finally {
      // Liberta o bloqueio após o tempo definido
      setTimeout(() => {
        setBloqueado(false);
      }, tempoEsperaMs);
    }
  };

  return { executarComLimite, bloqueado };
}