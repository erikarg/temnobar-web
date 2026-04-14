import { api } from "./api";
import type { Bar, CreateBarInput } from "@/types/bar";

export async function getBars(): Promise<Bar[]> {
  const res = await api.get("/bars");
  return res.data.data;
}

export async function createBar(data: CreateBarInput): Promise<Bar> {
  const res = await api.post("/bars", data);
  return res.data.data;
}
