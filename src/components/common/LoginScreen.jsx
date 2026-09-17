// src/components/common/LoginScreen.jsx
import { useState, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { Wallet, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import AuthRecovery from './AuthRecovery';

// Registro obrigatório do plugin GSAP
gsap.registerPlugin(useGSAP);

export default function LoginScreen({ 
  viewAuth, 
  setViewAuth, 
  lidarComLogin, 
  lidarComCadastro, 
  lidarComSolicitacaoEmail 
}) {
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Referências para elementos do DOM e controle de animação
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const bannerRef = useRef(null);
  const campoNomeRef = useRef(null);
  const campoConfirmarRef = useRef(null);
  const progressFillRef = useRef(null);
  
  // Referências para o Canvas e Interação com o Mouse
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });

  // 1. SISTEMA DE PARTÍCULAS E CONSTELAÇÃO EM CANVAS (GSAP TICKER)
  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Configuração e ajuste dinâmico do tamanho do canvas
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const redimensionar = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', redimensionar);

    // Parâmetros ajustáveis da animação
    const quantidadeNois = Math.floor(Math.min(width, height) / 12); // Quantidade proporcional à tela
    const distanciaMaximaLinha = 130; // Distância limite em pixels para conectar dois nós
    const distanciaAtracaoMouse = 160; // Distância limite para conectar com o cursor

    // Criação dos pontos (nós) com posições e velocidades aleatórias
    const particulas = Array.from({ length: quantidadeNois }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7, // Velocidade horizontal
      vy: (Math.random() - 0.5) * 0.7, // Velocidade vertical
      raio: Math.random() * 1.8 + 1,    // Tamanho do ponto
    }));

    // Função de renderização executada a cada frame (60 FPS)
    const atualizarEPlotar = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particulas.length; i++) {
        const p1 = particulas[i];

        // Atualização da posição com rebatimento nas bordas da tela
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Desenho do nó (ponto luminoso)
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.raio, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(96, 165, 250, 0.85)'; // Azul ciano brilhante
        ctx.fill();

        // Linhas de conexão entre nós próximos
        for (let j = i + 1; j < particulas.length; j++) {
          const p2 = particulas[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < distanciaMaximaLinha) {
            // A opacidade diminui à medida que os pontos se distanciam
            const opacidade = (1 - dist / distanciaMaximaLinha) * 0.3;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacidade})`; // Indigo translúcido
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Linhas de conexão com o cursor do mouse
        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const dxMouse = p1.x - mouseRef.current.x;
          const dyMouse = p1.y - mouseRef.current.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          if (distMouse < distanciaAtracaoMouse) {
            const opacidadeMouse = (1 - distMouse / distanciaAtracaoMouse) * 0.6;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${opacidadeMouse})`; // Ciano neon vívido
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }
    };

    // GSAP Ticker: executa o loop sincronizado com a taxa de atualização da tela
    gsap.ticker.add(atualizarEPlotar);

    // Limpeza ao desmontar o componente
    return () => {
      window.removeEventListener('resize', redimensionar);
      gsap.ticker.remove(atualizarEPlotar);
    };
  }, { scope: containerRef });

  // 2. ENTRADA ANIMADA DO CARTÃO DE LOGIN
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.6 } });

    tl.from(cardRef.current, {
      y: 40,
      opacity: 0,
      scale: 0.96,
    }).from(
      bannerRef.current ? bannerRef.current.children : [],
      {
        x: -20,
        opacity: 0,
        stagger: 0.1,
      },
      '-=0.3'
    );
  }, { scope: containerRef });

  // 3. TRANSIÇÃO FLUIDA DOS CAMPOS (LOGIN <-> CADASTRO)
  useGSAP(() => {
    const eCadastro = viewAuth === 'cadastro';

    gsap.to(campoNomeRef.current, {
      height: eCadastro ? 'auto' : 0,
      opacity: eCadastro ? 1 : 0,
      marginBottom: eCadastro ? 12 : 0,
      duration: 0.4,
      ease: 'power2.inOut',
    });

    gsap.to(campoConfirmarRef.current, {
      height: eCadastro ? 'auto' : 0,
      opacity: eCadastro ? 1 : 0,
      marginBottom: eCadastro ? 12 : 0,
      duration: 0.4,
      ease: 'power2.inOut',
    });
  }, { dependencies: [viewAuth], scope: containerRef });

  // Captura dos movimentos do mouse sobre o contêiner
  const capturarMovimentoMouse = (e) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const removerMovimentoMouse = () => {
    mouseRef.current = { x: null, y: null };
  };

  // Submissão do formulário com animação de barra de carregamento no botão
  const submeterFormulario = async (e) => {
    e.preventDefault();
    if (carregando) return;

    setCarregando(true);

    gsap.fromTo(
      progressFillRef.current,
      { width: '0%' },
      { width: '100%', duration: 1.5, ease: 'power1.inOut' }
    );

    setTimeout(() => {
      if (viewAuth === 'login') {
        lidarComLogin(email, password);
      } else {
        lidarComCadastro(email, password, nome, confirmarSenha);
      }
      setCarregando(false);
      gsap.set(progressFillRef.current, { width: '0%' });
    }, 1500);
  };

  if (viewAuth === 'solicitar') {
    return (
      <>
        <Toaster position="bottom-right" />
        <AuthRecovery
          modo="solicitar"
          aoVoltar={() => setViewAuth('login')}
          aoSubmeter={lidarComSolicitacaoEmail}
        />
      </>
    );
  }

  return (
    <div 
      ref={containerRef} 
      onMouseMove={capturarMovimentoMouse}
      onMouseLeave={removerMovimentoMouse}
      className="relative min-h-screen w-full bg-[#09090b] flex items-center justify-center p-4 md:p-8 font-sans transition-colors duration-200 overflow-hidden"
    >
      <Toaster position="bottom-right" />
      
      {/* CANVAS DA CONSTELAÇÃO DE NÓS */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0" 
      />

      {/* Cartão de Login com Glassmorphism */}
      <div 
        ref={cardRef}
        className="relative z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl w-full max-w-4xl rounded-3xl shadow-2xl border border-white/20 dark:border-zinc-800/80 overflow-hidden grid grid-cols-1 md:grid-cols-2 transition-colors duration-200 my-auto"
      >
        
        {/* Lado Esquerdo - Banner */}
        <div 
          ref={bannerRef}
          className="hidden md:flex flex-col justify-between p-10 bg-linear-to-br from-blue-600/90 to-indigo-800/90 backdrop-blur-md text-white relative overflow-hidden"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-wider uppercase">Gestor Financeiro</span>
          </div>
          
          <div className="space-y-3 relative z-10 my-auto">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Simplifique o controle <br /> do seu dinheiro.
            </h2>
            <p className="text-xs text-blue-100/80 max-w-sm font-medium leading-relaxed">
              Uma plataforma direta e intuitiva para você lançar despesas, acompanhar receitas, gerenciar vencimentos e exportar relatórios sem complicação.
            </p>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="flex flex-col justify-center p-8 md:p-12 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md transition-colors duration-200">
          <div className="w-full max-w-sm mx-auto space-y-5">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">
                {viewAuth === 'login' ? 'Acesse sua conta' : 'Crie sua conta grátis'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-400 font-medium">
                {viewAuth === 'login' ? 'Insira suas credenciais para gerenciar a aplicação.' : 'Preencha os campos abaixo com uma senha segura.'}
              </p>
            </div>

            <form onSubmit={submeterFormulario} className="space-y-1">
              
              {/* Campo Nome Completo */}
              <div ref={campoNomeRef} className="overflow-hidden opacity-0 h-0">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  required={viewAuth === 'cadastro'}
                  className="w-full bg-neutral-50/80 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              {/* Campo E-mail */}
              <div className="space-y-1 pb-3">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">E-mail de acesso</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-neutral-50/80 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Campo Senha */}
              <div className="space-y-1 pb-2">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Senha</label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="w-full bg-neutral-50/80 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-medium text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Campo Confirmar Senha */}
              <div ref={campoConfirmarRef} className="overflow-hidden opacity-0 h-0">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Confirmar Senha</label>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="••••••••"
                  required={viewAuth === 'cadastro'}
                  className="w-full bg-neutral-50/80 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 dark:text-zinc-500 flex items-center gap-1 pt-1">
                  <ShieldCheck className="w-3 h-3 text-blue-500" />
                  Mínimo 8 caracteres, maiúsculas, números e símbolos (@$!%*?&#).
                </p>
              </div>

              {viewAuth === 'login' && (
                <div className="text-right pt-1 pb-2">
                  <button
                    type="button"
                    onClick={() => { setViewAuth('solicitar'); setEmail(''); setPassword(''); }}
                    className="text-[10px] text-blue-500 hover:text-blue-600 font-bold transition-all cursor-pointer bg-transparent border-none"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}

              {/* Botão com Barra de Preenchimento Progressivo */}
              <button 
                type="submit" 
                disabled={carregando}
                className="relative w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-[0.98] mt-2 cursor-pointer overflow-hidden disabled:cursor-not-allowed"
              >
                <div 
                  ref={progressFillRef} 
                  className="absolute left-0 top-0 bottom-0 bg-blue-700 w-0 z-0 pointer-events-none" 
                />

                <span className="relative z-10 flex items-center justify-center gap-2">
                  {carregando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    viewAuth === 'login' ? 'Entrar no Sistema' : 'Criar minha Conta'
                  )}
                </span>
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { 
                  setViewAuth(viewAuth === 'login' ? 'cadastro' : 'login'); 
                  setEmail(''); 
                  setPassword(''); 
                  setNome('');
                  setConfirmarSenha('');
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors bg-transparent border-none cursor-pointer"
              >
                {viewAuth === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Voltar ao Login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}