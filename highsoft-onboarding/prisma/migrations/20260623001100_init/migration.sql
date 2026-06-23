-- CreateTable
CREATE TABLE "UsuarioInterno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" TEXT NOT NULL DEFAULT 'admin',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "razaoSocial" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "responsavelNome" TEXT NOT NULL,
    "responsavelWhatsapp" TEXT NOT NULL,
    "responsavelEmail" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Onboarding" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clienteId" INTEGER NOT NULL,
    "tokenCliente" TEXT NOT NULL,
    "vendedorResponsavel" TEXT NOT NULL,
    "implantadorResponsavel" TEXT NOT NULL,
    "coordenadorResponsavel" TEXT NOT NULL,
    "analistaDbResponsavel" TEXT NOT NULL,
    "produtoModulosContratados" TEXT NOT NULL,
    "dataVenda" DATETIME,
    "dataEntradaOnboarding" DATETIME,
    "dataOnboarding" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Novo onboarding',
    "prioridade" TEXT NOT NULL DEFAULT 'Normal',
    "risco" TEXT NOT NULL DEFAULT 'Sem risco',
    "motivoRisco" TEXT,
    "proximaAcao" TEXT,
    "dataProximaAcao" DATETIME,
    "observacoesInternas" TEXT,
    "cienciaPrazo" BOOLEAN NOT NULL DEFAULT false,
    "finalizadoCliente" BOOLEAN NOT NULL DEFAULT false,
    "dataFinalizacaoCliente" DATETIME,
    "bloqueadoParaCliente" BOOLEAN NOT NULL DEFAULT false,
    "caminhoPasta" TEXT,
    "clienteResponsavelEnvio" TEXT,
    "clienteWhatsappEnvio" TEXT,
    "clienteEmailEnvio" TEXT,
    "usuariosPerfis" TEXT,
    "informacoesMaquinas" TEXT,
    "observacoesCliente" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Onboarding_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChecklistResposta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "onboardingId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "codigoItem" TEXT NOT NULL,
    "tituloItem" TEXT NOT NULL,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT true,
    "statusCliente" TEXT NOT NULL DEFAULT 'Pendente',
    "observacaoCliente" TEXT,
    "statusHighsoft" TEXT NOT NULL DEFAULT 'Pendente',
    "observacaoHighsoft" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "ChecklistResposta_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "Onboarding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Arquivo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "onboardingId" INTEGER NOT NULL,
    "checklistRespostaId" INTEGER,
    "nomeOriginal" TEXT NOT NULL,
    "nomeSalvo" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "caminhoRelativo" TEXT NOT NULL,
    "statusValidacao" TEXT NOT NULL DEFAULT 'Recebido',
    "observacaoValidacao" TEXT,
    "enviadoPor" TEXT NOT NULL DEFAULT 'cliente',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Arquivo_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "Onboarding" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_checklistRespostaId_fkey" FOREIGN KEY ("checklistRespostaId") REFERENCES "ChecklistResposta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HistoricoStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "onboardingId" INTEGER NOT NULL,
    "statusAnterior" TEXT,
    "statusNovo" TEXT NOT NULL,
    "usuarioId" INTEGER,
    "observacao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoricoStatus_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "Onboarding" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HistoricoStatus_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioInterno" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LogSistema" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "onboardingId" INTEGER,
    "usuarioId" INTEGER,
    "acao" TEXT NOT NULL,
    "detalhes" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LogSistema_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "Onboarding" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LogSistema_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioInterno" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioInterno_email_key" ON "UsuarioInterno"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Onboarding_tokenCliente_key" ON "Onboarding"("tokenCliente");
