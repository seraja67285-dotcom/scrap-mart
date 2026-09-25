"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession, verifySession } from "@/lib/auth";

const COOKIE = "admin_session";

async function requireAdmin() {
  const store = await cookies();
  if (!verifySession(store.get(COOKIE)?.value)) redirect("/admin/login");
}

export async function login(_prev: { error?: string }, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const okEmail = email === (process.env.ADMIN_EMAIL || "").toLowerCase();
  const okPass = password.length > 0 && password === process.env.ADMIN_PASSWORD;
  if (!okEmail || !okPass) return { error: "Galat email ya password. Dobara try karo." };
  const store = await cookies();
  store.set(COOKIE, createSession(email), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(COOKIE);
  redirect("/admin/login");
}

// Idempotent setup — creates categories + site settings on first run.
// Phone-friendly alternative to running prisma/seed.ts manually.
export async function setupData() {
  await requireAdmin();
  const names = ["Iron Scrap", "Copper Scrap", "Aluminium Scrap", "Steel Scrap", "Brass Scrap", "E-Waste"];
  for (const name of names) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999",
      siteName: "ScrapMart",
    },
  });
  redirect("/admin");
}

export async function addProduct(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const categoryId = String(formData.get("categoryId") || "");
  if (!name || !categoryId) return;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
  await prisma.product.create({
    data: {
      name,
      slug,
      categoryId,
      description: String(formData.get("description") || ""),
      price: String(formData.get("price") || "") || null,
      unit: String(formData.get("unit") || "") || null,
      imageUrl: String(formData.get("imageUrl") || "") || null,
      available: true,
    },
  });
  redirect("/admin");
}

export async function toggleProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const available = String(formData.get("available") || "") === "true";
  if (id) await prisma.product.update({ where: { id }, data: { available } });
  redirect("/admin");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) await prisma.product.delete({ where: { id } });
  redirect("/admin");
}

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  const whatsapp = String(formData.get("whatsappNumber") || "").replace(/\D/g, "");
  const siteName = String(formData.get("siteName") || "").trim() || "ScrapMart";
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: { whatsappNumber: whatsapp, siteName },
    create: { id: "main", whatsappNumber: whatsapp, siteName },
  });
  redirect("/admin");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "NEW");
  if (id) await prisma.order.update({ where: { id }, data: { status } });
  redirect("/admin");
}

export async function deleteOrder(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) await prisma.order.delete({ where: { id } });
  redirect("/admin");
}
