-- 0) Ensure pgcrypto (for gen_random_uuid) is available (safe to run if already present)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- 1) Insert 5 companies and return their ids and names
INSERT INTO public.companies (id, name, email, phone, address)
VALUES
  (gen_random_uuid(), 'Acme Manufacturing Ltd', 'contact@acmemfg.example', '+1-555-1000', '100 Industrial Rd, New York, NY, USA'),
  (gen_random_uuid(), 'Global Distributors Inc', 'hello@globaldist.example', '+1-555-2000', '200 Commerce St, Los Angeles, CA, USA'),
  (gen_random_uuid(), 'Taipei Supplies Co., Ltd', 'info@taipeisup.example', '+886-2-1234-5678', 'No. 1, Supply Rd, Taipei, Taiwan'),
  (gen_random_uuid(), 'London Wholesalers Ltd', 'sales@londonwholesale.example', '+44-20-7000-9000', '10 King St, London, UK'),
  (gen_random_uuid(), 'Nordic Tools AB', 'support@nordictools.example', '+46-8-700-8000', 'Storgatan 1, Stockholm, Sweden')
RETURNING id, name;

-- 2) Add foreign key constraint on users.company_id referencing companies.id if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
      AND constraint_name = 'users_company_id_fkey'
      AND table_name = 'users'
      AND table_schema = 'public'
  ) THEN
    EXECUTE 'ALTER TABLE public.users
             ADD CONSTRAINT users_company_id_fkey
             FOREIGN KEY (company_id) REFERENCES public.companies(id)';
  END IF;
END
$$;

-- 3) Assign company IDs to specific users by email (adjust emails if your users differ)
--    This uses a subselect by company name; change names/emails as needed.
UPDATE public.users u
SET company_id = c.id
FROM public.companies c
WHERE
  (u.email = 'zhanglie51@gmail.com' AND c.name = 'Acme Manufacturing Ltd')
  OR (u.email = 'leonzhang51@gmail.com' AND c.name = 'Global Distributors Inc')
  OR (u.email = 'carol@example.com' AND c.name = 'Taipei Supplies Co., Ltd')
  OR (u.email = 'david@example.com' AND c.name = 'London Wholesalers Ltd')
  OR (u.email = 'eve@example.com' AND c.name = 'Nordic Tools AB');

COMMIT;

-- 4) Simple verification queries
-- Show inserted companies
SELECT id, name, email, phone, address, created_at FROM public.companies ORDER BY created_at DESC LIMIT 10;

-- Show updated users with their company names
SELECT u.id AS user_id, u.email, u.full_name, u.company_id, c.name AS company_name
FROM public.users u
LEFT JOIN public.companies c ON u.company_id = c.id
WHERE u.email IN ('zhanglie51@gmail.com','leonzhang51@gmail.com','carol@example.com','david@example.com','eve@example.com');