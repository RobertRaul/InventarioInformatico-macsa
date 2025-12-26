import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos de TypeScript
export type Piso = {
  id: string
  nombre: string
  orden: number
  created_at: string
  updated_at: string
}

export type Area = {
  id: string
  piso_id: string
  nombre: string
  created_at: string
  updated_at: string
}

export type Usuario = {
  id: string
  area_id: string
  nombre: string
  activo: boolean
  created_at: string
  updated_at: string
}

export type TipoEquipo = 'computadora' | 'monitor' | 'impresora' | 'scanner' | 'anexo'
export type EstadoEquipo = 'activo' | 'mantenimiento' | 'baja' | 'disponible'

export type CampoPersonalizado = {
  nombre: string
  tipo: 'text' | 'number' | 'select'
  label: string
  opciones?: string[]
}

export type TipoEquipoCustom = {
  id: string
  nombre: string
  descripcion: string | null
  campos_adicionales: CampoPersonalizado[]
  activo: boolean
  created_at: string
  updated_at: string
}

export type Equipo = {
  id: string
  tipo: TipoEquipo | null
  tipo_custom_id: string | null
  usuario_id: string | null
  codigo_barra: string | null
  marca: string | null
  modelo: string | null
  specs: Record<string, any>
  estado: EstadoEquipo
  observaciones: string | null
  created_at: string
  updated_at: string
}

export type Periferico = {
  id: string
  equipo_id: string
  tipo: string
  cantidad: number
  descripcion: string | null
  created_at: string
}

// Tipos con relaciones
export type EquipoConRelaciones = Equipo & {
  usuario: Usuario & {
    area: Area & {
      piso: Piso
    }
  }
  perifericos: Periferico[]
}
