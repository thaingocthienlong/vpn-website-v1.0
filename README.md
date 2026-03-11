# SISRD Website (Next.js Rewrite)

Viện Phát triển nguồn lực xã hội Phương Nam - Corporate Website

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **ORM:** Prisma
- **Auth:** Clerk
- **UI:** lucide-react, class-variance-authority

## Getting Started

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Run development server
npm run dev

# Run Chrome DevTools MCP (for AI Assistant)
npm run mcp:chrome
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/             # API Routes
│   ├── (public)/        # Public pages
│   └── admin/           # Admin pages
├── components/
│   ├── ui/              # UI primitives (Button, Card, etc.)
│   ├── layout/          # Header, Footer, Navbar
│   └── sections/        # Homepage sections
├── lib/
│   ├── prisma.ts        # Prisma client
│   └── utils.ts         # Utility functions
├── types/               # TypeScript types
└── hooks/               # Custom React hooks
```

## Database

17 models defined in `prisma/schema.prisma`:
- User, Category, Tag, Post, Page
- Department, StaffType, Staff, Partner
- Course, ContentSection, Registration, ContactForm
- Media, Configuration, HomepageSection, MenuItem

## Status: 🚀 Active Development

### Completed
- [x] Project setup (Next.js 14+)
- [x] Prisma schema (17 models)
- [x] Database migration
- [x] Utility files (prisma client, utils, types)
- [x] UI Components (Claymorphism, Radix UI primitives)
- [x] Public API Routes (12 endpoints)
- [x] Homepage Sections (10 sections)
- [x] Content Pages (News, Courses, Services, Org Structure)
- [x] Admin Panel (CKEditor 5 Integration)

### Next Steps
- [ ] Admin Dashboard (Clerk Auth, Analytics)
- [ ] Contact & About Page Polish
- [ ] Deployment

