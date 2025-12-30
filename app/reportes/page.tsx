"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { exportToPDF, exportToExcel } from "@/lib/export-utils"

export default function ReportesPage() {
  const [equipos, setEquipos] = useState<any[]>([])
  const [pisos, setPisos] = useState<any[]>([])
  const [areas, setAreas] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [tiposCustom, setTiposCustom] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [filtros, setFiltros] = useState({
    piso_id: "",
    area_id: "",
    usuario_id: "",
    tipo: "",
    estado: ""
  })

  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    porTipo: {} as Record<string, number>,
    porEstado: {} as Record<string, number>,
    porPiso: {} as Record<string, number>
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    cargarEquiposFiltrados()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros])

  function getTipoNombre(equipo: any): string {
    return equipo.tipo_custom?.nombre || equipo.tipo || '-'
  }

  async function cargarDatos() {
    setLoading(true)
    const [equiposRes, pisosRes, areasRes, usuariosRes, tiposCustomRes] = await Promise.all([
      supabase.from('equipos').select(`
        *,
        usuario:usuarios (
          id,
          nombre,
          area:areas (
            id,
            nombre,
            piso:pisos (id, nombre)
          )
        ),
        tipo_custom:tipos_equipos_custom (
          nombre
        ),
        perifericos (tipo, cantidad, descripcion)
      `).order('created_at', { ascending: false }),
      supabase.from('pisos').select('*').order('orden', { ascending: false }),
      supabase.from('areas').select('*, piso:pisos(*)').order('nombre'),
      supabase.from('usuarios').select('*, area:areas(*, piso:pisos(*))').eq('activo', true).order('nombre'),
      supabase.from('tipos_equipos_custom').select('*').eq('activo', true).order('nombre')
    ])

    if (equiposRes.data) setEquipos(equiposRes.data)
    if (pisosRes.data) setPisos(pisosRes.data)
    if (areasRes.data) setAreas(areasRes.data)
    if (usuariosRes.data) setUsuarios(usuariosRes.data)
    if (tiposCustomRes.data) setTiposCustom(tiposCustomRes.data)
    setLoading(false)
  }

  function cargarEquiposFiltrados() {
    let filtrados = [...equipos]

    if (filtros.piso_id) {
      filtrados = filtrados.filter(e => e.usuario?.area?.piso?.id === filtros.piso_id)
    }

    if (filtros.area_id) {
      filtrados = filtrados.filter(e => e.usuario?.area?.id === filtros.area_id)
    }

    if (filtros.usuario_id) {
      filtrados = filtrados.filter(e => e.usuario?.id === filtros.usuario_id)
    }

    if (filtros.tipo) {
      filtrados = filtrados.filter(e => getTipoNombre(e).toLowerCase() === filtros.tipo.toLowerCase())
    }

    if (filtros.estado) {
      filtrados = filtrados.filter(e => e.estado === filtros.estado)
    }

    calcularEstadisticas(filtrados)
  }

  function calcularEstadisticas(equiposFiltrados: any[]) {
    const porTipo: Record<string, number> = {}
    const porEstado: Record<string, number> = {}
    const porPiso: Record<string, number> = {}

    equiposFiltrados.forEach(e => {
      const tipoNombre = getTipoNombre(e)
      porTipo[tipoNombre] = (porTipo[tipoNombre] || 0) + 1
      porEstado[e.estado] = (porEstado[e.estado] || 0) + 1

      const piso = e.usuario?.area?.piso?.nombre || 'Sin asignar'
      porPiso[piso] = (porPiso[piso] || 0) + 1
    })

    setEstadisticas({
      total: equiposFiltrados.length,
      porTipo,
      porEstado,
      porPiso
    })
  }

  function obtenerEquiposFiltrados() {
    let filtrados = [...equipos]

    if (filtros.piso_id) {
      filtrados = filtrados.filter(e => {
        const pisoNombre = pisos.find(p => p.id === filtros.piso_id)?.nombre
        return e.usuario?.area?.piso?.nombre === pisoNombre
      })
    }

    if (filtros.area_id) {
      filtrados = filtrados.filter(e => {
        const areaNombre = areas.find(a => a.id === filtros.area_id)?.nombre
        return e.usuario?.area?.nombre === areaNombre
      })
    }

    if (filtros.usuario_id) {
      filtrados = filtrados.filter(e => e.usuario?.id === filtros.usuario_id)
    }

    if (filtros.tipo) {
      filtrados = filtrados.filter(e => getTipoNombre(e).toLowerCase() === filtros.tipo.toLowerCase())
    }

    if (filtros.estado) {
      filtrados = filtrados.filter(e => e.estado === filtros.estado)
    }

    return filtrados
  }

  function obtenerTextoFiltros() {
    const textos = []

    if (filtros.piso_id) {
      const piso = pisos.find(p => p.id === filtros.piso_id)
      if (piso) textos.push(`Piso: ${piso.nombre}`)
    }

    if (filtros.area_id) {
      const area = areas.find(a => a.id === filtros.area_id)
      if (area) textos.push(`Área: ${area.nombre}`)
    }

    if (filtros.usuario_id) {
      const usuario = usuarios.find(u => u.id === filtros.usuario_id)
      if (usuario) textos.push(`Usuario: ${usuario.nombre}`)
    }

    if (filtros.tipo) {
      textos.push(`Tipo: ${filtros.tipo}`)
    }

    if (filtros.estado) {
      textos.push(`Estado: ${filtros.estado}`)
    }

    return textos.join(', ') || 'Sin filtros'
  }

  function limpiarFiltros() {
    setFiltros({
      piso_id: "",
      area_id: "",
      usuario_id: "",
      tipo: "",
      estado: ""
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gold-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary-600">Generador de Reportes</h1>
          <p className="text-gray-600 mt-1">Exporta reportes personalizados del inventario</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filtros de Reporte</CardTitle>
                <CardDescription>Selecciona los criterios para generar tu reporte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Filtrar por Piso</Label>
                    <Select
                      value={filtros.piso_id}
                      onChange={(e) => setFiltros({ ...filtros, piso_id: e.target.value, area_id: "", usuario_id: "" })}
                    >
                      <option value="">Todos los pisos</option>
                      {pisos.map(piso => (
                        <option key={piso.id} value={piso.id}>{piso.nombre}</option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label>Filtrar por Área</Label>
                    <Select
                      value={filtros.area_id}
                      onChange={(e) => setFiltros({ ...filtros, area_id: e.target.value, usuario_id: "" })}
                    >
                      <option value="">Todas las áreas</option>
                      {areas
                        .filter(a => !filtros.piso_id || a.piso.id === filtros.piso_id)
                        .map(area => (
                          <option key={area.id} value={area.id}>{area.nombre}</option>
                        ))}
                    </Select>
                  </div>

                  <div>
                    <Label>Filtrar por Usuario</Label>
                    <Select
                      value={filtros.usuario_id}
                      onChange={(e) => setFiltros({ ...filtros, usuario_id: e.target.value })}
                    >
                      <option value="">Todos los usuarios</option>
                      {usuarios
                        .filter(u => !filtros.area_id || u.area.id === filtros.area_id)
                        .map(usuario => (
                          <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>
                        ))}
                    </Select>
                  </div>

                  <div>
                    <Label>Filtrar por Tipo</Label>
                    <Select
                      value={filtros.tipo}
                      onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                    >
                      <option value="">Todos los tipos</option>
                      <option value="computadora">Computadora</option>
                      <option value="monitor">Monitor</option>
                      <option value="impresora">Impresora</option>
                      <option value="scanner">Scanner</option>
                      <option value="anexo">Anexo</option>
                      {tiposCustom.map(tipo => (
                        <option key={tipo.id} value={tipo.nombre.toLowerCase()}>
                          {tipo.nombre}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label>Filtrar por Estado</Label>
                    <Select
                      value={filtros.estado}
                      onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                    >
                      <option value="">Todos los estados</option>
                      <option value="activo">Activo</option>
                      <option value="disponible">Disponible</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="baja">Baja</option>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button variant="outline" onClick={limpiarFiltros}>
                    Limpiar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gold-50 border-gold-200">
              <CardHeader>
                <CardTitle>Generar Reporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Filtros aplicados:</strong> {obtenerTextoFiltros()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Total de equipos:</strong> {estadisticas.total}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => exportToExcel(obtenerEquiposFiltrados(), obtenerTextoFiltros())}
                    disabled={estadisticas.total === 0}
                  >
                    Descargar Excel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => exportToPDF(obtenerEquiposFiltrados(), obtenerTextoFiltros())}
                    disabled={estadisticas.total === 0}
                  >
                    Descargar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-primary-600">{estadisticas.total}</p>
                  <p className="text-sm text-gray-600">Equipos totales</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="font-semibold text-sm mb-2">Por Tipo</p>
                  {Object.entries(estadisticas.porTipo).map(([tipo, cantidad]) => (
                    <div key={tipo} className="flex justify-between text-sm py-1">
                      <span className="capitalize">{tipo}</span>
                      <span className="font-semibold">{cantidad}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <p className="font-semibold text-sm mb-2">Por Estado</p>
                  {Object.entries(estadisticas.porEstado).map(([estado, cantidad]) => (
                    <div key={estado} className="flex justify-between text-sm py-1">
                      <span className="capitalize">{estado}</span>
                      <span className="font-semibold">{cantidad}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <p className="font-semibold text-sm mb-2">Por Piso</p>
                  {Object.entries(estadisticas.porPiso).map(([piso, cantidad]) => (
                    <div key={piso} className="flex justify-between text-sm py-1">
                      <span>{piso}</span>
                      <span className="font-semibold">{cantidad}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
