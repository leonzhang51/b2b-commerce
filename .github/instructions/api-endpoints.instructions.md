# API Development Standards

## General

- Use RESTful conventions for endpoints (nouns, plural, e.g., `/products`).
- Use HTTP methods appropriately: GET (read), POST (create), PUT/PATCH (update), DELETE (remove).
- Version APIs (e.g., `/api/v1/products`).

## Request/Response

- Accept and return JSON by default.
- Validate all input data; return clear error messages.
- Use standard HTTP status codes.
- Document all endpoints (OpenAPI/Swagger recommended).

## Authentication & Authorization

- Use JWT or OAuth2 for authentication.
- Protect sensitive endpoints with middleware.
- Never expose secrets or credentials in responses.

## Error Handling

- Return consistent error structures (e.g., `{ error: string }`).
- Log errors server-side; avoid leaking stack traces to clients.

## Rate Limiting & Security

- Implement rate limiting to prevent abuse.
- Sanitize all inputs to prevent injection attacks.

## Example

```http
POST /api/v1/products
Content-Type: application/json

{
  "name": "Widget",
  "price": 19.99
}
```

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.audit_logs (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL,
target_user_id uuid,
action character varying NOT NULL CHECK (action::text = ANY (ARRAY['create'::character varying, 'update'::character varying, 'delete'::character varying, 'login'::character varying, 'logout'::character varying, 'role_change'::character varying, 'impersonate_start'::character varying, 'impersonate_end'::character varying]::text[])),
entity_type character varying NOT NULL CHECK (entity_type::text = ANY (ARRAY['user'::character varying, 'company'::character varying, 'product'::character varying, 'category'::character varying, 'order'::character varying, 'system'::character varying]::text[])),
entity_id uuid,
old_values jsonb,
new_values jsonb,
metadata jsonb,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categories (
id bigint NOT NULL,
category_name text,
CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.companies (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name character varying NOT NULL,
email character varying,
phone character varying,
address text,
created_at timestamp with time zone DEFAULT now(),
deleted_at timestamp with time zone,
deleted_by uuid,
CONSTRAINT companies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.products (
asin text NOT NULL,
title text,
imgUrl text,
productURL text,
stars text,
reviews text,
price text,
listPrice text,
category_id bigint,
isBestSeller boolean,
boughtInLastMonth text,
CONSTRAINT products_pkey PRIMARY KEY (asin),
CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.users (
id uuid NOT NULL DEFAULT gen_random_uuid(),
company_id uuid,
email text NOT NULL UNIQUE,
full_name text,
role text DEFAULT 'buyer'::text CHECK (role = ANY (ARRAY['admin'::text, 'buyer'::text, 'manager'::text])),
trade_type text,
location text,
preferences jsonb,
created_at timestamp with time zone DEFAULT now(),
permissions ARRAY DEFAULT ARRAY[]::text[],
phone text,
job_title text,
department text,
is_active boolean DEFAULT true,
first_name text,
last_name text,
deleted_at timestamp with time zone,
deleted_by uuid,
CONSTRAINT users_pkey PRIMARY KEY (id),
CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
