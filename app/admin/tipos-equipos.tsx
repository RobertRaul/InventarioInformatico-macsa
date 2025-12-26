"use client"

import { useState, useEffect } from "react"
import { supabase, type TipoEquipoCustom, type CampoPersonalizado } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function TiposEquiposAdmin() {
  const [tipos, setTipos] = useState<TipoEquipoCustom[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTipo, setEditingTipo] = useState<TipoEquipoCustom | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    activo: true
  })
  const [campos, setCampos] = useState<CampoPersonalizado[]>([])

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

  function openDialog(tipo?: TipoEquipoCustom) {
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

  function actualizarCampo(index: number, field: keyof CampoPersonalizado, value: any) {
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
                <TableHead>Campos Adicionales</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tipos.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell className="font-medium">{tipo.nombre}</TableCell>
                  <TableCell>{tipo.descripcion || "-"}</TableCell>
                  <TableCell>
                    {tipo.campos_adicionales?.length || 0} campos
                  </TableCell>
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
            <DialogTitle>{editingTipo ? "Editar Tipo de Equipo" : "Nuevo Tipo de Equipo"}</DialogTitle>
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
                  placeholder="Breve descripción del tipo de equipo"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="activo">Tipo activo</Label>
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
                    No hay campos personalizados. Agrega campos específicos para este tipo de equipo.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {campos.map((campo, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Campo {index + 1}</span>
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
                            <Label className="text-xs">Nombre interno</Label>
                            <Input
                              value={campo.nombre}
                              onChange={(e) => actualizarCampo(index, 'nombre', e.target.value)}
                              placeholder="ej: capacidad"
                              size={10}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Etiqueta visible</Label>
                            <Input
                              value={campo.label}
                              onChange={(e) => actualizarCampo(index, 'label', e.target.value)}
                              placeholder="ej: Capacidad"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Tipo de dato</Label>
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
              <Button type="submit">
                {editingTipo ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
