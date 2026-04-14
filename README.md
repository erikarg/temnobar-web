# TemNoBar Web

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

> **Tem no bar? Tem.** O frontend que coloca o cardápio do seu bar na palma da mão.

Interface web para gestão de cardápios de bares, permitindo cadastro, edição e organização de produtos com suporte a imagens, busca e filtros.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS 4 |
| Formulários | React Hook Form + Zod |
| HTTP Client | Axios |
| Autenticação | Cookies httpOnly (via API) |

---

## Início Rápido

### Pré-requisitos

- Node.js 20+
- [TemNoBar API](https://github.com/erikarg/temnobar-api) rodando localmente ou em produção

### Instalação

```bash
# Clone o repositório
git clone https://github.com/erikarg/temnobar-web.git
cd temnobar-web

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | URL base da API (com `/api/v1`) | `http://localhost:3333/api/v1` |

---

## Arquitetura

```
temnobar-web/
├── app/                   # Páginas (App Router)
│   ├── layout.tsx         #   Layout raiz
│   ├── page.tsx           #   Lista de produtos (home)
│   ├── login/             #   Tela de login
│   ├── register/          #   Tela de registro
│   ├── select-bar/        #   Seleção/criação de bar
│   └── products/
│       ├── new/           #   Cadastro de produto
│       └── [id]/edit/     #   Edição de produto
├── components/            # Componentes reutilizáveis
│   ├── ui/                #   Primitivos (Input, Button)
│   ├── Navbar.tsx         #   Barra de navegação
│   ├── ProductCard.tsx    #   Card de produto
│   └── ProductForm.tsx    #   Formulário de produto (criar/editar)
├── hooks/                 # Hooks customizados
│   ├── useAuth.ts         #   Estado de autenticação
│   └── useProducts.ts     #   Listagem com filtros
├── services/              # Camada de comunicação com a API
│   ├── api.ts             #   Instância Axios
│   ├── auth.service.ts    #   Login, registro, logout
│   ├── bar.service.ts     #   Listagem e criação de bares
│   ├── product.service.ts #   CRUD de produtos
│   └── upload.service.ts  #   Upload de imagens
└── types/                 # Definições de tipos
    ├── user.ts
    ├── bar.ts
    └── product.ts
```

---

## Funcionalidades

### Autenticação

- Login e registro com validação de formulário (Zod)
- Sessão via cookies httpOnly gerenciados pela API
- Redirecionamento automático para login quando não autenticado
- Logout com limpeza de cookie

### Seleção de Bar

- Lista de bares disponíveis
- Criação de novo bar com geração automática de slug
- Vinculação do usuário ao bar selecionado

### Catálogo de Produtos

- Listagem em grid responsivo (2/3/4 colunas)
- Busca por descrição em tempo real
- Filtro por status (Ativo / Inativo)
- Contagem total de produtos
- Estado vazio com ação contextual

### CRUD de Produtos

- Formulário de criação e edição com os mesmos componentes
- Upload de imagem com preview instantâneo
- Conversão automática para WebP e geração de thumbnail (via API)
- Exibição de thumbnail no card do produto
- Exclusão com confirmação

### Design

- Paleta moderna com orange como cor primária e grays neutros
- Componentes com sombras sutis, bordas arredondadas e transições
- Cards de produto com indicador visual de status (dot verde/cinza)
- Ações de editar/excluir visíveis no hover
- Layout responsivo e consistente em todas as telas

---

## Páginas

| Rota | Descrição | Autenticação |
|------|-----------|:------------:|
| `/login` | Tela de login | — |
| `/register` | Tela de registro | — |
| `/select-bar` | Seleção ou criação de bar | Cookie |
| `/` | Lista de produtos do bar | Cookie |
| `/products/new` | Cadastro de novo produto | Cookie |
| `/products/:id/edit` | Edição de produto existente | Cookie |

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm start` | Executa o build de produção |
| `npm run lint` | Verifica o código com ESLint |

---

## Licença

Este projeto é de uso pessoal. Consulte o autor para permissões de uso.
