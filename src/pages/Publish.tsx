import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Leaf,
  ArrowLeft,
  Smartphone,
  BookOpen,
  Home,
  Shirt,
  Upload,
  ImagePlus,
  X,
  Euro,
  MapPin,
  Check,
  Sparkles,
  Gift,
  Tag,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Label } from '../components/ui/Label'
import { cn } from '../lib/utils'

// Types
interface FormState {
  title: string
  description: string
  type: "donation" | "sale"
  category: string
  price: string
  location: string
  condition: string
}

const CATEGORIES = [
  { id: "electronico", label: "Electrónicos", icon: Smartphone, color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  { id: "libro", label: "Libros", icon: BookOpen, color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  { id: "hogar", label: "Hogar", icon: Home, color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  { id: "ropa", label: "Ropa", icon: Shirt, color: "bg-pink-500/10 text-pink-400 border-pink-500/30" },
]

const CONDITIONS = [
  { id: "nuevo", label: "Nuevo", description: "Sin usar, con etiquetas" },
  { id: "como-nuevo", label: "Como nuevo", description: "Usado pocas veces" },
  { id: "buen-estado", label: "Buen estado", description: "Uso normal, funciona perfecto" },
  { id: "aceptable", label: "Aceptable", description: "Desgaste visible pero funcional" },
]

export default function PublishPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    type: "donation",
    category: "",
    price: "",
    location: "",
    condition: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      )
      setImages((prev) => [...prev, ...newImages].slice(0, 5))
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    alert(`Objeto "${form.title}" publicado correctamente`)
    navigate('/')
  }

  const isFormValid =
    form.title.trim() &&
    form.description.trim() &&
    form.category &&
    form.condition &&
    (form.type === "donation" || form.price)

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
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Publicar objeto
          </h1>
          <p className="text-muted-foreground">
            Dale una segunda vida a tus objetos compartiéndolos con otros
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Type Selection */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Tipo de publicación</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: "donation" }))}
                className={cn(
                  "group relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
                  form.type === "donation"
                    ? "border-[var(--donation)] bg-[var(--donation)]/10"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
                    form.type === "donation"
                      ? "bg-[var(--donation)] text-white"
                      : "bg-secondary text-muted-foreground group-hover:bg-muted"
                  )}
                >
                  <Gift className="h-7 w-7" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Donación</p>
                  <p className="text-sm text-muted-foreground">
                    Regala tu objeto a quien lo necesite
                  </p>
                </div>
                {form.type === "donation" && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--donation)]">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: "sale" }))}
                className={cn(
                  "group relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
                  form.type === "sale"
                    ? "border-[var(--sale)] bg-[var(--sale)]/10"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
                    form.type === "sale"
                      ? "bg-[var(--sale)] text-black"
                      : "bg-secondary text-muted-foreground group-hover:bg-muted"
                  )}
                >
                  <Tag className="h-7 w-7" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Venta</p>
                  <p className="text-sm text-muted-foreground">
                    Vende tu objeto a un precio justo
                  </p>
                </div>
                {form.type === "sale" && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--sale)]">
                    <Check className="h-4 w-4 text-black" />
                  </div>
                )}
              </button>
            </div>
          </section>

          {/* Images */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">
              Fotos <span className="text-sm font-normal text-muted-foreground">(máximo 5)</span>
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border"
                >
                  <img
                    src={img}
                    alt={`Preview ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
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
                <Label htmlFor="title" className="text-sm font-medium">
                  Título
                </Label>
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
                <Label htmlFor="description" className="text-sm font-medium">
                  Descripción
                </Label>
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

              {form.type === "sale" && (
                <div>
                  <Label htmlFor="price" className="text-sm font-medium">
                    Precio
                  </Label>
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
                      required={form.type === "sale"}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="location" className="text-sm font-medium">
                  Ubicación
                </Label>
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

          {/* Category */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Categoría</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                    form.category === cat.id
                      ? `${cat.color} border-current`
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <cat.icon
                    className={cn(
                      "h-6 w-6",
                      form.category === cat.id ? "" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      form.category === cat.id ? "" : "text-muted-foreground"
                    )}
                  >
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Condition */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Estado del objeto</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, condition: cond.id }))}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                    form.condition === cond.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      form.condition === cond.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/50"
                    )}
                  >
                    {form.condition === cond.id && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{cond.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {cond.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

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
