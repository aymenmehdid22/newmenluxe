-- ============================================================
-- 002 — Delivery rates per wilaya, order delivery price,
--       mobile landing image settings + storage bucket.
-- Run in the Supabase SQL Editor (or `supabase db push`) BEFORE deploying
-- the matching code: the orders API now writes orders.delivery_price.
-- ============================================================

-- ---------- 1. Delivery rates (source of truth: DHD Livraison grid) ----------
create table if not exists public.delivery_rates (
  wilaya_code     text primary key check (wilaya_code ~ '^[0-9]{2}$'),
  wilaya_name     text not null,
  home_price      int  check (home_price is null or home_price >= 0),
  stopdesk_price  int  check (stopdesk_price is null or stopdesk_price >= 0),
  notes           text,
  updated_at      timestamptz not null default now()
);

-- NULL price = this delivery method is NOT available for the wilaya
-- (the form disables it and the API rejects it). Edit prices directly in
-- Table Editor; changes are live immediately.
alter table public.delivery_rates enable row level security;

insert into public.delivery_rates (wilaya_code, wilaya_name, home_price, stopdesk_price, notes) values
  ('01','Adrar',1100,600,null),
  ('02','Chlef',700,400,null),
  ('03','Laghouat',900,500,null),
  ('04','Oum El Bouaghi',900,400,null),
  ('05','Batna',900,400,null),
  ('06','Béjaïa',800,400,null),
  ('07','Biskra',900,500,null),
  ('08','Béchar',1000,600,null),
  ('09','Blida',600,400,null),
  ('10','Bouira',700,400,null),
  ('11','Tamanrasset',1100,600,null),
  ('12','Tébessa',1000,400,null),
  ('13','Tlemcen',650,400,null),
  ('14','Tiaret',900,400,null),
  ('15','Tizi Ouzou',700,400,null),
  ('16','Alger',500,400,null),
  ('17','Djelfa',900,500,null),
  ('18','Jijel',800,400,null),
  ('19','Sétif',700,400,null),
  ('20','Saïda',650,400,null),
  ('21','Skikda',800,400,null),
  ('22','Sidi Bel Abbès',500,200,null),
  ('23','Annaba',800,400,null),
  ('24','Guelma',900,400,null),
  ('25','Constantine',800,400,null),
  ('26','Médéa',650,400,null),
  ('27','Mostaganem',650,400,null),
  ('28','M''Sila',900,400,null),
  ('29','Mascara',650,400,null),
  ('30','Ouargla',900,400,null),
  ('31','Oran',650,400,null),
  ('32','El Bayadh',700,500,null),
  ('33','Illizi',1300,500,null),
  ('34','Bordj Bou Arréridj',700,400,null),
  ('35','Boumerdès',700,400,null),
  ('36','El Tarf',900,400,null),
  ('37','Tindouf',1300,600,null),
  ('38','Tissemsilt',800,400,null),
  ('39','El Oued',1000,500,null),
  ('40','Khenchela',900,500,null),
  ('41','Souk Ahras',900,500,null),
  ('42','Tipaza',700,400,null),
  ('43','Mila',800,400,null),
  ('44','Aïn Defla',650,400,null),
  ('45','Naâma',700,500,null),
  ('46','Aïn Témouchent',650,400,null),
  ('47','Ghardaïa',1000,500,null),
  ('48','Relizane',650,400,null),
  ('49','Timimoun',1100,600,null),
  -- 50 / 54 / 56: NOT present in the provided images -> no price invented.
  ('50','Bordj Badji Mokhtar',null,null,'A VÉRIFIER : wilaya absente de la grille DHD fournie (aucun prix).'),
  ('51','Ouled Djellal',900,500,null),
  -- 52 / 57: the grid shows 0 for Bureau/Desk = confirmed by the owner: desk delivery is
  -- disabled there (home delivery only). NULL = unavailable.
  ('52','Béni Abbès',1100,null,'Livraison bureau/desk désactivée (0 dans la grille DHD) : domicile uniquement.'),
  ('53','In Salah',1100,600,null),
  ('54','In Guezzam',null,null,'A VÉRIFIER : wilaya absente de la grille DHD fournie (aucun prix).'),
  ('55','Touggourt',900,500,null),
  ('56','Djanet',null,null,'A VÉRIFIER : wilaya absente de la grille DHD fournie (aucun prix).'),
  ('57','El M''Ghair',900,null,'Livraison bureau/desk désactivée (0 dans la grille DHD) : domicile uniquement.'),
  ('58','El Meniaa',1000,500,null)
on conflict (wilaya_code) do nothing;

-- ---------- 2. Delivery price stored with each order ----------
-- orders.total_price now = unit_price * quantity + delivery_price.
-- Existing orders keep delivery_price = 0, so their totals stay unchanged.
alter table public.orders
  add column if not exists delivery_price int not null default 0 check (delivery_price >= 0);

-- ---------- 3. Mobile landing image settings (one row per product) ----------
create table if not exists public.landing_settings (
  product_id             text primary key,
  mobile_image_enabled   boolean not null default false,
  mobile_image_path      text,
  mobile_image_url       text,
  mobile_image_width     int,
  mobile_image_height    int,
  updated_at             timestamptz not null default now()
);
alter table public.landing_settings enable row level security;

-- ---------- 4. Public storage bucket for the images ----------
-- Reads are public (CDN); writes only happen server-side with the service role
-- (signed upload URLs issued to the authenticated admin).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('landing-images', 'landing-images', true, 10485760,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
