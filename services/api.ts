import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Falha explicita na inicializacao: sem isso o axios cairia em URLs relativas
// e os erros apareceriam como falhas de rede espalhadas pela aplicacao.
if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL nao configurada. Copie .env.example para .env.",
  );
}

export const API_BASE = API_URL.replace(/\/api\/v\d+\/?$/, "");

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const PUBLIC_PATHS = ["/login", "/register"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/cardapio/");
}

// Sessao expirada volta para o login em vez de virar erro generico na tela.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      const { pathname } = window.location;
      if (!isPublicPath(pathname)) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  },
);
