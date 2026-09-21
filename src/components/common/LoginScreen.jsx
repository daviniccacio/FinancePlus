// src/components/common/LoginScreen.jsx
import { useState, useRef, useEffect } from 'react';
import { Wallet, Eye, EyeOff, ShieldCheck, Loader2, Sun, Moon } from 'lucide-react';
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

  // Estado do Modo Claro / Modo Escuro (Padrão: Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Referências para elementos do DOM e controle de animação
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const bannerRef = useRef(null);
  const campoNomeRef = useRef(null);
  const campoConfirmarRef = useRef(null);
  const progressFillRef = useRef(null);
  const themeToggleBtnRef = useRef(null);
  const eyeBtnRef = useRef(null);

  // Referências para o Canvas e Interação com o Mouse
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });
  const isDarkModeRef = useRef(isDarkMode);

  // Sincroniza a referência com o estado para acesso direto no GSAP Ticker
  useEffect(() => {
    isDarkModeRef.current = isDarkMode;
  }, [isDarkMode]);

  // 1. SISTEMA DE PARTÍCULAS E CONSTELAÇÃO EM CANVAS ADAPTATIVO
  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const redimensionar = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', redimensionar);

    const quantidadeNois = Math.floor(Math.min(width, height) / 12);
    const distanciaMaximaLinha = 130;
    const distanciaAtracaoMouse = 160;

    const particulas = Array.from({ length: quantidadeNois }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      raio: Math.random() * 1.8 + 1,
    }));

    const atualizarEPlotar = () => {
      ctx.clearRect(0, 0, width, height);
      const dark = isDarkModeRef.current;

      for (let i = 0; i < particulas.length; i++) {
        const p1 = particulas[i];

        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.raio, 0, Math.PI * 2);
        ctx.fillStyle = dark ? 'rgba(255, 226, 254, 0.85)' : 'rgba(39, 60, 44, 0.85)';
        ctx.fill();

        for (let j = i + 1; j < particulas.length; j++) {
          const p2 = particulas[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < distanciaMaximaLinha) {
            const opacidade = (1 - dist / distanciaMaximaLinha) * 0.25;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = dark
              ? `rgba(211, 193, 210, ${opacidade})`
              : `rgba(98, 104, 104, ${opacidade})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const dxMouse = p1.x - mouseRef.current.x;
          const dyMouse = p1.y - mouseRef.current.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          if (distMouse < distanciaAtracaoMouse) {
            const opacidadeMouse = (1 - distMouse / distanciaAtracaoMouse) * 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.strokeStyle = dark
              ? `rgba(255, 226, 254, ${opacidadeMouse})`
              : `rgba(39, 60, 44, ${opacidadeMouse})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }
    };

    gsap.ticker.add(atualizarEPlotar);

    return () => {
      window.removeEventListener('resize', redimensionar);
      gsap.ticker.remove(atualizarEPlotar);
    };
  }, { scope: containerRef });

  // 2. ENTRADA ANIMADA DO CARTÃO
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } });

    tl.from(cardRef.current, {
      y: 50,
      opacity: 0,
      scale: 0.95,
    }).from(
      bannerRef.current ? bannerRef.current.children : [],
      {
        x: -20,
        opacity: 0,
        stagger: 0.1,
      },
      '-=0.4'
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

  const alternarTema = () => {
    setIsDarkMode((prev) => !prev);

    if (themeToggleBtnRef.current) {
      gsap.fromTo(
        themeToggleBtnRef.current,
        { rotate: 0, scale: 0.8 },
        { rotate: 360, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  };

  const capturarMovimentoMouse = (e) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const removerMovimentoMouse = () => {
    mouseRef.current = { x: null, y: null };
  };

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

  const alternarMostrarSenha = () => {
    setMostrarSenha((prev) => !prev);

    if (eyeBtnRef.current) {
      gsap.fromTo(
        eyeBtnRef.current,
        { scale: 0.5, rotate: -45, opacity: 0.4 },
        { scale: 1, rotate: 0, opacity: 1, duration: 0.35, ease: 'back.out(2)' }
      );
    }
  };

  if (viewAuth === 'solicitar') {
    return (
      <AuthRecovery
        modo="solicitar"
        aoVoltar={() => setViewAuth('login')}
        aoSubmeter={lidarComSolicitacaoEmail}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={capturarMovimentoMouse}
      onMouseLeave={removerMovimentoMouse}
      style={{
        backgroundColor: isDarkMode ? '#1a281e' : '#FFE2FE',
        color: isDarkMode ? '#FFE2FE' : '#273C2C'
      }}
      className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 font-sans transition-colors duration-500 overflow-hidden"
    >
      {/* CANVAS DA CONSTELAÇÃO DE NÓS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Cartão de Login */}
      <div
        ref={cardRef}
        style={{
          backgroundColor: isDarkMode ? 'rgba(39, 60, 44, 0.75)' : 'rgba(255, 226, 254, 0.85)',
          borderColor: isDarkMode ? 'rgba(98, 104, 104, 0.6)' : 'rgba(211, 193, 210, 0.9)'
        }}
        className="relative z-10 backdrop-blur-2xl w-full max-w-4xl rounded-3xl shadow-2xl border overflow-hidden grid grid-cols-1 md:grid-cols-2 transition-colors duration-500 my-auto"
      >
        {/* BOTÃO DE ALTERNÂNCIA DE TEMA */}
        <button
          ref={themeToggleBtnRef}
          type="button"
          onClick={alternarTema}
          style={{
            backgroundColor: isDarkMode ? '#273C2C' : '#FFE2FE',
            borderColor: isDarkMode ? '#626868' : '#D3C1D2',
            color: isDarkMode ? '#FFE2FE' : '#273C2C'
          }}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-2xl border shadow-md transition-colors cursor-pointer hover:scale-105"
          title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-[#FFE2FE]" /> : <Moon className="w-4 h-4 text-[#273C2C]" />}
        </button>

        {/* Lado Esquerdo - Banner */}
        <div
          ref={bannerRef}
          style={{
            backgroundColor: isDarkMode ? '#273C2C' : '#D3C1D2',
            color: isDarkMode ? '#FFE2FE' : '#273C2C'
          }}
          className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden transition-colors duration-500"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div
              style={{
                backgroundColor: isDarkMode ? 'rgba(255, 226, 254, 0.15)' : 'rgba(39, 60, 44, 0.15)'
              }}
              className="p-2.5 rounded-xl border border-current/20 backdrop-blur-xs"
            >
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold tracking-wider uppercase">Gestor Financeiro</span>
          </div>

          <div className="space-y-3 relative z-10 my-auto">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Simplifique o controle <br /> do seu dinheiro.
            </h2>
            <p className="text-xs opacity-85 max-w-sm font-medium leading-relaxed">
              Uma plataforma direta e intuitiva para você lançar despesas, acompanhar receitas, gerenciar vencimentos e exportar relatórios sem complicação.
            </p>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="flex flex-col justify-center p-8 md:p-12 transition-colors duration-500">
          <div className="w-full max-w-sm mx-auto space-y-5">
            <div className="space-y-1">
              <h3
                style={{ color: isDarkMode ? '#FFE2FE' : '#273C2C' }}
                className="text-xl font-bold tracking-tight"
              >
                {viewAuth === 'login' ? 'Acesse sua conta' : 'Crie sua conta grátis'}
              </h3>
              <p
                style={{ color: isDarkMode ? '#D3C1D2' : '#626868' }}
                className="text-xs font-medium"
              >
                {viewAuth === 'login' ? 'Insira suas credenciais para gerenciar a aplicação.' : 'Preencha os campos abaixo com uma senha segura.'}
              </p>
            </div>

            <form onSubmit={submeterFormulario} className="space-y-1">

              {/* Campo Nome Completo */}
              <div ref={campoNomeRef} className="overflow-hidden opacity-0 h-0">
                <label
                  style={{ color: isDarkMode ? '#D3C1D2' : '#626868' }}
                  className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                >
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  required={viewAuth === 'cadastro'}
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(98, 104, 104, 0.25)' : 'rgba(255, 255, 255, 0.8)',
                    borderColor: isDarkMode ? '#626868' : '#D3C1D2',
                    color: isDarkMode ? '#FFE2FE' : '#273C2C'
                  }}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D3C1D2]/40 transition-all placeholder:text-[#939196]"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              {/* Campo E-mail */}
              <div className="space-y-1 pb-3">
                <label
                  style={{ color: isDarkMode ? '#D3C1D2' : '#626868' }}
                  className="text-[10px] font-bold uppercase tracking-wider block"
                >
                  E-mail de acesso
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  required
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(98, 104, 104, 0.25)' : 'rgba(255, 255, 255, 0.8)',
                    borderColor: isDarkMode ? '#626868' : '#D3C1D2',
                    color: isDarkMode ? '#FFE2FE' : '#273C2C'
                  }}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D3C1D2]/40 transition-all placeholder:text-[#939196]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Campo Senha */}
              <div className="space-y-1 pb-2">
                <label
                  style={{ color: isDarkMode ? '#D3C1D2' : '#626868' }}
                  className="text-[10px] font-bold uppercase tracking-wider block"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(98, 104, 104, 0.25)' : 'rgba(255, 255, 255, 0.8)',
                      borderColor: isDarkMode ? '#626868' : '#D3C1D2',
                      color: isDarkMode ? '#FFE2FE' : '#273C2C'
                    }}
                    className="w-full border rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D3C1D2]/40 transition-all placeholder:text-[#939196]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    ref={eyeBtnRef}
                    type="button"
                    onClick={alternarMostrarSenha}
                    style={{ color: isDarkMode ? '#D3C1D2' : '#626868' }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity cursor-pointer p-1"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Campo Confirmar Senha */}
              <div ref={campoConfirmarRef} className="overflow-hidden opacity-0 h-0">
                <label
                  style={{ color: isDarkMode ? '#D3C1D2' : '#626868' }}
                  className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                >
                  Confirmar Senha
                </label>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="••••••••"
                  required={viewAuth === 'cadastro'}
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(98, 104, 104, 0.25)' : 'rgba(255, 255, 255, 0.8)',
                    borderColor: isDarkMode ? '#626868' : '#D3C1D2',
                    color: isDarkMode ? '#FFE2FE' : '#273C2C'
                  }}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D3C1D2]/40 transition-all placeholder:text-[#939196]"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                />
                <p
                  style={{ color: isDarkMode ? '#939196' : '#626868' }}
                  className="text-[10px] flex items-center gap-1 pt-1"
                >
                  <ShieldCheck className="w-3 h-3 text-[#D3C1D2]" />
                  Mínimo 8 caracteres, maiúsculas, números e símbolos (@$!%*?&#).
                </p>
              </div>

              {viewAuth === 'login' && (
                <div className="text-right pt-1 pb-2">
                  <button
                    type="button"
                    onClick={() => { setViewAuth('solicitar'); setEmail(''); setPassword(''); }}
                    style={{ color: isDarkMode ? '#D3C1D2' : '#273C2C' }}
                    className="text-[10px] hover:underline font-bold transition-all cursor-pointer bg-transparent border-none"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={carregando}
                style={{
                  backgroundColor: isDarkMode ? '#D3C1D2' : '#273C2C',
                  color: isDarkMode ? '#273C2C' : '#FFE2FE'
                }}
                className="relative w-full font-bold py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-[0.98] mt-2 cursor-pointer overflow-hidden disabled:cursor-not-allowed"
              >
                <div
                  ref={progressFillRef}
                  style={{
                    backgroundColor: isDarkMode ? '#FFE2FE' : '#626868'
                  }}
                  className="absolute left-0 top-0 bottom-0 w-0 z-0 pointer-events-none opacity-40"
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
                style={{ color: isDarkMode ? '#FFE2FE' : '#273C2C' }}
                className="text-xs hover:underline font-semibold transition-colors bg-transparent border-none cursor-pointer"
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