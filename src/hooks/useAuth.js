// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { traduzirErroSupabase, validarCamposAuth } from "../utils/AuthHelpers";
import toast from "react-hot-toast";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

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
    // Verifica a sessão atual ao carregar a página
    supabase.auth.getSession().then(({ data: { session: sessaoInicial } }) => {
      setSession(sessaoInicial);
      setCarregandoSessao(false); // Terminou a verificação inicial
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
      toast.error(validacao.mensagem);
      return false;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast.error(traduzirErroSupabase(error));
      return false;
    }
    toast.success("Bem-vindo de volta!");
    return true;
  };

  // Localiza a função cadastro dentro do src/hooks/useAuth.js e substitui por esta:

  const cadastro = async (email, password, nome, confirmarSenha) => {
    const validacao = validarCamposAuth(
      email,
      password,
      true,
      nome,
      confirmarSenha,
    );
    if (!validacao.valido) {
      toast.error(validacao.mensagem);
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: nome }, // Guarda o nome do utilizador nos metadados do Supabase
        },
      });

      if (error) throw error;

      if (data?.user && data?.user?.identities?.length === 0) {
        toast.error("Este e-mail já está cadastrado no sistema.");
        return false;
      }

      toast.success(
        "Cadastro realizado com sucesso! Verifique o seu e-mail de confirmação.",
      );
      setViewAuth("login");
      return true;
    } catch (error) {
      toast.error(`Erro ao cadastrar: ${traduzirErroSupabase(error)}`);
      return false;
    }
  };

  const recuperarSenha = async ({ email: emailRecuperacao }, setCarregando) => {
    if (!emailRecuperacao || !emailRecuperacao.includes("@")) {
      toast.error("Por favor, insira um e-mail válido.");
      setCarregando(false);
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        emailRecuperacao,
        {
          redirectTo: window.location.origin,
        },
      );
      if (error) throw error;
      toast.success(
        "Link de recuperação enviado! Verifique a sua caixa de entrada.",
      );
      setViewAuth("login");
    } catch (error) {
      toast.error(traduzirErroSupabase(error));
    } finally {
      setCarregando(false);
    }
  };

  const definirNovaSenha = async (
    { novaSenha, confirmarSenha },
    email,
    setCarregando,
  ) => {
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas digitadas não coincidem!");
      setCarregando(false);
      return;
    }
    const validacao = validarCamposAuth(email, novaSenha, true);
    if (!validacao.valido) {
      toast.error(validacao.mensagem);
      setCarregando(false);
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;
      toast.success(
        "Palavra-passe redefinida com sucesso! Faça login novamente.",
      );
      await supabase.auth.signOut();
      setViewAuth("login");
    } catch (error) {
      toast.error(traduzirErroSupabase(error));
    } finally {
      setCarregando(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada.");
  };

  return {
    session,
    carregandoSessao,
    viewAuth,
    setViewAuth,
    login,
    cadastro,
    recuperarSenha,
    definirNovaSenha,
    logout,
  };
}
