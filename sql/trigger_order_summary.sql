-- SQL: Automatically sync order_summaries on new order
create or replace function public.handle_new_order_summary()
returns trigger as $$
begin
  insert into public.order_summaries (
    id,
    user_id,
    company_id,
    total,
    currency,
    status,
    created_at,
    item_count
  ) values (
    new.id,
    new.user_id,
    new.company_id,
    new.total,
    new.currency,
    new.status,
    new.created_at,
    (select count(*) from public.order_items where order_id = new.id)
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_order_created_summary on public.orders;
create trigger on_order_created_summary
after insert on public.orders
for each row execute procedure public.handle_new_order_summary();