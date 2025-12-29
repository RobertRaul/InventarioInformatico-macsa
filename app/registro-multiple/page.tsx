"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase, type Piso, type Area, type Usuario, type TipoEquipo, type EstadoEquipo } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

type EquipoFormData = {
  id: string
  tipo: TipoEquipo
  codigo_barra: string
  marca: string
  modelo: string
  ram: string
  almacenamiento: string
  procesador: string
  mac: string
  pulgadas: string
  estado: EstadoEquipo
  observaciones: string
  perifericos: {
    mouse: number
    teclado: number
    parlantes: number
    otros: string
  }
}

export default function RegistroMultiplePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pisos, setPisos] = useState<Piso[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filteredAreas, setFilteredAreas] = useState<Area[]>([])
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([])
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false)
  const [newUserData, setNewUserData] = useState({ nombre: "" })

  const [ubicacion, setUbicacion] = useState({
    piso_id: "",
    area_id: "",
    usuario_id: "",
  })

  const [equipos, setEquipos] = useState<EquipoFormData[]>([
    {
      id: crypto.randomUUID(),
      tipo: "computadora",
      codigo_barra: "",
      marca: "",
      modelo: "",
      ram: "",
      almacenamiento: "",
      procesador: "",
      mac: "",
      pulgadas: "",
      estado: "activo",
      observaciones: "",
      perifericos: {
        mouse: 0,
        teclado: 0,
        parlantes: 0,
        otros: ""
      }
    }
  ])

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    if (ubicacion.piso_id) {
      const areasDelPiso = areas.filter(a => a.piso_id === ubicacion.piso_id)
      setFilteredAreas(areasDelPiso)
      setUbicacion(prev => ({ ...prev, area_id: "", usuario_id: "" }))
    }
  }, [ubicacion.piso_id, areas])

  useEffect(() => {
    if (ubicacion.area_id) {
      const usuariosDelArea = usuarios.filter(u => u.area_id === ubicacion.area_id)
      setFilteredUsuarios(usuariosDelArea)
      setUbicacion(prev => ({ ...prev, usuario_id: "" }))
    }
  }, [ubicacion.area_id, usuarios])

  async function cargarDatos() {
    const [pisosRes, areasRes, usuariosRes] = await Promise.all([
      supabase.from('pisos').select('*').order('orden', { ascending: false }),
      supabase.from('areas').select('*').order('nombre'),
      supabase.from('usuarios').select('*').eq('activo', true).order('nombre')
    ])

    if (pisosRes.data) setPisos(pisosRes.data)
    if (areasRes.data) setAreas(areasRes.data)
    if (usuariosRes.data) setUsuarios(usuariosRes.data)
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()

    if (!ubicacion.area_id) {
      alert('Por favor selecciona un área primero')
      return
    }

    try {
      const { data: newUser, error } = await supabase
        .from('usuarios')
        .insert({
          nombre: newUserData.nombre,
          area_id: ubicacion.area_id,
          activo: true
        })
        .select()
        .single()

      if (error) throw error

      setUsuarios([...usuarios, newUser])
      setFilteredUsuarios([...filteredUsuarios, newUser])
      setUbicacion({ ...ubicacion, usuario_id: newUser.id })
      setNewUserDialogOpen(false)
      setNewUserData({ nombre: "" })
      alert('Usuario creado exitosamente')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear el usuario')
    }
  }

  function agregarEquipo() {
    setEquipos([...equipos, {
      id: crypto.randomUUID(),
      tipo: "computadora",
      codigo_barra: "",
      marca: "",
      modelo: "",
      ram: "",
      almacenamiento: "",
      procesador: "",
      mac: "",
      pulgadas: "",
      estado: "activo",
      observaciones: "",
      perifericos: {
        mouse: 0,
        teclado: 0,
        parlantes: 0,
        otros: ""
      }
    }])
  }

  function eliminarEquipo(id: string) {
    if (equipos.length === 1) {
      alert("Debe haber al menos un equipo")
      return
    }
    setEquipos(equipos.filter(e => e.id !== id))
  }

  function actualizarEquipo(id: string, campo: string, valor: any) {
    setEquipos(equipos.map(e =>
      e.id === id ? { ...e, [campo]: valor } : e
    ))
  }

  function actualizarPeriferico(id: string, campo: string, valor: any) {
    setEquipos(equipos.map(e =>
      e.id === id ? { ...e, perifericos: { ...e.perifericos, [campo]: valor } } : e
    ))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      for (const equipo of equipos) {
        const specs: Record<string, any> = {}

        if (equipo.tipo === 'computadora') {
          if (equipo.procesador) specs.procesador = equipo.procesador
          if (equipo.ram) specs.ram = equipo.ram
          if (equipo.almacenamiento) specs.almacenamiento = equipo.almacenamiento
          if (equipo.mac) specs.mac = equipo.mac
        } else if (equipo.tipo === 'monitor') {
          if (equipo.pulgadas) specs.pulgadas = equipo.pulgadas
        }

        const { data: equipoCreado, error: equipoError } = await supabase
          .from('equipos')
          .insert({
            tipo: equipo.tipo,
            usuario_id: ubicacion.usuario_id || null,
            codigo_barra: equipo.codigo_barra || null,
            marca: equipo.marca || null,
            modelo: equipo.modelo || null,
            specs,
            estado: equipo.estado,
            observaciones: equipo.observaciones || null
          })
          .select()
          .single()

        if (equipoError) throw equipoError

        if (equipo.tipo === 'computadora' && equipoCreado) {
          const perifericos = []
          if (equipo.perifericos.mouse > 0) {
            perifericos.push({
              equipo_id: equipoCreado.id,
              tipo: 'mouse',
              cantidad: equipo.perifericos.mouse
            })
          }
          if (equipo.perifericos.teclado > 0) {
            perifericos.push({
              equipo_id: equipoCreado.id,
              tipo: 'teclado',
              cantidad: equipo.perifericos.teclado
            })
          }
          if (equipo.perifericos.parlantes > 0) {
            perifericos.push({
              equipo_id: equipoCreado.id,
              tipo: 'parlantes',
              cantidad: equipo.perifericos.parlantes
            })
          }
          if (equipo.perifericos.otros) {
            perifericos.push({
              equipo_id: equipoCreado.id,
              tipo: 'otros',
              cantidad: 1,
              descripcion: equipo.perifericos.otros
            })
          }

          if (perifericos.length > 0) {
            const { error: perifericosError } = await supabase
              .from('perifericos')
              .insert(perifericos)

            if (perifericosError) throw perifericosError
          }
        }
      }

      alert(`${equipos.length} equipo(s) registrado(s) exitosamente`)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al registrar equipos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gold-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary-600">Registro Múltiple de Equipos</CardTitle>
            <CardDescription>Registra varios equipos para el mismo usuario de una sola vez</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <h3 className="font-semibold text-primary-800 mb-4">Ubicación del Usuario</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="piso">Piso *</Label>
                    <Select
                      id="piso"
                      required
                      value={ubicacion.piso_id}
                      onChange={(e) => setUbicacion({ ...ubicacion, piso_id: e.target.value })}
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
                      value={ubicacion.area_id}
                      onChange={(e) => setUbicacion({ ...ubicacion, area_id: e.target.value })}
                      disabled={!ubicacion.piso_id}
                    >
                      <option value="">Seleccione...</option>
                      {filteredAreas.map(area => (
                        <option key={area.id} value={area.id}>{area.nombre}</option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="usuario">Usuario</Label>
                    <div className="flex gap-2">
                      <Select
                        id="usuario"
                        value={ubicacion.usuario_id}
                        onChange={(e) => setUbicacion({ ...ubicacion, usuario_id: e.target.value })}
                        disabled={!ubicacion.area_id}
                        className="flex-1"
                      >
                        <option value="">Sin asignar</option>
                        {filteredUsuarios.map(usuario => (
                          <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>
                        ))}
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewUserDialogOpen(true)}
                        disabled={!ubicacion.area_id}
                        title="Crear nuevo usuario"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Equipos a Registrar ({equipos.length})</h3>
                  <Button type="button" onClick={agregarEquipo} variant="secondary">
                    Agregar Otro Equipo
                  </Button>
                </div>

                {equipos.map((equipo, index) => (
                  <Card key={equipo.id} className="border-2">
                    <CardHeader className="bg-gray-50">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Equipo #{index + 1}</CardTitle>
                        {equipos.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => eliminarEquipo(equipo.id)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Tipo de Equipo *</Label>
                          <Select
                            required
                            value={equipo.tipo}
                            onChange={(e) => actualizarEquipo(equipo.id, 'tipo', e.target.value as TipoEquipo)}
                          >
                            <option value="computadora">Computadora</option>
                            <option value="monitor">Monitor</option>
                            <option value="impresora">Impresora</option>
                            <option value="scanner">Scanner</option>
                            <option value="anexo">Anexo</option>
                          </Select>
                        </div>

                        <div>
                          <Label>Código de Barra</Label>
                          <Input
                            value={equipo.codigo_barra}
                            onChange={(e) => actualizarEquipo(equipo.id, 'codigo_barra', e.target.value)}
                            placeholder="XEADSSDEF774"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Marca</Label>
                          <Input
                            value={equipo.marca}
                            onChange={(e) => actualizarEquipo(equipo.id, 'marca', e.target.value)}
                            placeholder="HP, Dell, Samsung"
                          />
                        </div>

                        <div>
                          <Label>Modelo</Label>
                          <Input
                            value={equipo.modelo}
                            onChange={(e) => actualizarEquipo(equipo.id, 'modelo', e.target.value)}
                            placeholder="ProBook 450"
                          />
                        </div>
                      </div>

                      {equipo.tipo === 'computadora' && (
                        <div className="p-3 bg-blue-50 rounded-lg mb-4">
                          <div className="grid md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <Label>Procesador</Label>
                              <Input
                                value={equipo.procesador}
                                onChange={(e) => actualizarEquipo(equipo.id, 'procesador', e.target.value)}
                                placeholder="I5 1214"
                              />
                            </div>
                            <div>
                              <Label>RAM</Label>
                              <Input
                                value={equipo.ram}
                                onChange={(e) => actualizarEquipo(equipo.id, 'ram', e.target.value)}
                                placeholder="16GB"
                              />
                            </div>
                            <div>
                              <Label>Almacenamiento</Label>
                              <Input
                                value={equipo.almacenamiento}
                                onChange={(e) => actualizarEquipo(equipo.id, 'almacenamiento', e.target.value)}
                                placeholder="512SSD"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Dirección MAC</Label>
                            <Input
                              value={equipo.mac}
                              onChange={(e) => actualizarEquipo(equipo.id, 'mac', e.target.value)}
                              placeholder="00:1A:2B:3C:4D:5E"
                            />
                          </div>
                        </div>
                      )}

                      {equipo.tipo === 'monitor' && (
                        <div className="p-3 bg-blue-50 rounded-lg mb-4">
                          <Label>Pulgadas</Label>
                          <Input
                            value={equipo.pulgadas}
                            onChange={(e) => actualizarEquipo(equipo.id, 'pulgadas', e.target.value)}
                            placeholder="24, 27"
                          />
                        </div>
                      )}

                      {equipo.tipo === 'computadora' && (
                        <div className="p-3 bg-gold-50 rounded-lg mb-4">
                          <h4 className="font-semibold mb-3 text-gold-800">Periféricos</h4>
                          <div className="grid md:grid-cols-4 gap-3">
                            <div>
                              <Label>Mouse</Label>
                              <Input
                                type="number"
                                min="0"
                                value={equipo.perifericos.mouse}
                                onChange={(e) => actualizarPeriferico(equipo.id, 'mouse', parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label>Teclado</Label>
                              <Input
                                type="number"
                                min="0"
                                value={equipo.perifericos.teclado}
                                onChange={(e) => actualizarPeriferico(equipo.id, 'teclado', parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label>Parlantes</Label>
                              <Input
                                type="number"
                                min="0"
                                value={equipo.perifericos.parlantes}
                                onChange={(e) => actualizarPeriferico(equipo.id, 'parlantes', parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label>Otros</Label>
                              <Input
                                value={equipo.perifericos.otros}
                                onChange={(e) => actualizarPeriferico(equipo.id, 'otros', e.target.value)}
                                placeholder="Webcam"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Estado</Label>
                          <Select
                            value={equipo.estado}
                            onChange={(e) => actualizarEquipo(equipo.id, 'estado', e.target.value as EstadoEquipo)}
                          >
                            <option value="activo">Activo</option>
                            <option value="disponible">Disponible</option>
                            <option value="mantenimiento">Mantenimiento</option>
                            <option value="baja">Baja</option>
                          </Select>
                        </div>

                        <div>
                          <Label>Observaciones</Label>
                          <Input
                            value={equipo.observaciones}
                            onChange={(e) => actualizarEquipo(equipo.id, 'observaciones', e.target.value)}
                            placeholder="Notas adicionales"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : `Registrar ${equipos.length} Equipo(s)`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-user-nombre">Nombre Completo *</Label>
                  <Input
                    id="new-user-nombre"
                    value={newUserData.nombre}
                    onChange={(e) => setNewUserData({ ...newUserData, nombre: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>
                <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-800">
                  El usuario se creará en el área seleccionada: <strong>{areas.find(a => a.id === ubicacion.area_id)?.nombre}</strong>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNewUserDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Crear Usuario
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
