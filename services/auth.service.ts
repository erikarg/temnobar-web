import { api } from "./api";
import type { User } from "@/types/user";

type LoginInput = { email: string; password: string };
type RegisterInput = { email: string; password: string; name: string };

export async function login(data: LoginInput): Promise<User> {
  const res = await api.post("/auth/login", data);
  return res.data.user;
}

export async function register(data: RegisterInput): Promise<User> {
  const res = await api.post("/auth/register", data);
  return res.data.user;
}

export async function getMe(): Promise<User> {
  const res = await api.get("/auth/me");
  return res.data.data;
}

export async function selectBar(barId: string): Promise<User> {
  const res = await api.post("/auth/select-bar", { bar_id: barId });
  return res.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout").catch(() => {});
}
