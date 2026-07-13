// src/services/aiService.js

const rawApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
const apiKey = rawApiKey ? rawApiKey.trim() : "";

if (apiKey) {
  console.log(`[FinancePlus Debug] Chave OpenRouter sincronizada com sucesso!`);
} else {
  console.error(
    "❌ Erro: A variável VITE_OPENROUTER_API_KEY não foi encontrada no teu ficheiro .env!",
  );
}

/**
 * Envia uma mensagem ao assistente do FinancePlus usando o OpenRouter (100% Gratuito).
 * Corrigido para receber os 3 parâmetros enviados pelo teu componente chatIA.jsx
 */
export async function enviarMensagemAoAssistente(
  promptDoUtilizador,
  transacoes,
  saldoAtual,
) {
  try {
    if (!apiKey) {
      throw new Error(
        "Chave de API do OpenRouter não configurada no teu ficheiro .env.",
      );
    }

    // Formata a lista de transações para texto legível pela IA
    const listaFormatada =
      Array.isArray(transacoes) && transacoes.length > 0
        ? transacoes
            .map(
              (t) =>
                `- ${t.data}: ${t.descricao} | R$ ${t.valor?.toFixed(2)} | Categoria: ${t.categoria} | Tipo: ${t.tipo} | Status: ${t.status}`,
            )
            .join("\n")
        : "Nenhuma transação encontrada no período.";

    const hoje = new Date().toLocaleDateString("pt-BR");

    // Construção do System Prompt com os dados corrigidos
    const promptDoSistema = `
      Tu és o assistente financeiro inteligente e analista pessoal do app FinancePlus.
      O teu tom deve ser amigável, encorajador, didático e focado em literacia financeira.
      Hoje é dia ${hoje}.
      
      Aqui estão os dados financeiros reais do utilizador para analisar:
      - Saldo Disponível Atual: R$ ${Number(saldoAtual || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      - Histórico de Transações Recentes:
      ${listaFormatada}
      
      Regras de Resposta:
      - Responde SEMPRE em português brasileiro.
      - Sê direto, dinâmico e evita blocos de texto muito longos.
      - Usa negrito para destacar valores monetários.
      - NUNCA insira quebras de linha duplas ou cortes abruptos no meio de uma frase.
      - Escreva parágrafos contínuos e fluidos.
      - Use emoticons de forma moderada (apenas para destacar títulos ou alertas importantes).
      - Certifique-se de que o texto está pronto para ser lido em uma interface de chat moderna
    `;

    // Chamada HTTP nativa para o OpenRouter
    const respostaServidor = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "FinancePlus App",
        },
        body: JSON.stringify({
          // Modelo gratuito, super rápido e ideal do Gemini dentro do OpenRouter
          model: "nvidia/nemotron-3-ultra-550b-a55b:free",
          messages: [
            { role: "system", content: promptDoSistema },
            { role: "user", content: promptDoUtilizador },
          ],
          temperature: 0.6,
        }),
      },
    );

    const dadosResultado = await respostaServidor.json();

    if (!respostaServidor.ok) {
      throw new Error(
        dadosResultado?.error?.message ||
          `Erro HTTP: ${respostaServidor.status}`,
      );
    }

    return dadosResultado.choices[0].message.content;
  } catch (erro) {
    console.error("❌ [Erro na IA OpenRouter]:", erro.message);
    return `Desculpa, tive um problema ao processar a tua consulta financeira. (Erro: ${erro.message})`;
  }
}
