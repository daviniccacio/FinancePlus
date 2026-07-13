import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import { enviarMensagemAoAssistente } from '../services/aiService';

export default function ChatIA({ transacoes, saldoAtual }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [mensagens, setMensagens] = useState([
    { id: 1, role: 'ai', text: 'Olá! Sou o teu assistente FinancePlus. Como posso ajudar com as tuas finanças hoje?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // 🌟 FUNÇÃO MÁGICA: Converte os ** em negrito real no React
  function formatarTextoMarkdown(texto) {
    if (!texto) return '';
    const partes = texto.split('**');
    return partes.map((parte, index) => {
      // Se o índice for ímpar, significa que o texto estava entre os '**'
      if (index % 2 !== 0) {
        return <strong key={index} className="font-bold text-gray-900 dark:text-white">{parte}</strong>;
      }
      return parte;
    });
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens, isTyping]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { id: Date.now(), role: 'user', text: input };
    setMensagens(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const resposta = await enviarMensagemAoAssistente(input, transacoes, saldoAtual);
    
    setMensagens(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: resposta }]);
    setIsTyping(false);
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 flex items-center gap-2 group"
        >
          <Sparkles className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out text-sm font-bold">
            Assistente IA
          </span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white dark:bg-zinc-900 w-[350px] sm:w-[400px] h-[500px] rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-bold text-sm">FinancePlus AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensagens */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-zinc-950">
            {mensagens.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/* 🌟 AJUSTE AQUI: Adicionado 'whitespace-pre-wrap' para quebrar as linhas corretamente */}
                <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-wrap ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 border border-gray-100 dark:border-zinc-700 rounded-tl-none'
                }`}>
                  {/* 🌟 AJUSTE AQUI: Agora passamos o texto pela função de formatação */}
                  {formatarTextoMarkdown(m.text)}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 animate-pulse text-[10px] text-gray-400">
                  Analisando as tuas finanças...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunta sobre os teus gastos..."
              className="flex-1 bg-gray-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}