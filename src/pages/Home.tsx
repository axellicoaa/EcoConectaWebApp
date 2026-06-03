import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Leaf, Plus, Smartphone, BookOpen, Home as HomeIcon, Shirt,
  LayoutGrid, Heart, MapPin, Clock, User, Bell, ChevronDown, Sparkles, LogOut,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '../components/ui/DropdownMenu'
import { cn } from '../lib/utils'
import { useListings } from '../hooks/useListings'
import { useAuth } from '../context/AuthContext'
import { filterObjects } from '../utils/ecoHelpers'
import { supabase } from '../lib/supabase'
import type { EcoObject, Category } from '../types'

// Mapa slug → icono (para categorías dinámicas desde DB)
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  electronicos: Smartphone,
  libros: BookOpen,
  hogar: HomeIcon,
  ropa: Shirt,
}

function getCategoryIcon(slug: string) {
  return ICON_MAP[slug] ?? LayoutGrid
}

// ── Header ──────────────────────────────────────────────────────────────────
function AppHeader() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const initials = (profile?.full_name ?? user?.email ?? '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">EcoConecta</span>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Explorar</Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Cómo funciona</Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Comunidad</Button>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="relative hidden sm:flex">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {initials}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">
                      {profile?.full_name?.split(' ')[0] ?? 'Mi cuenta'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/perfil" className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Mi perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/publicar" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Mis publicaciones
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
          )}

          <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to={user ? '/publicar' : '/login'}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Publicar</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection({ search, onSearchChange }: { search: string; onSearchChange: (v: string) => void }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-background pb-12 pt-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">+2,500 objetos disponibles en tu zona</span>
        </div>

        <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Reutiliza, dona y conecta
          <span className="block text-primary">con tu comunidad</span>
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground">
          Dale una segunda vida a tus objetos. Compra, vende o dona productos de forma local y sostenible.
        </p>

        <div className="mx-auto max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar productos, categorías o usuarios..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-14 rounded-2xl border-border bg-card pl-12 pr-4 text-base shadow-lg shadow-black/5 placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function CategoryFilter({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[]
  selected: string
  onSelect: (slug: string) => void
}) {
  const all = [{ id: 'all', name: 'Todos', slug: 'all', icon: 'LayoutGrid', created_at: '' }, ...categories]

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Categorías</h3>
        <nav className="space-y-1">
          {all.map((cat) => {
            const Icon = cat.slug === 'all' ? LayoutGrid : getCategoryIcon(cat.slug)
            return (
              <button
                key={cat.slug}
                onClick={() => onSelect(cat.slug)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all',
                  selected === cat.slug
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
                {cat.name}
              </button>
            )
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <h4 className="mb-4 text-sm font-semibold">Impacto Comunitario</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Objetos reutilizados</span>
              <span className="font-semibold text-primary">1,234</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Donaciones este mes</span>
              <span className="font-semibold text-primary">89</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">CO₂ ahorrado</span>
              <span className="font-semibold text-primary">450kg</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ── Mobile chips ──────────────────────────────────────────────────────────────
function MobileCategoryChips({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[]
  selected: string
  onSelect: (slug: string) => void
}) {
  const all = [{ id: 'all', name: 'Todos', slug: 'all', icon: 'LayoutGrid', created_at: '' }, ...categories]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
      {all.map((cat) => {
        const Icon = cat.slug === 'all' ? LayoutGrid : getCategoryIcon(cat.slug)
        return (
          <button
            key={cat.slug}
            onClick={() => onSelect(cat.slug)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
              selected === cat.slug
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: EcoObject }) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const navigate = useNavigate()

  async function toggleFavorite() {
    if (!user) { navigate('/login'); return }
    if (isLiked) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', product.id)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, listing_id: product.id })
    }
    setIsLiked(v => !v)
  }

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=500&h=350&fit=crop' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <Badge
          className={cn(
            'absolute left-3 top-3 border-0 font-medium',
            product.type === 'donation'
              ? 'bg-[var(--donation)] text-white'
              : 'bg-[var(--sale)] text-black',
          )}
        >
          {product.type === 'donation' ? 'Donación' : 'Venta'}
        </Badge>

        <button
          onClick={toggleFavorite}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50"
        >
          <Heart className={cn('h-5 w-5 transition-colors', isLiked ? 'fill-red-500 text-red-500' : 'text-white')} />
        </button>

        {product.price !== undefined && (
          <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-lg font-bold text-white backdrop-blur-sm">
            €{product.price}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight text-foreground line-clamp-1">{product.title}</h3>
          {product.price === undefined && <span className="shrink-0 text-lg font-bold text-primary">Gratis</span>}
        </div>

        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {product.location}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {product.timeAgo}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-medium">
            {product.seller.name.charAt(0)}
          </div>
          <span className="text-sm text-muted-foreground">{product.seller.name}</span>
        </div>
      </div>
    </article>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const Home: React.FC = () => {
  const { objects, categories, loading, error } = useListings()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = filterObjects(objects, selectedCategory, search)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <HeroSection search={search} onSearchChange={setSearch} />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex gap-8">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          <div className="flex-1">
            <MobileCategoryChips
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Objetos disponibles</h2>
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Cargando...' : `${filtered.length} ${filtered.length === 1 ? 'resultado' : 'resultados'}`}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    Ordenar por <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Más recientes</DropdownMenuItem>
                  <DropdownMenuItem>Precio: menor a mayor</DropdownMenuItem>
                  <DropdownMenuItem>Precio: mayor a menor</DropdownMenuItem>
                  <DropdownMenuItem>Más cercanos</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                Error al cargar: {error}
              </div>
            )}

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 animate-pulse rounded-2xl bg-secondary" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16">
                <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-medium">No se encontraron resultados</h3>
                <p className="text-sm text-muted-foreground">Intenta con otros términos de búsqueda o categorías</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card/50 py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">EcoConecta</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 EcoConecta. Construyendo comunidades sostenibles.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
