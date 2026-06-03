import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Leaf, ArrowLeft, User, Mail, Phone, MapPin,
  Save, LogOut, Camera, Check, AtSign,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Label } from '../components/ui/Label'
import { useAuth } from '../context/AuthContext'

interface FormState {
  full_name: string
  username: string
  bio: string
  phone: string
  location: string
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, updateProfile, signOut, loading } = useAuth()
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    full_name: '',
    username:  '',
    bio:       '',
    phone:     '',
    location:  '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name  ?? '',
        username:  profile.username   ?? '',
        bio:       profile.bio        ?? '',
        phone:     profile.phone      ?? '',
        location:  profile.location   ?? '',
      })
    }
  }, [profile])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError(null)
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error } = await updateProfile({
      full_name: form.full_name || null,
      username:  form.username  || null,
      bio:       form.bio       || null,
      phone:     form.phone     || null,
      location:  form.location  || null,
    })
    if (error) {
      setError(error.includes('profiles_username_key') ? 'Ese nombre de usuario ya está en uso' : error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const initials = (profile?.full_name ?? user?.email ?? '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

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

      <main className="mx-auto max-w-2xl px-4 py-8 lg:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Mi perfil</h1>
          <p className="mt-1 text-muted-foreground">Edita tu información personal</p>
        </div>

        {/* Avatar */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
              {initials}
            </div>
            <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-secondary text-muted-foreground transition-colors hover:text-foreground">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="text-center">
            <p className="font-semibold">{profile?.full_name ?? 'Sin nombre'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Account info (readonly) */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Cuenta</h2>
            <div>
              <Label className="text-sm font-medium">Correo electrónico</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={user?.email ?? ''}
                  disabled
                  className="h-12 rounded-xl pl-11 opacity-60"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">El correo no se puede cambiar</p>
            </div>
          </section>

          {/* Personal info */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Información personal</h2>
            <div className="space-y-5">
              <div>
                <Label htmlFor="full_name" className="text-sm font-medium">Nombre completo</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="full_name"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    className="h-12 rounded-xl pl-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="username" className="text-sm font-medium">Nombre de usuario</Label>
                <div className="relative mt-1.5">
                  <AtSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="tu_usuario"
                    className="h-12 rounded-xl pl-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-sm font-medium">Descripción</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Cuéntanos algo sobre ti..."
                  rows={3}
                  className="mt-1.5 resize-none rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Teléfono</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+34 600 000 000"
                    className="h-12 rounded-xl pl-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-sm font-medium">Ubicación</Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Tu ciudad o barrio"
                    className="h-12 rounded-xl pl-11"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 gap-2 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>

            <Button
              type="submit"
              size="lg"
              className="h-12 gap-2 rounded-xl"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Guardando...
                </>
              ) : saved ? (
                <>
                  <Check className="h-4 w-4" />
                  ¡Guardado!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
