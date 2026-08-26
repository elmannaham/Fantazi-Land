#!/usr/bin/env node

/**
 * Fantazi-Land — Project Setup Script
 *
 * Initializes the project: creates directories, config files,
 * checks prerequisites, and prepares the dev environment.
 *
 * Usage: node scripts/setup.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

function log(msg) {
  console.log(`${COLORS.green}[setup]${COLORS.reset} ${msg}`);
}
function warn(msg) {
  console.log(`${COLORS.yellow}[warn]${COLORS.reset}  ${msg}`);
}
function err(msg) {
  console.log(`${COLORS.red}[error]${COLORS.reset} ${msg}`);
}
function info(msg) {
  console.log(`${COLORS.cyan}[info]${COLORS.reset}  ${msg}`);
}

// ── Helpers ──────────────────────────────────────────────────────

function commandExists(cmd) {
  try {
    execSync(`where ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    try {
      execSync(`which ${cmd}`, { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }
}

function ensureDir(relative) {
  const abs = path.join(ROOT, relative);
  if (!fs.existsSync(abs)) {
    fs.mkdirSync(abs, { recursive: true });
    log(`Created directory: ${relative}`);
  }
}

function ensureFile(relative, content) {
  const abs = path.join(ROOT, relative);
  if (!fs.existsSync(abs)) {
    fs.writeFileSync(abs, content, "utf-8");
    log(`Created file: ${relative}`);
  } else {
    info(`File already exists: ${relative}`);
  }
}

// ── Step 1: Check prerequisites ─────────────────────────────────

function checkPrerequisites() {
  console.log("");
  log("Checking prerequisites...");

  const checks = [
    { name: "node", label: "Node.js", required: true },
    { name: "npm", label: "npm", required: true },
    { name: "git", label: "Git", required: true },
    { name: "npx", label: "npx", required: true },
  ];

  let allGood = true;

  for (const check of checks) {
    if (commandExists(check.name)) {
      try {
        const version = execSync(`${check.name} --version`, {
          encoding: "utf-8",
        }).trim();
        log(`  ${check.label}: ${version}`);
      } catch {
        log(`  ${check.label}: found`);
      }
    } else if (check.required) {
      err(`  ${check.label}: NOT FOUND (required)`);
      allGood = false;
    } else {
      warn(`  ${check.label}: not found (optional)`);
    }
  }

  // Check Node version
  const nodeVersion = process.versions.node;
  const major = parseInt(nodeVersion.split(".")[0], 10);
  if (major < 18) {
    err(`  Node.js >= 18.17.0 required, found ${nodeVersion}`);
    allGood = false;
  }

  if (!allGood) {
    err("Missing required prerequisites. Please install them and retry.");
    process.exit(1);
  }

  log("All prerequisites satisfied.");
}

// ── Step 2: Create directory structure ──────────────────────────

function createDirectories() {
  console.log("");
  log("Creating directory structure...");

  const dirs = [
    // App directories
    "app/(public)",
    "app/(public)/profiles/[id]",
    "app/(public)/about",
    "app/(dashboard)/dashboard",
    "app/(dashboard)/profile/[id]/edit",
    "app/(dashboard)/gallery",
    "app/(dashboard)/bookings",
    "app/(dashboard)/reviews",
    "app/(dashboard)/settings",
    "app/admin/profiles/create",
    "app/admin/profiles/import-csv",
    "app/admin/failed-syncs",
    "app/admin/logs",
    "app/api/profiles/create",
    "app/api/profiles/update",
    "app/api/profiles/import-csv",
    "app/api/profiles/[id]",
    "app/api/upload",
    "app/api/auth/callback",
    "app/api/auth/logout",
    "app/api/webhooks",

    // Components (Atomic Design)
    "components/atoms",
    "components/molecules",
    "components/organisms",
    "components/sections",
    "components/navigation",
    "components/layout",

    // Lib
    "lib/hooks",
    "lib/utils",
    "lib/store",

    // Supabase
    "supabase/functions/sync-storage-to-db-v2",
    "supabase/functions/sync-db-to-storage",
    "supabase/functions/retry-failed-syncs",

    // Public assets
    "public/images",
    "public/fonts",

    // Styles
    "styles",

    // Tests
    "tests/unit",
    "tests/integration",
    "tests/e2e",

    // Docs
    "docs",

    // Scripts
    "scripts",
  ];

  for (const dir of dirs) {
    ensureDir(dir);
  }

  log("Directory structure created.");
}

// ── Step 3: Create config files ─────────────────────────────────

function createConfigFiles() {
  console.log("");
  log("Creating configuration files...");

  // tsconfig.json
  ensureFile(
    "tsconfig.json",
    JSON.stringify(
      {
        compilerOptions: {
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          plugins: [{ name: "next" }],
          paths: {
            "@/*": ["./*"],
          },
        },
        include: [
          "next-env.d.ts",
          "**/*.ts",
          "**/*.tsx",
          ".next/types/**/*.ts",
        ],
        exclude: ["node_modules"],
      },
      null,
      2
    )
  );

  // next.config.js
  ensureFile(
    "next.config.js",
    `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

module.exports = nextConfig;
`
  );

  // tailwind.config.ts
  ensureFile(
    "tailwind.config.ts",
    `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
`
  );

  // postcss.config.js
  ensureFile(
    "postcss.config.js",
    `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`
  );

  // .prettierrc
  ensureFile(
    ".prettierrc",
    JSON.stringify(
      {
        semi: true,
        trailingComma: "es5",
        singleQuote: false,
        tabWidth: 2,
        printWidth: 100,
        plugins: ["prettier-plugin-tailwindcss"],
      },
      null,
      2
    )
  );

  // .prettierignore
  ensureFile(
    ".prettierignore",
    `node_modules
.next
out
coverage
supabase/.temp
`
  );

  // .eslintrc.json
  ensureFile(
    ".eslintrc.json",
    JSON.stringify(
      {
        extends: ["next/core-web-vitals"],
        rules: {
          "react/no-unescaped-entities": "off",
          "@next/next/no-img-element": "warn",
        },
      },
      null,
      2
    )
  );

  // .gitignore
  ensureFile(
    ".gitignore",
    `# Dependencies
node_modules/
.pnp
.pnp.js

# Next.js
.next/
out/
build/

# Testing
coverage/
test-results/
playwright-report/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Supabase
supabase/.temp/
supabase/.branches/

# Vercel
.vercel

# Misc
*.log
npm-debug.log*
`
  );

  // vitest.config.ts
  ensureFile(
    "vitest.config.ts",
    `import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}", "**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["lib/**/*.ts", "components/**/*.tsx"],
      exclude: ["**/*.test.*", "**/*.d.ts"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
`
  );

  // playwright.config.ts
  ensureFile(
    "playwright.config.ts",
    `import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 14"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
`
  );

  // tests/setup.ts
  ensureFile(
    "tests/setup.ts",
    `import "@testing-library/jest-dom/vitest";
`
  );

  // vercel.json
  ensureFile(
    "vercel.json",
    JSON.stringify(
      {
        framework: "nextjs",
        regions: ["cdg1"],
        headers: [
          {
            source: "/api/(.*)",
            headers: [
              { key: "Cache-Control", value: "no-store, max-age=0" },
            ],
          },
        ],
      },
      null,
      2
    )
  );

  log("Configuration files created.");
}

// ── Step 4: Create starter source files ─────────────────────────

function createStarterFiles() {
  console.log("");
  log("Creating starter source files...");

  // globals.css
  ensureFile(
    "app/globals.css",
    `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
  }

  body {
    @apply bg-white text-gray-900 antialiased;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
`
  );

  // Root layout
  ensureFile(
    "app/layout.tsx",
    `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fantazi-Land | Agence de Créatrices de Contenu",
  description:
    "Découvrez et réservez les meilleures créatrices de contenu pour vos projets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
`
  );

  // Public layout
  ensureFile(
    "app/(public)/layout.tsx",
    `import Navbar from "@/components/navigation/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
`
  );

  // Home page (placeholder)
  ensureFile(
    "app/(public)/page.tsx",
    `export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-20 px-4 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="mb-4 text-5xl font-bold">Fantazi-Land</h1>
          <p className="text-xl opacity-90">
            Découvrez les meilleures créatrices de contenu
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-center text-gray-600">
          Chargement des profils...
        </p>
      </section>
    </main>
  );
}
`
  );

  // Navbar placeholder
  ensureFile(
    "components/navigation/Navbar.tsx",
    `import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold text-purple-600">
          Fantazi-Land
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/about"
            className="text-gray-600 transition-colors hover:text-purple-600"
          >
            À propos
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            Espace Créatrice
          </Link>
        </div>
      </div>
    </nav>
  );
}
`
  );

  // Supabase client
  ensureFile(
    "lib/supabase.ts",
    `import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createServiceClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
`
  );

  // Types
  ensureFile(
    "lib/types.ts",
    `export interface Profile {
  id: string;
  user_id: string | null;
  name: string;
  category: ProfileCategory;
  bio: string | null;
  avatar_url: string | null;
  base_rate: number | null;
  currency: string;
  instagram_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  is_public: boolean;
  is_available: boolean;
  availability_calendar: Record<string, number> | null;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
  storage_folder_id: string | null;
}

export type ProfileCategory =
  | "Photographie"
  | "Vidéographie"
  | "Contenu Mode"
  | "Beauté"
  | "Lifestyle"
  | "Gaming";

export interface PerformanceStats {
  id: string;
  profile_id: string;
  total_projects: number;
  total_reviews: number;
  avg_rating: number;
  response_time_hours: number | null;
  completion_rate: number;
  repeat_client_rate: number;
  last_project_date: string | null;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  profile_id: string;
  file_url: string;
  file_type: "image" | "video" | "document";
  file_size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  profile_id: string;
  client_id: string | null;
  client_name: string | null;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  profile_id: string;
  client_id: string | null;
  client_name: string | null;
  client_email: string | null;
  project_title: string;
  project_description: string | null;
  status: BookingStatus;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  currency: string;
  deliverables: any[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

export type UserRole = "client" | "creator" | "admin";

export interface ProfileWithStats extends Profile {
  performance_stats: PerformanceStats | null;
  reviews?: Review[];
  media_assets?: MediaAsset[];
}
`
  );

  // Constants
  ensureFile(
    "lib/constants.ts",
    `import type { ProfileCategory } from "./types";

export const CATEGORIES: ProfileCategory[] = [
  "Photographie",
  "Vidéographie",
  "Contenu Mode",
  "Beauté",
  "Lifestyle",
  "Gaming",
];

export const CURRENCIES = [
  { value: "EUR", label: "EUR", symbol: "\\u20ac" },
  { value: "USD", label: "USD", symbol: "$" },
  { value: "GBP", label: "GBP", symbol: "\\u00a3" },
] as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  in_progress: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
  disputed: "Litige",
};

export const ITEMS_PER_PAGE = 12;
`
  );

  // next-env.d.ts
  ensureFile(
    "next-env.d.ts",
    `/// <reference types="next" />
/// <reference types="next/image-types/global" />
`
  );

  log("Starter source files created.");
}

// ── Step 5: Create .env.local from .env.example ─────────────────

function createEnvLocal() {
  console.log("");
  const envLocal = path.join(ROOT, ".env.local");
  const envExample = path.join(ROOT, ".env.example");

  if (fs.existsSync(envLocal)) {
    info(".env.local already exists — skipping.");
    return;
  }

  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envLocal);
    log("Created .env.local from .env.example");
    warn("Edit .env.local with your Supabase credentials before running dev server.");
  } else {
    warn(".env.example not found — create .env.local manually.");
  }
}

// ── Step 6: Init git if needed ──────────────────────────────────

function initGit() {
  console.log("");
  const gitDir = path.join(ROOT, ".git");

  if (fs.existsSync(gitDir)) {
    info("Git repository already initialized.");
    return;
  }

  try {
    execSync("git init", { cwd: ROOT, stdio: "pipe" });
    log("Initialized git repository.");
  } catch (e) {
    warn("Could not initialize git repository.");
  }
}

// ── Step 7: Install dependencies ────────────────────────────────

function installDeps() {
  console.log("");
  log("Installing dependencies (this may take a minute)...");

  try {
    execSync("npm install", {
      cwd: ROOT,
      stdio: "inherit",
    });
    log("Dependencies installed successfully.");
  } catch (e) {
    err("npm install failed. Run it manually after fixing any issues.");
  }
}

// ── Main ────────────────────────────────────────────────────────

function main() {
  console.log("");
  console.log(
    `${COLORS.cyan}╔══════════════════════════════════════════════╗${COLORS.reset}`
  );
  console.log(
    `${COLORS.cyan}║     FANTAZI-LAND — Project Setup             ║${COLORS.reset}`
  );
  console.log(
    `${COLORS.cyan}╚══════════════════════════════════════════════╝${COLORS.reset}`
  );

  checkPrerequisites();
  createDirectories();
  createConfigFiles();
  createStarterFiles();
  createEnvLocal();
  initGit();
  installDeps();

  console.log("");
  console.log(
    `${COLORS.green}╔══════════════════════════════════════════════╗${COLORS.reset}`
  );
  console.log(
    `${COLORS.green}║     Setup complete!                          ║${COLORS.reset}`
  );
  console.log(
    `${COLORS.green}╚══════════════════════════════════════════════╝${COLORS.reset}`
  );
  console.log("");
  info("Next steps:");
  console.log("");
  console.log("  1. Edit .env.local with your Supabase credentials");
  console.log("  2. Start Supabase local:  npm run db:start");
  console.log("  3. Run migrations:        npm run db:migrate");
  console.log("  4. Start dev server:      npm run dev");
  console.log("  5. Open browser:          http://localhost:3000");
  console.log("");
  console.log(`${COLORS.dim}  Generate types:   npm run db:types${COLORS.reset}`);
  console.log(`${COLORS.dim}  Run tests:        npm test${COLORS.reset}`);
  console.log(`${COLORS.dim}  Supabase Studio:  npm run db:studio${COLORS.reset}`);
  console.log("");
}

main();
