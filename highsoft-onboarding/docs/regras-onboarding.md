# Regras do Onboarding

## Fluxo

1. Highsoft cria o onboarding interno.
2. Sistema gera token seguro e link público.
3. Cliente acessa o link, preenche dados e envia arquivos.
4. Highsoft acompanha pendências e valida arquivos.
5. Cliente finaliza o envio.
6. Sistema bloqueia edição e prepara resumos para DB/migração.

## Triagem

A triagem interna confere cliente, CNPJ, responsáveis, produto contratado, prioridade, risco e próxima ação. O status pode evoluir para primeiro contato, kickoff, aguardando documentos, validação e migração.

## Pendências

O checklist oficial tem materiais de validação e pendências técnicas, fiscais, bancárias e de estrutura. Textos antigos que pediam 10 itens foram atualizados para 5 itens.

Itens obrigatórios precisam estar concluídos, enviados, validados ou marcados como não se aplica antes da finalização.

## Envio de arquivos

O upload valida token, onboarding, finalização, extensão, tamanho e nome sanitizado. Arquivos são salvos fisicamente por ano, CNPJ e nome do cliente. O cliente nunca vê caminho absoluto.

## Finalização

Para finalizar, o cliente deve confirmar ciência do prazo e resolver os itens obrigatórios. A finalização gera resumo do cliente, resumo interno e manifest, bloqueia a edição e altera o status para `Documentos enviados - aguardando DB/migração`.

## Critérios para DB/migração

DB/migração deve iniciar quando o status estiver em `Documentos enviados - aguardando DB/migração` ou posterior e quando os resumos em `05_resumos` estiverem disponíveis.
