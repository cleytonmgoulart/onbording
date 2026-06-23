import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { comparePassword, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const senha = String(body.senha ?? "");

  const user = await prisma.usuarioInterno.findFirst({ where: { email, ativo: true } });
  if (!user || !(await comparePassword(senha, user.senhaHash))) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, createSessionToken(user.id));
  return response;
}
