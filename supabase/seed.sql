-- Seed data: clearly fake placeholders. Replace with real catalog in Phase 7.
-- All prices are TODO(client); these exist only so every screen has data during development.

insert into categories (slug, name_ar, sort) values
  ('non-woven', 'شنط قماش غير منسوج', 1),
  ('kraft', 'شنط كرافت', 2),
  ('storage', 'شنط خزين', 3),
  ('garment', 'أغطية ملابس', 4)
on conflict (slug) do nothing;

-- Products: TODO(client) real names/sizes/colors/prices/MOQ.
insert into products (category_id, slug, name_ar, description_ar, material, min_qty, sizes, handle_types, colors, images, active, sort)
select c.id, v.slug, v.name_ar, v.description_ar, v.material, v.min_qty, v.sizes::jsonb, v.handle_types::jsonb, v.colors::jsonb, '[]'::jsonb, true, v.sort
from categories c
join (values
  ('non-woven','nw-dcut-small','شنطة D-cut صغيرة (نموذج)','TODO(client): وصف','non-woven',100,'[{"w":30,"h":40}]','["d-cut"]','["yellow","orange","black","red","pink","blue","green","white","natural"]',10),
  ('non-woven','nw-loop-medium','شنطة loop handle (نموذج)','TODO(client): وصف','non-woven',100,'[{"w":35,"h":40}]','["loop"]','["yellow","orange","black","red","pink","blue","green","white","natural"]',20),
  ('kraft','kraft-brown-rope','شنطة كرافت بنية (نموذج)','TODO(client): وصف','kraft',50,'[{"w":25,"h":35}]','["rope"]','["brown","white"]',30),
  ('storage','storage-70x60x20','شنطة خزين 70×60×20 (نموذج)','TODO(client): وصف','storage',10,'[{"w":70,"h":60,"d":20}]','["carry"]','["green","blue","gray","red"]',40),
  ('garment','garment-cover-black','غطاء ملابس أسود (نموذج)','TODO(client): وصف','fabric',50,'[{"w":60,"h":120}]','["hanger"]','["black"]',50)
) as v(cat_slug, slug, name_ar, description_ar, material, min_qty, sizes, handle_types, colors, sort)
  on v.cat_slug = c.slug
on conflict (slug) do nothing;

-- Price tiers: TODO(client) real prices. Placeholder values (piasters) for dev only.
insert into price_tiers (product_id, min_qty, unit_price_piasters)
select p.id, t.min_qty, t.price
from products p
join (values
  ('nw-dcut-small',100,15000),
  ('nw-dcut-small',500,12000),
  ('nw-dcut-small',1000,10000),
  ('kraft-brown-rope',50,25000),
  ('kraft-brown-rope',200,20000),
  ('storage-70x60x20',10,45000),
  ('storage-70x60x20',50,40000),
  ('garment-cover-black',50,30000)
) as t(slug, min_qty, price) on t.slug = p.slug
on conflict (product_id, min_qty) do nothing;

-- Config (public subset)
insert into app_config (key, value, is_public) values
  ('whatsapp_number', '"20XXXXXXXXXX"'::jsonb, true),
  ('deposit_percent', '30'::jsonb, true),
  ('order_expiry_hours', '72'::jsonb, true),
  ('requires_manual_quote', 'false'::jsonb, true),
  ('business_hours', '"الأحد–الخميس 9–5"'::jsonb, true)
on conflict (key) do nothing;

-- Portfolio: placeholder (no images yet)
-- insert into portfolio_items (...) values (...);
EOF
echo "seed.sql written"; wc -l supabase/seed.sql