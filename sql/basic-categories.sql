
create table public.categories (
  id bigint not null,
  category_name text null,
  constraint categories_pkey primary key (id)
) TABLESPACE pg_default;