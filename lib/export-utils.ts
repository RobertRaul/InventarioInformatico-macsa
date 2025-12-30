import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

type EquipoExport = {
  piso: string
  area: string
  usuario: string
  tipo: string
  marca: string
  modelo: string
  specs: string
  codigo_barra: string
  perifericos: string
  estado: string
}

function getTipoNombre(equipo: any): string {
  return equipo.tipo_custom?.nombre || equipo.tipo || '-'
}

export function exportToPDF(equipos: any[], filtros: string) {
  const doc = new jsPDF('landscape')

  doc.setFontSize(18)
  doc.setTextColor(30, 91, 168)
  doc.text('Sistema de Inventario - Clínica MacSalud', 14, 15)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Reporte generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 22)
  if (filtros) {
    doc.text(`Filtros aplicados: ${filtros}`, 14, 27)
  }

  const tableData = equipos.map(equipo => {
    const tipoNombre = getTipoNombre(equipo)
    return [
      equipo.usuario?.area?.piso?.nombre || '-',
      equipo.usuario?.area?.nombre || '-',
      equipo.usuario?.nombre || 'Sin asignar',
      tipoNombre.toUpperCase(),
      equipo.marca || '-',
      equipo.modelo || '-',
      formatSpecs(equipo.specs, equipo.tipo || tipoNombre),
      equipo.codigo_barra || '-',
      formatPerifericos(equipo.perifericos),
      equipo.estado.toUpperCase()
    ]
  })

  autoTable(doc, {
    head: [['Piso', 'Área', 'Usuario', 'Tipo', 'Marca', 'Modelo', 'Especificaciones', 'Código', 'Periféricos', 'Estado']],
    body: tableData,
    startY: filtros ? 32 : 27,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 91, 168],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    styles: {
      cellPadding: 2,
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 30 },
      3: { cellWidth: 22 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 35 },
      7: { cellWidth: 28 },
      8: { cellWidth: 30 },
      9: { cellWidth: 18 }
    }
  })

  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  doc.save(`inventario-macsalud-${new Date().toISOString().split('T')[0]}.pdf`)
}

export function exportToExcel(equipos: any[], filtros: string) {
  const data: EquipoExport[] = equipos.map(equipo => {
    const tipoNombre = getTipoNombre(equipo)
    return {
      piso: equipo.usuario?.area?.piso?.nombre || '-',
      area: equipo.usuario?.area?.nombre || '-',
      usuario: equipo.usuario?.nombre || 'Sin asignar',
      tipo: tipoNombre.toUpperCase(),
      marca: equipo.marca || '-',
      modelo: equipo.modelo || '-',
      specs: formatSpecs(equipo.specs, equipo.tipo || tipoNombre),
      codigo_barra: equipo.codigo_barra || '-',
      perifericos: formatPerifericos(equipo.perifericos),
      estado: equipo.estado.toUpperCase()
    }
  })

  const ws = XLSX.utils.json_to_sheet(data, {
    header: ['piso', 'area', 'usuario', 'tipo', 'marca', 'modelo', 'specs', 'codigo_barra', 'perifericos', 'estado']
  })

  XLSX.utils.sheet_add_aoa(ws, [[
    'Piso',
    'Área',
    'Usuario',
    'Tipo',
    'Marca',
    'Modelo',
    'Especificaciones',
    'Código de Barra',
    'Periféricos',
    'Estado'
  ]], { origin: 'A1' })

  const colWidths = [
    { wch: 15 },
    { wch: 20 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 30 },
    { wch: 20 },
    { wch: 30 },
    { wch: 12 }
  ]
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario')

  const infoSheet = XLSX.utils.aoa_to_sheet([
    ['REPORTE DE INVENTARIO'],
    ['Clínica MacSalud'],
    [''],
    ['Fecha de generación:', new Date().toLocaleDateString('es-ES')],
    ['Hora de generación:', new Date().toLocaleTimeString('es-ES')],
    ['Total de equipos:', equipos.length.toString()],
    ['Filtros aplicados:', filtros || 'Ninguno']
  ])
  XLSX.utils.book_append_sheet(wb, infoSheet, 'Información')

  XLSX.writeFile(wb, `inventario-macsalud-${new Date().toISOString().split('T')[0]}.xlsx`)
}

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
