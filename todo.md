1. Dashboard Visual com Gráficos (A mais pedida! 📊) (feito)

Atualmente, o resumo é exibido apenas em cartões de texto (SummaryCards.jsx). Adicionar gráficos interativos mudaria completamente a experiência do usuário.

    O que fazer: Instalar a biblioteca Recharts (altamente recomendada para React) ou Chart.js.

    Funcionalidade: * Um gráfico de pizza/rosca mostrando a distribuição das despesas por categoria (ex: quanto por % foi para "Alimentação", "Transporte", etc.).

        Um gráfico de barras comparando Entradas vs. Saídas ao longo dos meses.

2. Substituir Input de Categoria por um Dropdown Selecionável (UX 🏷️) (Feito)

No TransactionModal.jsx, o campo de categoria atual é um campo de texto livre (input type="text"). Isso pode fazer com que o usuário digite "Alimentação" em um lançamento e "Alimento" em outro, quebrando os filtros de categoria.

    O que fazer: Transformar esse campo em um <select> ou um componente de Tags com categorias predefinidas (ex: Alimentação, Transporte, Moradia, Lazer, Salário, Investimentos).

    Bônus: Adicionar uma cor ou um mini-ícone para cada categoria (ex: 🛒 Alimentação, 🚗 Transporte).

3. Controle de Orçamentos e Metas por Categoria (Limites de Gastos 🎯)

Ajudar o usuário a não gastar mais do que deve é o objetivo principal de um gestor financeiro.

    O que fazer: Criar uma nova tabela no Supabase chamada metas_orcamento (id, categoria, valor_limite, user_id).

    Funcionalidade: Na tela principal, você pode exibir barras de progresso (estilo o componente CompetenceBar que você já tem, mas para progresso de gastos) mostrando: "Você já gastou R$ 400 de R$ 500 do seu orçamento de Alimentação deste mês".

4. Lançamentos Recorrentes ou Fixos (Automação 🔄)

Muitas contas se repetem todo mês (Netflix, Aluguel, Academia, Salário). É chato ter que digitar tudo manualmente sempre.

    O que fazer: No modal de cadastro, adicionar um checkbox: "Essa despesa se repete?".

    Funcionalidade: Se marcado, você pode salvar um padrão ou criar automaticamente os lançamentos para os próximos meses, ou habilitar um botão de "Duplicar para o próximo mês" diretamente na linha da tabela.

5. Tela de Cadastro de Usuário (Sign Up 🔐)

O código atual do App.jsx mostra o formulário de login ("Acesse sua conta"). Para torná-lo um sistema real onde qualquer pessoa possa se registrar e usar:

    O que fazer: Adicionar um botão no rodapé do login escrito "Não tem uma conta? Cadastre-se" que altera o estado para exibir um formulário de criação de conta usando o método supabase.auth.signUp.

6. Modo Escuro Nativo (Dark Mode 🌙)

Como você já está utilizando o novíssimo Tailwind CSS v4, implementar o Dark Mode é incrivelmente simples e nativo.

    O que fazer: Criar um botão flutuante de "Sol/Lua" no cabeçalho que adiciona ou remove a classe dark na tag <html>. Depois, basta mapear as cores escuras nos seus componentes (ex: className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800").

7. Importação de Extrato Bancário (OFX ou CSV 🏦)

Evita que o usuário precise digitar dezenas de transações que ele fez no cartão de crédito ou débito.

    O que fazer: Adicionar uma área de "Arrastar e soltar arquivo" (Dropzone).

    Funcionalidade: Ler arquivos .csv exportados do banco do usuário via JavaScript, processar as linhas e fazer um bulk insert (inserção em massa) direto na tabela do Supabase.