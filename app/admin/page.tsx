"use client"

import { useState, useEffect } from "react"
import { supabase, type Piso, type Area, type Usuario } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Tab = "pisos" | "areas" | "usuarios" | "tipos"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pisos")

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gold-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary-600">Panel de Administración</h1>
          <p className="text-gray-600 mt-1">Gestiona pisos, áreas, usuarios y tipos de equipos</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: "pisos", label: "Pisos" },
                { id: "areas", label: "Áreas" },
                { id: "usuarios", label: "Usuarios" },
                { id: "tipos", label: "Tipos de Equipos" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === "pisos" && <PisosAdmin />}
        {activeTab === "areas" && <AreasAdmin />}
        {activeTab === "usuarios" && <UsuariosAdmin />}
        {activeTab === "tipos" && <TiposEquiposAdmin />}
      </div>
    </div>
  )
}

function PisosAdmin() {
  const [pisos, setPisos] = useState<Piso[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPiso, setEditingPiso] = useState<Piso | null>(null)
  const [formData, setFormData] = useState({ nombre: "", orden: 0 })

  useEffect(() => {
    cargarPisos()
  }, [])

  async function cargarPisos() {
    setLoading(true)
    const { data } = await supabase
      .from('pisos')
      .select('*')
      .order('orden', { ascending: false })
    if (data) setPisos(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (editingPiso) {
      await supabase
        .from('pisos')
        .update(formData)
        .eq('id', editingPiso.id)
    } else {
      await supabase
        .from('pisos')
        .insert(formData)
    }

    setDialogOpen(false)
    setEditingPiso(null)
    setFormData({ nombre: "", orden: 0 })
    cargarPisos()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este piso? Se eliminarán todas sus áreas asociadas.')) return

    await supabase.from('pisos').delete().eq('id', id)
    cargarPisos()
  }

  function openDialog(piso?: Piso) {
    if (piso) {
      setEditingPiso(piso)
      setFormData({ nombre: piso.nombre, orden: piso.orden })
    } else {
      setEditingPiso(null)
      setFormData({ nombre: "", orden: 0 })
    }
    setDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestión de Pisos</CardTitle>
          <CardDescription>Administra los pisos del edificio</CardDescription>
        </div>
        <Button onClick={() => openDialog()}>Nuevo Piso</Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-8 text-gray-500">Cargando...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pisos.map((piso) => (
                <TableRow key={piso.id}>
                  <TableCell className="font-medium">{piso.nombre}</TableCell>
                  <TableCell>{piso.orden}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openDialog(piso)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(piso.id)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPiso ? "Editar Piso" : "Nuevo Piso"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre del Piso</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: 10mo Piso"
                  required
                />
              </div>
              <div>
                <Label htmlFor="orden">Orden (Número)</Label>
                <Input
                  id="orden"
                  type="number"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                  placeholder="Ej: 10"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingPiso ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function AreasAdmin() {
  const [areas, setAreas] = useState<(Area & { piso?: Piso })[]>([])
  const [pisos, setPisos] = useState<Piso[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingArea, setEditingArea] = useState<Area | null>(null)
  const [formData, setFormData] = useState({ nombre: "", piso_id: "" })

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setLoading(true)
    const [areasRes, pisosRes] = await Promise.all([
      supabase.from('areas').select('*, piso:pisos(*)').order('nombre'),
      supabase.from('pisos').select('*').order('orden', { ascending: false })
    ])
    if (areasRes.data) setAreas(areasRes.data as any)
    if (pisosRes.data) setPisos(pisosRes.data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (editingArea) {
      await supabase
        .from('areas')
        .update(formData)
        .eq('id', editingArea.id)
    } else {
      await supabase
        .from('areas')
        .insert(formData)
    }

    setDialogOpen(false)
    setEditingArea(null)
    setFormData({ nombre: "", piso_id: "" })
    cargarDatos()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta área?')) return

    await supabase.from('areas').delete().eq('id', id)
    cargarDatos()
  }

  function openDialog(area?: Area) {
    if (area) {
      setEditingArea(area)
      setFormData({ nombre: area.nombre, piso_id: area.piso_id })
    } else {
      setEditingArea(null)
      setFormData({ nombre: "", piso_id: "" })
    }
    setDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestión de Áreas</CardTitle>
          <CardDescription>Administra las áreas de cada piso</CardDescription>
        </div>
        <Button onClick={() => openDialog()}>Nueva Área</Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-8 text-gray-500">Cargando...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Piso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.nombre}</TableCell>
                  <TableCell>{area.piso?.nombre}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openDialog(area)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(area.id)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingArea ? "Editar Área" : "Nueva Área"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="piso">Piso</Label>
                <Select
                  id="piso"
                  value={formData.piso_id}
                  onChange={(e) => setFormData({ ...formData, piso_id: e.target.value })}
                  required
                >
                  <option value="">Seleccione...</option>
                  {pisos.map((piso) => (
                    <option key={piso.id} value={piso.id}>{piso.nombre}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="nombre">Nombre del Área</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Recursos Humanos"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingArea ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<(Usuario & { area?: Area & { piso?: Piso } })[]>([])
  const [areas, setAreas] = useState<(Area & { piso?: Piso })[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState({ nombre: "", cargo: "", area_id: "", activo: true })

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setLoading(true)
    const [usuariosRes, areasRes] = await Promise.all([
      supabase.from('usuarios').select('*, area:areas(*, piso:pisos(*))').order('nombre'),
      supabase.from('areas').select('*, piso:pisos(*)').order('nombre')
    ])
    if (usuariosRes.data) setUsuarios(usuariosRes.data as any)
    if (areasRes.data) setAreas(areasRes.data as any)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (editingUsuario) {
      await supabase
        .from('usuarios')
        .update(formData)
        .eq('id', editingUsuario.id)
    } else {
      await supabase
        .from('usuarios')
        .insert(formData)
    }

    setDialogOpen(false)
    setEditingUsuario(null)
    setFormData({ nombre: "", cargo: "", area_id: "", activo: true })
    cargarDatos()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return

    await supabase.from('usuarios').delete().eq('id', id)
    cargarDatos()
  }

  function openDialog(usuario?: Usuario) {
    if (usuario) {
      setEditingUsuario(usuario)
      setFormData({
        nombre: usuario.nombre,
        cargo: usuario.cargo || "",
        area_id: usuario.area_id,
        activo: usuario.activo
      })
    } else {
      setEditingUsuario(null)
      setFormData({ nombre: "", cargo: "", area_id: "", activo: true })
    }
    setDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>Administra los usuarios del sistema</CardDescription>
        </div>
        <Button onClick={() => openDialog()}>Nuevo Usuario</Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-8 text-gray-500">Cargando...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Piso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nombre}</TableCell>
                  <TableCell>{usuario.cargo || "-"}</TableCell>
                  <TableCell>{usuario.area?.nombre}</TableCell>
                  <TableCell>{usuario.area?.piso?.nombre}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      usuario.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openDialog(usuario)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(usuario.id)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ej: Contador"
                />
              </div>
              <div>
                <Label htmlFor="area">Área</Label>
                <Select
                  id="area"
                  value={formData.area_id}
                  onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                  required
                >
                  <option value="">Seleccione...</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.nombre} ({area.piso?.nombre})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="activo">Usuario activo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingUsuario ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function TiposEquiposAdmin() {
  const [tipos, setTipos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTipo, setEditingTipo] = useState<any>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    activo: true
  })
  const [campos, setCampos] = useState<any[]>([])

  useEffect(() => {
    cargarTipos()
  }, [])

  async function cargarTipos() {
    setLoading(true)
    const { data } = await supabase
      .from('tipos_equipos_custom')
      .select('*')
      .order('nombre')
    if (data) setTipos(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const dataToSave = {
      ...formData,
      campos_adicionales: campos
    }

    if (editingTipo) {
      await supabase
        .from('tipos_equipos_custom')
        .update(dataToSave)
        .eq('id', editingTipo.id)
    } else {
      await supabase
        .from('tipos_equipos_custom')
        .insert(dataToSave)
    }

    setDialogOpen(false)
    setEditingTipo(null)
    setFormData({ nombre: "", descripcion: "", activo: true })
    setCampos([])
    cargarTipos()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este tipo de equipo?')) return

    await supabase.from('tipos_equipos_custom').delete().eq('id', id)
    cargarTipos()
  }

  function openDialog(tipo?: any) {
    if (tipo) {
      setEditingTipo(tipo)
      setFormData({
        nombre: tipo.nombre,
        descripcion: tipo.descripcion || "",
        activo: tipo.activo
      })
      setCampos(tipo.campos_adicionales || [])
    } else {
      setEditingTipo(null)
      setFormData({ nombre: "", descripcion: "", activo: true })
      setCampos([])
    }
    setDialogOpen(true)
  }

  function agregarCampo() {
    setCampos([...campos, { nombre: "", tipo: "text", label: "" }])
  }

  function eliminarCampo(index: number) {
    setCampos(campos.filter((_, i) => i !== index))
  }

  function actualizarCampo(index: number, field: string, value: any) {
    const nuevosCampos = [...campos]
    nuevosCampos[index] = { ...nuevosCampos[index], [field]: value }
    setCampos(nuevosCampos)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tipos de Equipos Personalizados</CardTitle>
          <CardDescription>
            Crea tipos de equipos adicionales a los predefinidos (computadora, monitor, impresora, scanner, anexo)
          </CardDescription>
        </div>
        <Button onClick={() => openDialog()}>Nuevo Tipo</Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Tipos predefinidos del sistema:</h4>
          <div className="flex flex-wrap gap-2">
            {['computadora', 'monitor', 'impresora', 'scanner', 'anexo'].map(tipo => (
              <span key={tipo} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                {tipo}
              </span>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-center py-8 text-gray-500">Cargando...</p>
        ) : tipos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay tipos personalizados creados</p>
            <Button onClick={() => openDialog()}>Crear primer tipo personalizado</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Campos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tipos.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell className="font-medium">{tipo.nombre}</TableCell>
                  <TableCell>{tipo.descripcion || "-"}</TableCell>
                  <TableCell>{tipo.campos_adicionales?.length || 0} campos</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tipo.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tipo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openDialog(tipo)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(tipo.id)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTipo ? "Editar Tipo" : "Nuevo Tipo de Equipo"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre del Tipo</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Tablet, Proyector, UPS"
                  required
                />
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Breve descripción"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activo_tipo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="activo_tipo">Tipo activo</Label>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <Label>Campos Personalizados</Label>
                  <Button type="button" variant="outline" size="sm" onClick={agregarCampo}>
                    Agregar Campo
                  </Button>
                </div>

                {campos.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Agrega campos específicos para este tipo de equipo
                  </p>
                ) : (
                  <div className="space-y-3">
                    {campos.map((campo, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Campo {index + 1}</span>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => eliminarCampo(index)}
                          >
                            Eliminar
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Nombre</Label>
                            <Input
                              value={campo.nombre}
                              onChange={(e) => actualizarCampo(index, 'nombre', e.target.value)}
                              placeholder="capacidad"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Etiqueta</Label>
                            <Input
                              value={campo.label}
                              onChange={(e) => actualizarCampo(index, 'label', e.target.value)}
                              placeholder="Capacidad"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Tipo</Label>
                            <Select
                              value={campo.tipo}
                              onChange={(e) => actualizarCampo(index, 'tipo', e.target.value)}
                              className="text-sm"
                            >
                              <option value="text">Texto</option>
                              <option value="number">Número</option>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingTipo ? "Actualizar" : "Crear"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
