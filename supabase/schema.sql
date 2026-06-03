-- ============================================================
-- EcoConecta – Supabase Schema
-- Ejecuta este archivo completo en SQL Editor de Supabase
-- ============================================================

-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- ── Tabla: profiles ─────────────────────────────────────────
-- Extiende auth.users con datos del perfil de cada usuario
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  username    text unique,
  full_name   text,
  avatar_url  text,
  bio         text,
  phone       text,
  location    text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Tabla: categories ───────────────────────────────────────
-- Categorías de productos (puedes añadir más con INSERT)
create table public.categories (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  slug        text unique not null,
  icon        text,
  created_at  timestamptz default now()
);

-- ── Tabla: conditions ───────────────────────────────────────
-- Estado/condición del producto
create table public.conditions (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  slug        text unique not null,
  description text,
  created_at  timestamptz default now()
);

-- ── Tabla: listings ─────────────────────────────────────────
-- Cada publicación de producto (venta o donación)
create table public.listings (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  title        text not null,
  description  text not null,
  type         text check (type in ('donation', 'sale')) not null,
  price        numeric(10,2),
  category_id  uuid references public.categories(id),
  condition_id uuid references public.conditions(id),
  location     text,
  status       text check (status in ('active', 'reserved', 'completed')) default 'active',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── Tabla: listing_images ────────────────────────────────────
-- Imágenes de cada publicación (hasta 5)
create table public.listing_images (
  id          uuid default uuid_generate_v4() primary key,
  listing_id  uuid references public.listings(id) on delete cascade not null,
  url         text not null,
  order_index integer default 0,
  created_at  timestamptz default now()
);

-- ── Tabla: favorites ────────────────────────────────────────
-- Guardados/likes de usuario
create table public.favorites (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  listing_id  uuid references public.listings(id) on delete cascade not null,
  created_at  timestamptz default now(),
  unique(user_id, listing_id)
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Crea el perfil automáticamente al registrarse un usuario
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Actualiza updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.listings
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.listings        enable row level security;
alter table public.listing_images  enable row level security;
alter table public.favorites       enable row level security;
alter table public.categories      enable row level security;
alter table public.conditions      enable row level security;

-- profiles
create policy "Perfiles visibles para todos"
  on public.profiles for select using (true);

create policy "Usuario actualiza su propio perfil"
  on public.profiles for update using (auth.uid() = id);

-- categories & conditions (solo lectura pública)
create policy "Categorias visibles para todos"
  on public.categories for select using (true);

create policy "Condiciones visibles para todos"
  on public.conditions for select using (true);

-- listings
create policy "Publicaciones activas visibles para todos"
  on public.listings for select using (status = 'active');

create policy "Usuario autenticado puede publicar"
  on public.listings for insert with check (auth.uid() = user_id);

create policy "Usuario actualiza sus publicaciones"
  on public.listings for update using (auth.uid() = user_id);

create policy "Usuario elimina sus publicaciones"
  on public.listings for delete using (auth.uid() = user_id);

-- listing_images
create policy "Imagenes visibles para todos"
  on public.listing_images for select using (true);

create policy "Usuario sube imagenes a sus publicaciones"
  on public.listing_images for insert with check (
    auth.uid() = (select user_id from public.listings where id = listing_id)
  );

create policy "Usuario elimina imagenes de sus publicaciones"
  on public.listing_images for delete using (
    auth.uid() = (select user_id from public.listings where id = listing_id)
  );

-- favorites
create policy "Usuario ve sus favoritos"
  on public.favorites for select using (auth.uid() = user_id);

create policy "Usuario agrega favoritos"
  on public.favorites for insert with check (auth.uid() = user_id);

create policy "Usuario elimina favoritos"
  on public.favorites for delete using (auth.uid() = user_id);

-- ============================================================
-- DATOS INICIALES
-- ============================================================

insert into public.categories (name, slug, icon) values
  ('Electrónicos', 'electronicos', 'Smartphone'),
  ('Libros',       'libros',       'BookOpen'),
  ('Hogar',        'hogar',        'Home'),
  ('Ropa',         'ropa',         'Shirt');

insert into public.conditions (name, slug, description) values
  ('Nuevo',       'nuevo',       'Sin usar, con etiquetas'),
  ('Como nuevo',  'como-nuevo',  'Usado pocas veces'),
  ('Buen estado', 'buen-estado', 'Uso normal, funciona perfecto'),
  ('Aceptable',   'aceptable',   'Desgaste visible pero funcional');

-- ============================================================
-- STORAGE BUCKET
-- Después de ejecutar este SQL, crea el bucket manualmente:
--   Dashboard > Storage > New bucket
--   Nombre: listing-images
--   Public: ON
-- ============================================================
