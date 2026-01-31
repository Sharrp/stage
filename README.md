# Stage
A quickly deployable TS project (docker, Google Cloud) with basic auth and Postgres (Supabase) and Openrouter usage to test various web-app prototypes.

## Getting Started
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Initial project structure

```
stage/
├── app/
│   ├── globals.css       # Global styles and Tailwind imports
│   ├── layout.tsx        # Root layout component
│   └── page.tsx          # Home page component
├── node_modules/
├── .eslintrc.json        # ESLint configuration
├── .gitignore           # Git ignore rules
├── next.config.ts       # Next.js configuration
├── package.json         # Project dependencies and scripts
├── postcss.config.mjs   # PostCSS configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```
