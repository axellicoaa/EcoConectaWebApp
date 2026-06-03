import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Leaf, ArrowLeft, Smartphone, BookOpen, Home, Shirt,
  Upload, ImagePlus, X, Euro, MapPin, Check, Sparkles, Gift, Tag,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Label } from '../components/ui/Label'
import { cn } from '../lib/utils'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useListings, useConditions } from '../hooks/useListings'

interface FormState {
  title: string
  description: string
  type: 'donation' | 'sale'
  category_id: string
  price: string
  location: string
  condition_id: string
}

interface ImagePreview {
  url: string
  file: File
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  electronicos: Smartphone,
  libros: BookOpen,
  hogar: Home,
  ropa: Shirt,
}

const COLOR_MAP: Record<string, string> = {
  electronicos: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  libros:       'bg-amber-500/10 text-amber-400 border-amber-500/30',
  hogar:        'bg-purple-500/10 text-purple-400 border-purple-500/30',
  ropa:         'bg-pink-500/10 text-pink-400 border-pink-500/30',
}

function getCategoryColor(slug: string) {
  return COLOR_MAP[slug] ?? 'bg-secondary text-muted-foreground border-border'
}

export default function PublishPage() {
  const navigate    = useNavigate()
  const { user }    = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { categories } = useListings()
  const conditions     = useConditions()

  const [images, setImages]         = useState<ImagePreview[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError]   = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    title:        '',
    description:  '',
    type:         'donation',
    category_id:  '',
    price:        '',
    location:     '',
    condition_id: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const newPreviews: ImagePreview[] = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      file,
    }))
    setImages(prev => [...prev, ...newPreviews].slice(0, 5))
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  function removeImage(index: number) {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // 1. Crear el listing en la DB
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          user_id:      user.id,
          title:        form.title,
          description:  form.description,
          type:         form.type,
          price:        form.type === 'sale' ? parseFloat(form.price) : null,
          category_id:  form.category_id || null,
          condition_id: form.condition_id || null,
          location:     form.location || null,
          status:       'active',
        })
        .select()
        .single()

      if (listingError) throw new Error(listingError.message)

      // 2. Subir imágenes al Storage (si hay)
      if (images.length > 0) {
        const uploadPromises = images.map(async (img, index) => {
          const ext  = img.file.name.split('.').pop()
          const path = `${user.id}/${listing.id}/${index}.${ext}`

          const { error: uploadError } = await supabase.storage
            .from('listing-images')
            .upload(path, img.file, { upsert: true })

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('listing-images')
            .getPublicUrl(path)

          return { listing_id: listing.id, url: publicUrl, order_index: index }
        })

        const imageRecords = await Promise.all(uploadPromises)

        const { error: imagesError } = await supabase
          .from('listing_images')
          .insert(imageRecords)

        if (imagesError) throw new Error(imagesError.message)
      }

      navigate('/')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al publicar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    form.title.trim() &&
    form.description.trim() &&
    form.category_id &&
    form.condition_id &&
    (form.type === 'donation' || form.price)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">EcoConecta</span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Comparte con tu comunidad</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Publicar objeto</h1>
          <p className="text-muted-foreground">Dale una segunda vida a tus objetos compartiéndolos con otros</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Type Selection */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Tipo de publicación</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {(['donation', 'sale'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={cn(
                    'group relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all',
                    form.type === t
                      ? t === 'donation' ? 'border-donation bg-(--donation)/10' : 'border-sale bg-(--sale)/10'
                      : 'border-border hover:border-muted-foreground/50',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
                      form.type === t
                        ? t === 'donation' ? 'bg-donation text-white' : 'bg-sale text-black'
                        : 'bg-secondary text-muted-foreground group-hover:bg-muted',
                    )}
                  >
                    {t === 'donation' ? <Gift className="h-7 w-7" /> : <Tag className="h-7 w-7" />}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{t === 'donation' ? 'Donación' : 'Venta'}</p>
                    <p className="text-sm text-muted-foreground">
                      {t === 'donation' ? 'Regala tu objeto a quien lo necesite' : 'Vende tu objeto a un precio justo'}
                    </p>
                  </div>
                  {form.type === t && (
                    <div className={cn(
                      'absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full',
                      t === 'donation' ? 'bg-donation' : 'bg-sale',
                    )}>
                      <Check className={cn('h-4 w-4', t === 'sale' ? 'text-black' : 'text-white')} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Images */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">
              Fotos <span className="text-sm font-normal text-muted-foreground">(máximo 5)</span>
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {images.map((img, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
                  <img src={img.url} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                      Principal
                    </span>
                  )}
                </div>
              ))}
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/50 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs">Añadir</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </section>

          {/* Details */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Detalles del objeto</h2>
            <div className="space-y-5">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">Título</Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Ej: MacBook Pro 2021, Chaqueta de cuero..."
                  className="mt-1.5 h-12 rounded-xl"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe el estado, características y cualquier detalle relevante..."
                  rows={4}
                  className="mt-1.5 resize-none rounded-xl"
                  required
                />
              </div>

              {form.type === 'sale' && (
                <div>
                  <Label htmlFor="price" className="text-sm font-medium">Precio</Label>
                  <div className="relative mt-1.5">
                    <Euro className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="h-12 rounded-xl pl-12"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="location" className="text-sm font-medium">Ubicación</Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Ej: Madrid Centro, Barcelona..."
                    className="h-12 rounded-xl pl-12"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Category (from DB) */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Categoría</h2>
            {categories.length === 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {categories.map((cat) => {
                  const Icon = ICON_MAP[cat.slug] ?? Smartphone
                  const color = getCategoryColor(cat.slug)
                  const selected = form.category_id === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, category_id: cat.id }))}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                        selected ? `${color} border-current` : 'border-border hover:border-muted-foreground/50',
                      )}
                    >
                      <Icon className={cn('h-6 w-6', !selected && 'text-muted-foreground')} />
                      <span className={cn('text-sm font-medium', !selected && 'text-muted-foreground')}>
                        {cat.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Condition (from DB) */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Estado del objeto</h2>
            {conditions.length === 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-secondary" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {conditions.map((cond) => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, condition_id: cond.id }))}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all',
                      form.condition_id === cond.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50',
                    )}
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                        form.condition_id === cond.id
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/50',
                      )}
                    >
                      {form.condition_id === cond.id && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{cond.name}</p>
                      {cond.description && (
                        <p className="text-sm text-muted-foreground">{cond.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Error */}
          {submitError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 rounded-xl sm:w-auto"
              onClick={() => navigate('/')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="lg"
              className="h-12 gap-2 rounded-xl sm:w-auto"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Publicando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Publicar objeto
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
