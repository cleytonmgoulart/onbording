import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "highsoft_session";

function secret() {
  return process.env.AUTH_SECRET || "dev-secret-change-me";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(userId: number) {
  const payload = JSON.stringify({ userId, exp: Date.now() + 1000 * 60 * 60 * 8 });
  const body = Buffer.from(payload).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readSessionToken(token?: string) {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature || sign(body) !== signature) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { userId: number; exp: number };
  if (payload.exp < Date.now()) return null;
  return payload;
}

export async function getCurrentUser() {
  const payload = readSessionToken(cookies().get(COOKIE_NAME)?.value);
  if (!payload) return null;
  return prisma.usuarioInterno.findFirst({ where: { id: payload.userId, ativo: true } });
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado.");
  return user;
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function middlewareIsAuthenticated(request: NextRequest) {
  return Boolean(readSessionToken(request.cookies.get(COOKIE_NAME)?.value));
}
