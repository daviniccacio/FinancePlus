// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { traduzirErroSupabase, validarCamposAuth } from "../utils/AuthHelpers";
import { notify } from "../utils/notify";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  
  // 🌟 Estado para controlar a exibição da LoadingScreen durante o login
  const [carregandoLogin, setCarregandoLogin] = useState(false);

  const [viewAuth, setViewAuth] = useState(() => {
    if (
      typeof window !== "undefined" &&
      window.location.hash.includes("type=recovery")
    ) {
      return "definir";
    }
    return "login";
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: sessaoInicial } }) => {
      setSession(sessaoInicial);
      setCarregandoSessao(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, sessaoNova) => {
      setSession(sessaoNova);
      setCarregandoSessao(false);
      if (event === "PASSWORD_RECOVERY") {
        setViewAuth("definir");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const validacao = validarCamposAuth(email, password, false);
    if (!validacao.valido) {
      notify.error(validacao.mensagem);
      return false;
    }

    // 🚀 Ativa a LoadingScreen imediatamente ao clicar em entrar
    setCarregandoLogin(true);

    // Timer fixo de 5 segundos para a LoadingScreen
    const delayCincoSegundos = new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setCarregandoLogin(false);
        notify.error(traduzirErroSupabase(error));
        return false;
      }

      // Aguarda completar os 5 segundos antes de liberar a tela principal
      await delayCincoSegundos;
      return true;
    } catch (err) {
      notify.error("Erro inesperado ao realizar login.");
      return false;
    } finally {
      setCarregandoLogin(false);
    }
  };

  const cadastro = async (email, password, nome, confirmarSenha) => {
    const validacao = validarCamposAuth(
      email,
      password,
      true,
      nome,
      confirmarSenha
    );
    if (!validacao.valido) {
      notify.error(validacao.mensagem);
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: nome },
        },
      });

      if (error) throw error;

      if (data?.user && data?.user?.identities?.length === 0) {
        notify.error("Este e-mail já está cadastrado no sistema.");
        return false;
      }

      notify.success(
        "Cadastro realizado com sucesso! Verifique o seu e-mail de confirmação."
      );
      setViewAuth("login");
      return true;
    } catch (error) {
      notify.error(`Erro ao cadastrar: ${traduzirErroSupabase(error)}`);
      return false;
    }
  };

  const recuperarSenha = async ({ email: emailRecuperacao }, setCarregando) => {
    if (!emailRecuperacao || !emailRecuperacao.includes("@")) {
      notify.error("Por favor, insira um e-mail válido.");
      setCarregando(false);
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        emailRecuperacao,
        {
          redirectTo: window.location.origin,
        }
      );
      if (error) throw error;
      notify.success(
        "Link de recuperação enviado! Verifique a sua caixa de entrada."
      );
      setViewAuth("login");
    } catch (error) {
      notify.error(traduzirErroSupabase(error));
    } finally {
      setCarregando(false);
    }
  };

  const definirNovaSenha = async (
    { novaSenha, confirmarSenha },
    email,
    setCarregando
  ) => {
    if (novaSenha !== confirmarSenha) {
      notify.error("As senhas digitadas não coincidem!");
      setCarregando(false);
      return;
    }
    const validacao = validarCamposAuth(email, novaSenha, true);
    if (!validacao.valido) {
      notify.error(validacao.mensagem);
      setCarregando(false);
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;
      notify.success(
        "Palavra-passe redefinida com sucesso! Faça login novamente."
      );
      await supabase.auth.signOut();
      setViewAuth("login");
    } catch (error) {
      notify.error(traduzirErroSupabase(error));
    } finally {
      setCarregando(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('boas_vindas_exibido');
    notify.success("Sessão encerrada.");
  };

  return {
    session,
    carregandoSessao,
    carregandoLogin, // 👈 Exportado para uso no App.jsx
    viewAuth,
    setViewAuth,
    login,
    cadastro,
    recuperarSenha,
    definirNovaSenha,
    logout,
  };
}