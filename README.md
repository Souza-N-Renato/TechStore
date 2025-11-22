🖥️ TechStore - E-commerce Fullstack

Bem-vindo ao projeto TechStore! Este é um sistema completo de e-commerce de computadores, desenvolvido com React (Frontend), Flask (Backend) e MongoDB (Banco de Dados), totalmente conteinerizado com Docker.

🚀 Pré-requisitos

Antes de começar, você precisa ter instalado na sua máquina:

Docker Desktop (ou Docker Engine no Linux)

Git (opcional, para clonar o repositório)

Nota: Se você usa Windows, certifique-se de que o Docker Desktop está aberto e rodando (ícone da baleia na barra de tarefas).

🛠️ Como Rodar o Projeto

Siga os passos abaixo para iniciar a aplicação:

1. Clonar ou Baixar o Projeto

Se você baixou o arquivo ZIP, extraia-o. Se for clonar via Git:

git clone [https://seu-repositorio.git](https://seu-repositorio.git)
cd nome-da-pasta-do-projeto


2. Iniciar com Docker Compose

Abra o terminal (CMD, PowerShell ou Terminal do VS Code) dentro da pasta raiz do projeto (onde está o arquivo docker-compose.yml) e execute:

docker-compose up --build


up: Sobe os containers.

--build: Garante que as imagens sejam recriadas com as últimas alterações do código.

3. Aguarde a Inicialização

O terminal mostrará vários logs. Aguarde até ver mensagens indicando que o servidor está rodando:

Backend: Running on http://0.0.0.0:5000

Frontend: Compiled successfully!

🌐 Acessando a Aplicação

Com os containers rodando, abra seu navegador e acesse:

Loja (Frontend): http://localhost:3000

API (Backend): http://localhost:5000/products (Para testar se a API responde)

🛑 Comandos Úteis do Docker

Aqui estão os comandos que você mais vai usar no dia a dia:

Ação

Comando

Parar o projeto

Pressione Ctrl + C no terminal onde o docker está rodando.

Parar e remover containers

docker-compose down

Limpar tudo (Resetar Banco)

docker-compose down -v (O -v apaga o volume do banco de dados).

Ver logs de erro

docker logs <id_do_container>

Reiniciar só o backend

docker-compose restart backend

🐛 Solução de Problemas Comuns

1. "Port 3000/5000 is already in use"

Isso significa que outro programa (ou um container antigo) está usando a porta.

Solução: Feche o programa conflitante ou rode docker-compose down para garantir que nada ficou "preso".

2. Erro "Exited (1)" no Backend

Geralmente indica falta de alguma biblioteca Python ou erro de sintaxe.

Solução: Verifique se o arquivo requirements.txt está atualizado e rode docker-compose up --build novamente.

3. Não consigo logar mesmo após cadastrar

O sistema diferencia maiúsculas de minúsculas ou pode haver espaços extras.

Dica: O Backend possui um modo de debug. Tente logar e olhe o terminal do Docker. Ele mostrará mensagens como:

❌ FALHA: Usuário não encontrado.
--- Usuários Existentes no Banco ---
-> Nome: 'joao silva' | Doc: '12345'
