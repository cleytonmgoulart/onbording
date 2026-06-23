# Highsoft Onboarding

Sistema de onboarding da Highsoft Sistemas em um único projeto Next.js, com frontend, backend, Prisma, SQLite e upload físico de arquivos.

## Tecnologias

- Next.js com App Router
- TypeScript
- Prisma ORM
- SQLite
- Route Handlers do Next.js
- Upload físico em pasta configurável
- CSS responsivo e empresarial

## Configuração

1. Copie `.env.example` para `.env`.
2. Ajuste `APP_URL`, `DATABASE_URL`, `STORAGE_BASE_PATH`, `MAX_FILE_SIZE_MB`, `ADMIN_EMAIL`, `ADMIN_DEFAULT_PASSWORD` e `AUTH_SECRET`.
3. Instale dependências:

```bash
npm install
```

4. Crie o banco e gere o Prisma Client. Caminho principal:

```bash
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Se o Prisma retornar `Schema engine error` no Windows, use o inicializador fallback do projeto:

```bash
npm run db:init
```

5. Inicie o desenvolvimento:

```bash
npm run dev
```

## Acesso admin

Acesse `/admin/login` e use o e-mail/senha configurados no `.env`. O seed cria o usuário interno com senha hash.

## Fluxo de uso

Na área `/admin`, a equipe Highsoft cria um novo onboarding em `/admin/onboardings/novo`. Ao salvar, o sistema cria o cliente, o onboarding, o token seguro, os itens oficiais do checklist, a pasta física e o link público do cliente.

O link segue o formato:

```text
http://localhost:3000/cliente/{token}
```

O cliente acessa a tela pública, preenche dados, confirma ciência do prazo, envia fotos ou arquivos e finaliza o envio. Após finalizar, a edição fica bloqueada, o status muda para `Documentos enviados - aguardando DB/migração` e são gerados:

- `resumo_cliente.txt`
- `resumo_interno_highsoft.txt`
- `manifest.json`

## Upload e organização

Os arquivos são salvos a partir de `STORAGE_BASE_PATH` nesta estrutura:

```text
{ano}/{cnpj-sanitizado}-{nome-cliente-sanitizado}/
01_materiais_validacao/
02_fiscal_banco_tecnico/
03_usuarios/
04_maquinas/
05_resumos/
06_migracao_db/
```

O nome salvo segue:

```text
AAAA-MM-DD_HH-MM-SS_codigo-do-item_nome-original-sanitizado.ext
```

Extensões permitidas: `.pdf`, `.xml`, `.zip`, `.jpg`, `.jpeg`, `.png`, `.webp`, `.xls`, `.xlsx`, `.csv`, `.txt`, `.doc`, `.docx`.

Extensões executáveis e scripts são recusados.

## Próximas melhorias

- Perfis com permissões mais granulares.
- Notificação automática por e-mail ou WhatsApp.
- Tela dedicada para equipe de DB/migração.
- Auditoria avançada de IP e eventos.
- Exportação de relatórios em PDF.
