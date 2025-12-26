"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/dashboard", label: "Inventario" },
    { href: "/registro", label: "Nuevo Equipo" },
    { href: "/registro-multiple", label: "Registro Múltiple" },
    { href: "/reportes", label: "Reportes" },
    { href: "/admin", label: "Administración" },
  ]

  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-xl font-bold">
                Sistema de Inventario
              </div>
            </Link>
            <div className="hidden md:flex space-x-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary-700 text-white"
                      : "text-primary-100 hover:bg-primary-500 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="text-sm text-primary-100">
            Clínica MacSalud
          </div>
        </div>
      </div>
    </nav>
  )
}
