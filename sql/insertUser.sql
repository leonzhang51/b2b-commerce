INSERT INTO public.users
  (company_id, email, full_name, role, trade_type, location, preferences, permissions, phone, job_title, department, is_active, first_name, last_name)
VALUES
  (NULL, 'zhanglie51@gmail.com', 'Lie Zhang', 'admin', 'manufacturer', 'New York, USA', '{"language":"en","newsletter":true}'::jsonb, ARRAY['read','write']::text[], '555-0101', 'Head of Procurement', 'Purchasing', TRUE, 'Lie', 'Zhang'),
  (NULL, 'leonzhang51@gmail.com', 'Leon Zhang', 'admin', 'distributor', 'Taipei, Taiwan', '{"language":"zh-TW"}'::jsonb, ARRAY['read','write']::text[], '886-912-345-678', 'Operations Manager', 'Operations', TRUE, 'Leon', 'Zhang'),
  (NULL, 'carol@example.com', 'Carol Nguyen', 'buyer', 'retailer', 'Ho Chi Minh City, VN', '{"language":"vi","currency":"VND"}'::jsonb, ARRAY[]::text[], '84-912-345-001', 'Purchasing Agent', 'Purchasing', TRUE, 'Carol', 'Nguyen'),
  (NULL, 'david@example.com', 'David Lee', 'buyer', 'contractor', 'San Francisco, USA', '{"language":"en","newsletter":false}'::jsonb, ARRAY['read']::text[], '555-0202', 'Procurement Specialist', 'Purchasing', TRUE, 'David', 'Lee'),
  (NULL, 'eve@example.com', 'Eve Johnson', 'manager', 'wholesaler', 'London, UK', '{"language":"en","timezone":"Europe/London"}'::jsonb, ARRAY['read','manage_orders']::text[], '44-7700-900123', 'Account Manager', 'Sales', TRUE, 'Eve', 'Johnson')
RETURNING id, email;