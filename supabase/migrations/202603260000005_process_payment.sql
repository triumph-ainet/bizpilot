-- Marks payment confirmed, marks order paid, decrements inventory, and upserts low stock alerts
CREATE OR REPLACE FUNCTION process_payment(txnref text)
RETURNS jsonb AS $$
DECLARE
  p RECORD;
  ord RECORD;
  items jsonb;
BEGIN
  -- lock payment row
  SELECT * INTO p FROM payments WHERE interswitch_reference = txnref FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'no_payment');
  END IF;

  IF p.status = 'confirmed' THEN
    SELECT * INTO ord FROM orders WHERE id = p.order_id;
    SELECT jsonb_agg(jsonb_build_object('product_id', product_id, 'product_name', product_name, 'quantity', quantity, 'unit_price', unit_price)) INTO items
      FROM order_items WHERE order_id = p.order_id;
    RETURN jsonb_build_object('status', 'already_processed', 'order', to_jsonb(ord), 'items', items);
  END IF;

  -- perform transactional updates
  UPDATE payments SET status = 'confirmed', paid_at = now() WHERE interswitch_reference = txnref;
  UPDATE orders SET status = 'paid' WHERE id = p.order_id;

  FOR itm IN SELECT * FROM order_items WHERE order_id = p.order_id LOOP
    UPDATE products SET quantity = GREATEST(0, quantity - itm.quantity) WHERE id = itm.product_id;
  END LOOP;

  INSERT INTO stock_alerts (vendor_id, product_id, product_name, quantity, threshold, resolved, created_at)
  SELECT pr.vendor_id, pr.id, pr.name, pr.quantity, pr.low_stock_threshold, false, now()
  FROM products pr
  WHERE pr.id IN (SELECT product_id FROM order_items WHERE order_id = p.order_id)
    AND pr.quantity <= pr.low_stock_threshold
  ON CONFLICT (product_id) DO UPDATE
    SET quantity = EXCLUDED.quantity, threshold = EXCLUDED.threshold, resolved = false;

  SELECT jsonb_agg(jsonb_build_object('product_id', product_id, 'product_name', product_name, 'quantity', quantity, 'unit_price', unit_price)) INTO items
    FROM order_items WHERE order_id = p.order_id;

  SELECT * INTO ord FROM orders WHERE id = p.order_id;

  RETURN jsonb_build_object('status', 'processed', 'order', to_jsonb(ord), 'items', items);
END;
$$ LANGUAGE plpgsql;
