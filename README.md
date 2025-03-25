# 🤖 botFranco - Guia de Instalação e Uso (Windows) 🚀

Este guia detalha como configurar e executar o projeto `botFranco` no Windows, utilizando Node.js, npm e PM2 para gerenciamento.

## 📌 Pré-requisitos

Antes de começar, certifique-se de ter os seguintes itens instalados:

*   **Node.js e npm:** Essenciais para rodar projetos JavaScript.

## ⚙️ Passo 1: Verificação da Instalação

1.  Abra o Prompt de Comando (cmd).
2.  Execute os seguintes comandos para verificar as versões:

    ```bash
    node -v
    npm -v
    ```

    *   Se ambos os comandos retornarem números de versão, o Node.js e o npm já estão instalados. 🎉
    *   Caso contrário, baixe e instale o Node.js no [site oficial](https://nodejs.org/). O npm é instalado automaticamente com o Node.js.

## ⬇️ Passo 2: Clonagem do Repositório e Instalação das Dependências

1.  Crie uma nova pasta para o projeto (opcional, mas recomendado).
2.  Abra o terminal (cmd ou PowerShell) dentro da pasta.
3.  Clone o repositório:

    ```bash
    git clone https://github.com/EduHort/botFranco.git
    cd botFranco
    ```

4.  Instale as dependências do projeto:

    ```bash
    npm install
    ```

## 📦 Passo 3: Instalação e Uso do PM2

O PM2 é um gerenciador de processos que mantém seu bot rodando em segundo plano.

1.  Instale o PM2 globalmente:

    ```bash
    npm install -g pm2
    ```

2.  **Comandos Essenciais do PM2:**

    *   `pm2 start <arquivo.js> --name "nomeDoProjeto"`: Inicia o projeto com um nome personalizado (ex: `pm2 start index.js --name "botFranco"`).
    *   `pm2 stop nomeDoProjeto`: Para a instância do projeto.
    *   `pm2 restart nomeDoProjeto`: Reinicia a instância do projeto.
    *   `pm2 logs nomeDoProjeto`: Exibe os logs do projeto para monitoramento e debugging.
    *   `pm2 monit`: Abre uma interface de monitoramento em tempo real.

3.  **Inicialização Automática (Opcional):** Para que o projeto inicie automaticamente após reiniciar o PC:

    ```bash
    pm2 startup
    pm2 save
    ```

    Siga as instruções que o `pm2 startup` exibir no seu terminal.

## 🔨 Passo 4: Compilação e Execução do Projeto

1.  Compile o código TypeScript para JavaScript:

    ```bash
    npm run build
    ```

2.  Inicie o projeto com PM2:

    ```bash
    pm2 start index.js --name "botFranco"
    pm2 logs botFranco
    ```

3.  **Autenticação do WhatsApp:** Verifique o QR code no pm2 logs para autenticar o WhatsApp. Se a autenticação falhar:

    *   Exclua as pastas de cache e autenticação:

        ```bash
        pm2 stop botFranco
        rmdir .wwebjs_cache /s /q
        rmdir .wwebjs_auth /s /q
        ```

    *   Reinicie o projeto:

        ```bash
        npm run build
        pm2 start index.js --name "botFranco"
        pm2 logs botFranco
        ```

## 📊 Passo 5: Manipulação do Arquivo Excel

O projeto gera um arquivo Excel (geralmente chamado `respostas.xlsx`) na raiz da pasta. **Importante:**

*   **Não abra o arquivo diretamente na pasta do projeto enquanto o bot estiver rodando**, pois isso pode causar erros de acesso.
*   **Para visualizar os dados:**
    1.  Copie o arquivo para outro local (ex: sua área de trabalho).
    2.  Abra a cópia.

## 🔄 Passo 6: Atualização do Projeto

1.  Pare a execução do projeto antes de atualizar:

    ```bash
    pm2 stop botFranco
    ```

2.  Atualize o repositório:

    ```bash
    git pull origin main
    npm install
    npm run build
    ```

3.  Reinicie o projeto:

    ```bash
    pm2 start index.js --name "botFranco"
    ```

---

Agora seu projeto está configurado e pronto para ser utilizado! 🎉