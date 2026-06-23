import { prisma } from "../lib/db";
import { hashPassword } from "../lib/auth";

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@highsoft.com.br";
  const password = process.env.ADMIN_DEFAULT_PASSWORD ?? "admin123";

  await prisma.usuarioInterno.upsert({
    where: { email },
    update: { ativo: true },
    create: {
      nome: "Administrador Highsoft",
      email,
      senhaHash: await hashPassword(password),
      perfil: "admin"
    }
  });

  console.log(`Admin disponível em ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
