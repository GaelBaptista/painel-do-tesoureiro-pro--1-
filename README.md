# Painel do Tesoureiro Pro

Aplicacao web para gestao financeira, com telas de contas, transacoes, relatorios e configuracoes.

## Requisitos

- Node.js 18+

## Rodar localmente

1. Instale as dependencias:
   `npm install`
2. Inicie o servidor de desenvolvimento:
   `npm run dev`

## Build de producao

`npm run build`

## Deploy (Netlify)

Este projeto ja vem com configuracao automatica para o Netlify.

1. Crie um novo site no Netlify e aponte para o repositorio.
2. O build sera:
   - Build command: `npm run build`
   - Publish directory: `dist`

Se voce precisar de variaveis de ambiente, configure-as no painel do Netlify.
