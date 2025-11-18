"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { eventConfig } from "@/lib/event-config"
import { supabase, isAdmin } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useSupabaseUser } from "@/hooks/use-supabase-user"

export function Header() {
  const icons = eventConfig.theme.icons
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user } = useSupabaseUser()

  useEffect(() => {
    let isMounted = true

    if (!user) {
      setUserIsAdmin(false)
      return () => {
        isMounted = false
      }
    }

    const checkAdmin = async () => {
      try {
        const admin = await isAdmin(user.id)
        if (isMounted) {
          setUserIsAdmin(admin)
        }
      } catch (error) {
        console.error("Error al verificar admin:", error)
        if (isMounted) {
          setUserIsAdmin(false)
        }
      }
    }

    checkAdmin()

    return () => {
      isMounted = false
    }
  }, [user])

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoggingOut(true)
    
    try {
      setUserIsAdmin(false)

      // Cerrar sesión
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("Error al cerrar sesión:", error)
        // Aún así redirigir
      }
      
      // Redirigir inmediatamente
      window.location.href = "/"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Aún así redirigir
      window.location.href = "/"
    }
  }

  return (
    <header className="relative z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-wider text-white">
            {eventConfig.brand}
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
              Inicio
            </Link>
            {user && (
              <Link href="/tickets" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
                Mis Tickets
              </Link>
            )}
            {user && userIsAdmin && (
              <Link href="/admin" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
                Admin
              </Link>
            )}
            <Link href="#contacto" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
              Contacto
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/60">{user.email}</span>
                <Button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-orange-500 text-black hover:bg-orange-400">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Decorative Icons */}
        <div className="mt-6 flex items-center justify-center gap-8">
          {icons.map((icon, index) => (
            <motion.span
              key={index}
              className="text-2xl opacity-60 transition-all hover:scale-125 hover:opacity-100"
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.span>
          ))}
        </div>
      </div>
    </header>
  )
}
