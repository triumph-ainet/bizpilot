CREATE OR REPLACE FUNCTION process_payment(txnref text)
RETURNS jsonb AS $$
DECLARE
  p RECORD;
  ord RECORD;
  items jsonb;
BEGIN
  -- lock payment row
  SELECT * INTO p
  FROM payments
  WHERE interswitch_reference = txnref
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'no_payment');
  END IF;

  IF p.order_id IS NULL THEN
    RETURN jsonb_build_object('status', 'invalid_payment_no_order');
  END IF;

  IF p.status = 'confirmed' THEN
    SELECT * INTO ord FROM orders WHERE id = p.order_id;
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'product_id', product_id,
      'product_name', product_name,
      'quantity', quantity,
      'unit_price', unit_price
    )), '[]'::jsonb) INTO items
    FROM order_items WHERE order_id = p.order_id;

    RETURN jsonb_build_object('status', 'already_processed', 'order', to_jsonb(ord), 'items', items);
  END IF;

  -- lock order to avoid concurrent modifications
  SELECT * INTO ord FROM orders WHERE id = p.order_id FOR UPDATE;

  WITH agg AS (
    SELECT product_id, SUM(quantity) AS total_qty
    FROM order_items
    WHERE order_id = p.order_id
    GROUP BY product_id
  ), updated AS (
    UPDATE products pr
    SET quantity = GREATEST(0, pr.quantity - a.total_qty)
    FROM agg a
    WHERE pr.id = a.product_id
    RETURNING pr.id, pr.vendor_id, pr.name AS product_name, pr.quantity, pr.low_stock_threshold
  )

  UPDATE payments SET status = 'confirmed', paid_at = now() WHERE interswitch_reference = txnref;
  UPDATE orders SET status = 'paid' WHERE id = p.order_id;

  INSERT INTO stock_alerts (vendor_id, product_id, product_name, quantity, threshold, resolved, created_at)
  SELECT u.vendor_id, u.id, u.product_name, u.quantity, u.low_stock_threshold, false, now()
  FROM updated u
  WHERE u.quantity <= u.low_stock_threshold
  ON CONFLICT (product_id) DO UPDATE
    SET quantity = EXCLUDED.quantity,
        threshold = EXCLUDED.threshold,
        resolved = false,
        product_name = EXCLUDED.product_name,
        vendor_id = EXCLUDED.vendor_id,
        created_at = EXCLUDED.created_at;

  -- Return final order + items
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'product_id', product_id,
    'product_name', product_name,
    'quantity', quantity,
    'unit_price', unit_price
  )), '[]'::jsonb) INTO items
  FROM order_items WHERE order_id = p.order_id;

  SELECT * INTO ord FROM orders WHERE id = p.order_id;

  RETURN jsonb_build_object('status', 'processed', 'order', to_jsonb(ord), 'items', items);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql;$$ LANGUAGE plpgsql;
