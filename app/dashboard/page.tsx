"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { exportToPDF, exportToExcel } from "@/lib/export-utils"

type EquipoCompleto = {
  id: string
  tipo: string
  codigo_barra: string | null
  marca: string | null
  modelo: string | null
  specs: any
  estado: string
  created_at: string
  usuario: {
    nombre: string
    area: {
      nombre: string
      piso: {
        nombre: string
      }
    }
  } | null
  perifericos: Array<{
    tipo: string
    cantidad: number
    descripcion: string | null
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const [equipos, setEquipos] = useState<EquipoCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState("")
  const [filterEstado, setFilterEstado] = useState("")
  const [filterPiso, setFilterPiso] = useState("")

  useEffect(() => {
    cargarEquipos()
  }, [])

  async function cargarEquipos() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('equipos')
        .select(`
          *,
          usuario:usuarios (
            nombre,
            area:areas (
              nombre,
              piso:pisos (
                nombre
              )
            )
          ),
          perifericos (
            tipo,
            cantidad,
            descripcion
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEquipos(data || [])
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar equipos')
    } finally {
      setLoading(false)
    }
  }

  const equiposFiltrados = equipos.filter(equipo => {
    const matchSearch = !searchTerm ||
      equipo.codigo_barra?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase())

    const matchTipo = !filterTipo || equipo.tipo === filterTipo
    const matchEstado = !filterEstado || equipo.estado === filterEstado
    const matchPiso = !filterPiso || equipo.usuario?.area?.piso?.nombre === filterPiso

    return matchSearch && matchTipo && matchEstado && matchPiso
  })

  const pisosUnicos = Array.from(new Set(equipos.map(e => e.usuario?.area?.piso?.nombre).filter(Boolean))) as string[]

  function formatSpecs(specs: any, tipo: string): string {
    if (!specs || Object.keys(specs).length === 0) return '-'

    if (tipo === 'computadora') {
      const parts = []
      if (specs.procesador) parts.push(specs.procesador)
      if (specs.ram) parts.push(specs.ram)
      if (specs.almacenamiento) parts.push(specs.almacenamiento)
      return parts.join(' / ') || '-'
    }

    if (tipo === 'monitor' && specs.pulgadas) {
      return `${specs.pulgadas} pulgadas`
    }

    return '-'
  }

  function formatPerifericos(perifericos: any[]): string {
    if (!perifericos || perifericos.length === 0) return '-'

    return perifericos
      .map(p => {
        if (p.cantidad > 1) return `${p.cantidad} ${p.tipo}`
        return p.tipo
      })
      .join(', ')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gold-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-600">Inventario de Equipos</h1>
            <p className="text-gray-600 mt-1">Gestión de equipos informáticos - Clínica MacSalud</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push('/')}>
              Inicio
            </Button>
            <Button onClick={() => router.push('/registro')}>
              Nuevo Equipo
            </Button>
          </div>
        </div>

        <Card className="mb-6 bg-gold-50 border-gold-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Exportar Reportes</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const filtrosTexto = [
                      searchTerm && `Búsqueda: ${searchTerm}`,
                      filterTipo && `Tipo: ${filterTipo}`,
                      filterEstado && `Estado: ${filterEstado}`,
                      filterPiso && `Piso: ${filterPiso}`
                    ].filter(Boolean).join(', ')

                    exportToExcel(equiposFiltrados, filtrosTexto)
                  }}
                >
                  Exportar Excel
                </Button>
                <Button
                  onClick={() => {
                    const filtrosTexto = [
                      searchTerm && `Búsqueda: ${searchTerm}`,
                      filterTipo && `Tipo: ${filterTipo}`,
                      filterEstado && `Estado: ${filterEstado}`,
                      filterPiso && `Piso: ${filterPiso}`
                    ].filter(Boolean).join(', ')

                    exportToPDF(equiposFiltrados, filtrosTexto)
                  }}
                >
                  Exportar PDF
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              Los reportes se generarán con los filtros actualmente aplicados.
              Total de equipos a exportar: <strong>{equiposFiltrados.length}</strong>
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Buscar por código, marca, modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
                  <option value="">Todos los tipos</option>
                  <option value="computadora">Computadora</option>
                  <option value="monitor">Monitor</option>
                  <option value="impresora">Impresora</option>
                  <option value="scanner">Scanner</option>
                  <option value="anexo">Anexo</option>
                </Select>
              </div>
              <div>
                <Select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                  <option value="">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="disponible">Disponible</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="baja">Baja</option>
                </Select>
              </div>
              <div>
                <Select value={filterPiso} onChange={(e) => setFilterPiso(e.target.value)}>
                  <option value="">Todos los pisos</option>
                  {pisosUnicos.map(piso => (
                    <option key={piso} value={piso}>{piso}</option>
                  ))}
                </Select>
              </div>
            </div>
            {(searchTerm || filterTipo || filterEstado || filterPiso) && (
              <div className="mt-3 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Mostrando {equiposFiltrados.length} de {equipos.length} equipos
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterTipo("")
                    setFilterEstado("")
                    setFilterPiso("")
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando equipos...</p>
          </div>
        ) : equiposFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">
                {equipos.length === 0
                  ? "No hay equipos registrados"
                  : "No se encontraron equipos con los filtros aplicados"}
              </p>
              <Button onClick={() => router.push('/registro')}>
                Registrar primer equipo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Piso</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Área</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Detalles</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Periféricos</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Código</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {equiposFiltrados.map((equipo, index) => (
                    <tr
                      key={equipo.id}
                      className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-4 py-3 text-sm">
                        {equipo.usuario?.area?.piso?.nombre || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {equipo.usuario?.area?.nombre || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                          {equipo.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          {equipo.marca && <div className="font-medium">{equipo.marca}</div>}
                          {equipo.modelo && <div className="text-gray-600">{equipo.modelo}</div>}
                          <div className="text-xs text-gray-500 mt-1">{formatSpecs(equipo.specs, equipo.tipo)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatPerifericos(equipo.perifericos)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {equipo.codigo_barra || 'Sin código'}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {equipo.usuario?.nombre || <span className="text-gray-400">Sin asignar</span>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          equipo.estado === 'activo' ? 'bg-green-100 text-green-800' :
                          equipo.estado === 'disponible' ? 'bg-blue-100 text-blue-800' :
                          equipo.estado === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {equipo.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
