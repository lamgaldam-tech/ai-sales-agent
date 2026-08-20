# AI Sales Agent
AI-powered sales automation platform for businesses that communicate with customers through WhatsApp. The application connects business data sources and messaging channels to provide automated, context-aware customer interactions and sales assistance.

## Database

<!-- RLS Policies : SELECT, INSERT, UPDATE, DELETE -->

**businesses** :

- businesses_id uuid NON_NULL (refereence auth.users.id)
- name text NON_NULL
- phone text NON_NULL
- type text NON_NULL
- country text NON_NULL
- currency text NON_NULL
- language text NON_NULL
- plan enum("free", "basic", "pro") NON_NULL
- created_at timestamptz NON_NULL default now()
- updated_at timestamptz NON_NULL default now()

<!-- RLS Policies : SELECT, INSERT, UPDATE, DELETE -->

**prompts** :

- id uuid auto_generated
- businesses_id uuid NON_NULL (refereence businesses.id)
- content text NON_NULL
- created_at timestamptz NON_NULL default now()
- updated_at timestamptz NON_NULL default now()

<!-- RLS Policies : NONE -->

**integrations** :

- id uuid auto_generated
- businesses_id uuid NON_NULL (refereence businesses.id)
- type enum("shopify", "youcan", "google_sheets") NON_NULL
- name text NON_NULL
- identifier text NON_NULL
- access_token NON_NULL
- refresh_token NON_NULL
- created_at timestamptz NON_NULL default now()
- updated_at timestamptz NON_NULL default now()

<!-- RLS Policies : SELECT, INSERT, UPDATE, DELETE -->

**customers** :

- id uuid auto_generated
- businesses_id uuid NON_NULL (refereence businesses.id)
- phone text NON_NULL
- name text
- country text
- city text
- created_at timestamptz NON_NULL default now()
- updated_at timestamptz NON_NULL default now()

<!-- RLS Policies : SELECT, INSERT, UPDATE, DELETE -->

**messages** :

- id uuid auto_generated
- customer_id uuid NON_NULL (refereence customers.id)
- content text NON NULL
- role enum("system", "assistant", "user") NON_NULL
- created_at timestamptz NON_NULL default now()
- updated_at timestamptz NON_NULL default now()

<!-- RLS Policies : SELECT, INSERT, UPDATE, DELETE -->

**orders** :

- id uuid auto_generated
- customer_id uuid NON_NULL (refereence customers.id)
- revenue number NON_NULL default 0
- created_at timestamptz NON_NULL default now()
- updated_at timestamptz NON_NULL default now()

## API

### HOST

**api.ai-sales-ages.com**

### Middleware

**AuthMiddleware**

- Expects a Supabase JWT in the `Authorization` header.
- Format: `Authorization: Bearer <supabase_jwt>`

### Endpoints

- **GET /connection**

```ts
interface Response {
  connected: boolean;
  qr: string;
}
```

- **GET /integrations**

```ts
interface Response {
  integrations: {
    id: string;
    name: string;
    type: "shopify" | "youcan" | "google_sheets";
    connected: boolean;
  }[];
};
```

- **GET /integrations/:type**
```ts
interface Payload {
    // shop name for shopfiy and youcan, spreadsheet id for google sheets
    identifier: string;
};
```

- **GET /products**

```ts
interface Response {
  products: {
    name: string;
    description: string;
    price: number;
    quantity: number;
  };
};
```

- **POST /broadcast**

```ts
interface Payload {
  messages: { phone: string; message: string }[];
};
```
