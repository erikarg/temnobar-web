import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const API_BASE = API_URL.replace("/api/v1", "");

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
