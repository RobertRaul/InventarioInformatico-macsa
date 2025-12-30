"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase, type Piso, type Area, type Usuario, type TipoEquipo, type EstadoEquipo } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { useConfirm } from "@/components/ui/confirm-dialog"

type TipoCustom = {
  id: string
  nombre: string
  descripcion: string | null
  campos_adicionales: any[]
}

export default function EditarEquipoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [pisos, setPisos] = useState<Piso[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [tiposCustom, setTiposCustom] = useState<TipoCustom[]>([])
  const [filteredAreas, setFilteredAreas] = useState<Area[]>([])
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([])

  const [formData, setFormData] = useState({
    piso_id: "",
    area_id: "",
    usuario_id: "",
    tipo: "computadora",
    codigo_barra: "",
    marca: "",
    modelo: "",
    ram: "",
    almacenamiento: "",
    procesador: "",
    mac: "",
    ip: "",
    anydesk: "",
    pulgadas: "",
    estado: "activo" as EstadoEquipo,
    observaciones: "",
    perifericos: {
      mouse: 0,
      teclado: 0,
      parlantes: 0,
      otros: ""
    }
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    if (formData.piso_id) {
      const areasDelPiso = areas.filter(a => a.piso_id === formData.piso_id)
      setFilteredAreas(areasDelPiso)
    }
  }, [formData.piso_id, areas])

  useEffect(() => {
    if (formData.area_id) {
      const usuariosDelArea = usuarios.filter(u => u.area_id === formData.area_id)
      setFilteredUsuarios(usuariosDelArea)
    }
  }, [formData.area_id, usuarios])

  async function cargarDatos() {
    setLoadingData(true)

    const [equipoRes, pisosRes, areasRes, usuariosRes, tiposCustomRes] = await Promise.all([
      supabase.from('equipos').select(`
        *,
        usuario:usuarios(*, area:areas(*, piso:pisos(*))),
        tipo_custom:tipos_equipos_custom(*),
        perifericos(*)
      `).eq('id', params.id).single(),
      supabase.from('pisos').select('*').order('orden', { ascending: false }),
      supabase.from('areas').select('*').order('nombre'),
      supabase.from('usuarios').select('*, area:areas(*)').eq('activo', true).order('nombre'),
      supabase.from('tipos_equipos_custom').select('*').eq('activo', true).order('nombre')
    ])

    if (pisosRes.data) setPisos(pisosRes.data)
    if (areasRes.data) setAreas(areasRes.data)
    if (usuariosRes.data) setUsuarios(usuariosRes.data)
    if (tiposCustomRes.data) setTiposCustom(tiposCustomRes.data)

    if (equipoRes.data) {
      const equipo = equipoRes.data
      const perifericos = equipo.perifericos || []

      // Determinar el tipo (estándar o personalizado)
      const tipoValue = equipo.tipo || equipo.tipo_custom?.nombre.toLowerCase() || "computadora"

      setFormData({
        piso_id: equipo.usuario?.area?.piso?.id || "",
        area_id: equipo.usuario?.area?.id || "",
        usuario_id: equipo.usuario_id || "",
        tipo: tipoValue,
        codigo_barra: equipo.codigo_barra || "",
        marca: equipo.marca || "",
        modelo: equipo.modelo || "",
        ram: equipo.specs?.ram || "",
        almacenamiento: equipo.specs?.almacenamiento || "",
        procesador: equipo.specs?.procesador || "",
        mac: equipo.specs?.mac || "",
        ip: equipo.specs?.ip || "",
        anydesk: equipo.specs?.anydesk || "",
        pulgadas: equipo.specs?.pulgadas || "",
        estado: equipo.estado,
        observaciones: equipo.observaciones || "",
        perifericos: {
          mouse: perifericos.find((p: any) => p.tipo === 'mouse')?.cantidad || 0,
          teclado: perifericos.find((p: any) => p.tipo === 'teclado')?.cantidad || 0,
          parlantes: perifericos.find((p: any) => p.tipo === 'parlantes')?.cantidad || 0,
          otros: perifericos.find((p: any) => p.tipo === 'otros')?.descripcion || ""
        }
      })
    }

    setLoadingData(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const specs: Record<string, any> = {}

      if (formData.tipo === 'computadora') {
        if (formData.procesador) specs.procesador = formData.procesador
        if (formData.ram) specs.ram = formData.ram
        if (formData.almacenamiento) specs.almacenamiento = formData.almacenamiento
        if (formData.mac) specs.mac = formData.mac
        if (formData.ip) specs.ip = formData.ip
        if (formData.anydesk) specs.anydesk = formData.anydesk
      } else if (formData.tipo === 'monitor') {
        if (formData.pulgadas) specs.pulgadas = formData.pulgadas
      }

      // Verificar si es un tipo personalizado
      const tiposEstandar = ['computadora', 'monitor', 'impresora', 'scanner', 'anexo']
      const esTipoCustom = !tiposEstandar.includes(formData.tipo)
      const tipoCustom = esTipoCustom ? tiposCustom.find(t => t.nombre.toLowerCase() === formData.tipo) : null

      const equipoData: any = {
        usuario_id: formData.usuario_id || null,
        codigo_barra: formData.codigo_barra || null,
        marca: formData.marca || null,
        modelo: formData.modelo || null,
        specs,
        estado: formData.estado,
        observaciones: formData.observaciones || null
      }

      if (esTipoCustom && tipoCustom) {
        // Si es tipo personalizado, usar tipo_custom_id y poner NULL en tipo
        equipoData.tipo = null
        equipoData.tipo_custom_id = tipoCustom.id
      } else {
        // Si es tipo estándar, usar el campo tipo
        equipoData.tipo = formData.tipo
        equipoData.tipo_custom_id = null
      }

      const { error: equipoError } = await supabase
        .from('equipos')
        .update(equipoData)
        .eq('id', params.id)

      if (equipoError) throw equipoError

      await supabase.from('perifericos').delete().eq('equipo_id', params.id)

      if (formData.tipo === 'computadora') {
        const perifericos = []
        if (formData.perifericos.mouse > 0) {
          perifericos.push({
            equipo_id: params.id,
            tipo: 'mouse',
            cantidad: formData.perifericos.mouse
          })
        }
        if (formData.perifericos.teclado > 0) {
          perifericos.push({
            equipo_id: params.id,
            tipo: 'teclado',
            cantidad: formData.perifericos.teclado
          })
        }
        if (formData.perifericos.parlantes > 0) {
          perifericos.push({
            equipo_id: params.id,
            tipo: 'parlantes',
            cantidad: formData.perifericos.parlantes
          })
        }
        if (formData.perifericos.otros) {
          perifericos.push({
            equipo_id: params.id,
            tipo: 'otros',
            cantidad: 1,
            descripcion: formData.perifericos.otros
          })
        }

        if (perifericos.length > 0) {
          const { error: perifericosError } = await supabase
            .from('perifericos')
            .insert(perifericos)

          if (perifericosError) throw perifericosError
        }
      }

      showToast('Equipo actualizado exitosamente', 'success')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error:', error)
      showToast(error.message || 'Error al actualizar el equipo', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: '¿Eliminar equipo?',
      description: 'Esta acción eliminará el equipo permanentemente. No se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'destructive'
    })
    if (!confirmed) return

    setLoading(true)
    try {
      const { error } = await supabase.from('equipos').delete().eq('id', params.id)
      if (error) throw error

      showToast('Equipo eliminado exitosamente', 'success')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error:', error)
      showToast(error.message || 'Error al eliminar el equipo', 'error')
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gold-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">Cargando equipo...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gold-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-primary-600">Editar Equipo</CardTitle>
            <CardDescription>Modifica la información del equipo o elimínalo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="piso">Piso *</Label>
                  <Select
                    id="piso"
                    required
                    value={formData.piso_id}
                    onChange={(e) => setFormData({ ...formData, piso_id: e.target.value, area_id: "", usuario_id: "" })}
                  >
                    <option value="">Seleccione...</option>
                    {pisos.map(piso => (
                      <option key={piso.id} value={piso.id}>{piso.nombre}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="area">Área *</Label>
                  <Select
                    id="area"
                    required
                    value={formData.area_id}
                    onChange={(e) => setFormData({ ...formData, area_id: e.target.value, usuario_id: "" })}
                    disabled={!formData.piso_id}
                  >
                    <option value="">Seleccione...</option>
                    {filteredAreas.map(area => (
                      <option key={area.id} value={area.id}>{area.nombre}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="usuario">Usuario</Label>
                  <Select
                    id="usuario"
                    value={formData.usuario_id}
                    onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
                    disabled={!formData.area_id}
                  >
                    <option value="">Sin asignar</option>
                    {filteredUsuarios.map(usuario => (
                      <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo de Equipo *</Label>
                  <Select
                    id="tipo"
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
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
                  <Label htmlFor="codigo">Código de Barra</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo_barra}
                    onChange={(e) => setFormData({ ...formData, codigo_barra: e.target.value })}
                    placeholder="XEADSSDEF774"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marca">Marca</Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  />
                </div>
              </div>

              {formData.tipo === 'computadora' && (
                <>
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor="procesador">Procesador</Label>
                        <Input
                          id="procesador"
                          value={formData.procesador}
                          onChange={(e) => setFormData({ ...formData, procesador: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ram">RAM</Label>
                        <Input
                          id="ram"
                          value={formData.ram}
                          onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="almacenamiento">Almacenamiento</Label>
                        <Input
                          id="almacenamiento"
                          value={formData.almacenamiento}
                          onChange={(e) => setFormData({ ...formData, almacenamiento: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="mac">Dirección MAC</Label>
                        <Input
                          id="mac"
                          value={formData.mac}
                          onChange={(e) => setFormData({ ...formData, mac: e.target.value })}
                          placeholder="00:1A:2B:3C:4D:5E"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ip">Dirección IP</Label>
                        <Input
                          id="ip"
                          value={formData.ip}
                          onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                          placeholder="192.168.1.100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="anydesk">AnyDesk</Label>
                        <Input
                          id="anydesk"
                          value={formData.anydesk}
                          onChange={(e) => setFormData({ ...formData, anydesk: e.target.value })}
                          placeholder="123 456 789"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gold-50 rounded-lg">
                    <h3 className="font-semibold mb-3 text-gold-800">Periféricos</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="mouse">Mouse</Label>
                        <Input
                          id="mouse"
                          type="number"
                          min="0"
                          value={formData.perifericos.mouse}
                          onChange={(e) => setFormData({
                            ...formData,
                            perifericos: { ...formData.perifericos, mouse: parseInt(e.target.value) || 0 }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="teclado">Teclado</Label>
                        <Input
                          id="teclado"
                          type="number"
                          min="0"
                          value={formData.perifericos.teclado}
                          onChange={(e) => setFormData({
                            ...formData,
                            perifericos: { ...formData.perifericos, teclado: parseInt(e.target.value) || 0 }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="parlantes">Parlantes</Label>
                        <Input
                          id="parlantes"
                          type="number"
                          min="0"
                          value={formData.perifericos.parlantes}
                          onChange={(e) => setFormData({
                            ...formData,
                            perifericos: { ...formData.perifericos, parlantes: parseInt(e.target.value) || 0 }
                          })}
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label htmlFor="otros">Otros periféricos</Label>
                      <Input
                        id="otros"
                        value={formData.perifericos.otros}
                        onChange={(e) => setFormData({
                          ...formData,
                          perifericos: { ...formData.perifericos, otros: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.tipo === 'monitor' && (
                <div className="p-4 bg-primary-50 rounded-lg">
                  <Label htmlFor="pulgadas">Pulgadas</Label>
                  <Input
                    id="pulgadas"
                    value={formData.pulgadas}
                    onChange={(e) => setFormData({ ...formData, pulgadas: e.target.value })}
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoEquipo })}
                  >
                    <option value="activo">Activo</option>
                    <option value="disponible">Disponible</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="baja">Baja</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Input
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-between pt-4 border-t">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Eliminar Equipo
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : 'Actualizar Equipo'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
