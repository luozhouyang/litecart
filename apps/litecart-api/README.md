# Litecart API

Cloudflare Workers-based e-commerce API using Hono, Drizzle ORM, Better Auth, and D1.

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Create D1 Database

```bash
wrangler d1 create litecart-db
```

Copy the returned `database_id` and update `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "litecart-db",
    "database_id": "YOUR_DATABASE_ID_HERE"
  }
]
```

### 3. Generate Better Auth Schema

Better Auth requires using its CLI to generate auth tables:

```bash
npx better-auth generate
```

This will generate the auth schema with tables: `user`, `session`, `account`, `verification`.

### 4. Push Database Schema

```bash
pnpm run db:push
```

### 5. Configure Secrets

Edit `.dev.vars` for local development:

```bash
BETTER_AUTH_SECRET=your-32-character-secret
BETTER_AUTH_URL=http://localhost:8787
```

Generate a secret with:

```bash
openssl rand -base64 32
```

### 6. Create R2 Bucket (for images)

```bash
wrangler r2 bucket create litecart-images
```

### 7. Create Queues

```bash
wrangler queues create order-queue
wrangler queues create email-queue
wrangler queues create webhook-queue
wrangler queues create inventory-queue
```

## Development

```bash
pnpm run dev
```

The API will be available at `http://localhost:8787`.

## API Endpoints

### Admin API (`/api/admin/*`)

- `GET/POST /api/admin/products` - List/Create products
- `GET/PATCH/DELETE /api/admin/products/:id` - Get/Update/Delete product
- `GET/POST /api/admin/categories` - List/Create categories
- `GET/PATCH/DELETE /api/admin/categories/:id` - Get/Update/Delete category
- `GET /api/admin/orders` - List orders
- `GET/PATCH /api/admin/orders/:id` - Get/Update order
- `POST /api/admin/orders/:id/fulfill` - Fulfill order
- `POST /api/admin/orders/:id/refund` - Refund order

### Store API (`/api/store/*`)

- `GET /api/store/products` - List published products
- `GET /api/store/products/:handle` - Get product by handle
- `GET /api/store/categories` - List categories
- `POST/GET /api/store/cart` - Create/Get cart
- `POST /api/store/cart/:id/items` - Add item to cart
- `PATCH/DELETE /api/store/cart/:id/items/:itemId` - Update/Remove item
- `POST /api/store/cart/:id/shipping-address` - Set shipping address
- `POST /api/store/cart/:id/complete` - Complete checkout

### Auth API (`/api/auth/*`)

Better Auth endpoints for authentication.

## Deployment

```bash
# Set production secrets
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put BETTER_AUTH_URL --value https://api.your-domain.com

# Deploy
pnpm run deploy
```

## Project Structure

```
src/
├── db/               # Drizzle ORM setup and schemas
│   ├── index.ts      # Database connection
│   └── schema/       # Table definitions
├── lib/              # Utilities
│   ├── auth.ts       # Better Auth configuration
│   ├── id.ts         # ID generation
│   └── queue.ts      # Queue helpers
├── routes/           # API routes
│   ├── admin/        # Admin endpoints
│   └── store/        # Store endpoints
├── services/         # Business logic
├── validators/       # Zod schemas
├── types/            # TypeScript types
└── index.ts          # Main entry point
```
