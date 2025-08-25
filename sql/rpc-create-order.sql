-- RPC: create_order(p_user_id UUID, p_items JSONB, p_currency TEXT)
-- Inserts an order and its items in a single transaction and returns order_id and total
CREATE OR REPLACE FUNCTION public.create_order(
  p_user_id UUID,
  p_items JSONB,
  p_currency TEXT DEFAULT 'USD',
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS TABLE(order_id UUID, total NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ord_id UUID;
  item JSONB;
  item_asin TEXT;
  item_unit NUMERIC;
  item_qty INT;
  line_total NUMERIC;
  prod_price NUMERIC;
  prod_listprice NUMERIC;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;

  -- Create empty order first (total will be updated at the end)
  -- If idempotency key provided, check for existing order and return it
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id, total INTO ord_id, total FROM public.orders WHERE idempotency_key = p_idempotency_key LIMIT 1;
    IF ord_id IS NOT NULL THEN
      order_id := ord_id;
      RETURN NEXT;
      RETURN;
    END IF;
  END IF;

  INSERT INTO public.orders(user_id, total, currency, status, idempotency_key)
  VALUES (p_user_id, 0, p_currency, 'placed', p_idempotency_key)
  RETURNING id INTO ord_id;

  total := 0;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    -- no items, return order with zero total
    UPDATE public.orders SET total = total WHERE id = ord_id;
    order_id := ord_id;
    RETURN NEXT;
    RETURN;
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    item_asin := item ->> 'asin';
    item_unit := NULLIF(item ->> 'unit_price', '')::NUMERIC;
    item_qty := COALESCE(NULLIF(item ->> 'quantity', '')::INT, 1);

    SELECT price, listPrice INTO prod_price, prod_listprice FROM public.products WHERE asin = item_asin LIMIT 1;

    -- decide unit price: product price > listPrice > provided unit_price > 0
    item_unit := COALESCE(prod_price, prod_listprice, item_unit, 0);

    line_total := (item_unit * item_qty)::NUMERIC(12,2);

    INSERT INTO public.order_items(
      order_id, product_asin, sku, name, unit_price, quantity, metadata
    ) VALUES (
      ord_id,
      item_asin,
      item_asin,
      NULLIF(item ->> 'name',''),
      item_unit,
      item_qty,
      item -> 'metadata'
    );

    total := total + line_total;
  END LOOP;

  -- update order total
  UPDATE public.orders SET total = total WHERE id = ord_id;

  order_id := ord_id;
  RETURN NEXT;
END;
$$;

-- Grant execute to authenticated role (Supabase default)
GRANT EXECUTE ON FUNCTION public.create_order(UUID, JSONB, TEXT) TO authenticated;
