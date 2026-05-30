# 海味轩 (Seafood Shop) — Developer Guide

## Tech Stack
- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS 3.4 + shadcn/ui components
- Prisma 5 + PostgreSQL
- NextAuth.js v5 (Credentials + JWT)
- Zod validation, bcryptjs password hashing
- Lucide React icons

## Project Structure
```
shopping-site-v2/
├── prisma/           # Database schema + seed
├── src/
│   ├── app/
│   │   ├── (shop)/   # Public shop (navbar + footer)
│   │   ├── admin/    # Admin dashboard
│   │   ├── auth/     # Login/register
│   │   └── api/      # API routes
│   ├── components/   # Reusable components
│   ├── hooks/        # Custom hooks (useCart)
│   ├── lib/          # Prisma client, auth, utils, validators
│   └── types/        # TypeScript types
```

## Commands
```
npm run dev          # Start dev server
npm run build        # Production build
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to DB
npm run db:migrate   # Create migration
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## Conventions
- Server Components by default, 'use client' only when needed
- PascalCase for components, camelCase for functions
- kebab-case for files and directories
- Tailwind utility classes over custom CSS
- cn() from @/lib/utils for conditional classes
- Zod for all API input validation
- formatPrice() for all monetary displays
- CATEGORY_LABELS and ORDER_STATUS_LABELS for Chinese labels
- Prisma transactions for multi-table mutations

## Color Tokens
- Primary: ocean-700 (#1a5276)
- Accent (price): #e17055
- Success: #27ae60
- Amber (brand): #d4a574
- See tailwind.config.ts for full palette
