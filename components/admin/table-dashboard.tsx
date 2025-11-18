"use client"

import { useEffect, useState } from "react"
import { getAllTickets } from "@/lib/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, Users, Loader2 } from "lucide-react"

interface Ticket {
  id: number
  qr_code: string
  cover_name: string
  table_id: string
  status: 'pending' | 'approved' | 'used' | 'cancelled'
  scanned_at: string | null
  created_at: string
  scanned_by: string | null
}

interface GroupedTable {
  tableId: string
  covers: Ticket[]
  approvedCount: number
  usedCount: number
  pendingCount: number
  totalCount: number
}

export function TableDashboard() {
  const [tables, setTables] = useState<GroupedTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    // Refrescar cada 30 segundos para ver datos actualizados
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: err } = await getAllTickets()
      
      if (err) {
        console.error('Error al cargar tickets:', err)
        setError('Error al cargar los datos')
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setTables([])
        setLoading(false)
        return
      }

      // Filtrar solo tickets aprobados (para ver covers activos)
      const approvedTickets = data.filter((ticket: Ticket) => ticket.status === 'approved' || ticket.status === 'used')
      
      // Agrupar por mesa
      const grouped = approvedTickets.reduce((acc: Record<string, GroupedTable>, ticket: Ticket) => {
        const tableId = ticket.table_id || 'sin-mesa'
        
        if (!acc[tableId]) {
          acc[tableId] = {
            tableId,
            covers: [],
            approvedCount: 0,
            usedCount: 0,
            pendingCount: 0,
            totalCount: 0,
          }
        }
        
        acc[tableId].covers.push(ticket)
        acc[tableId].totalCount++
        
        if (ticket.status === 'approved') {
          acc[tableId].approvedCount++
        } else if (ticket.status === 'used') {
          acc[tableId].usedCount++
        } else if (ticket.status === 'pending') {
          acc[tableId].pendingCount++
        }
        
        return acc
      }, {})

      // Convertir a array y ordenar por número de mesa
      const tablesArray = Object.values(grouped).sort((a, b) => {
        const numA = parseInt(a.tableId.replace(/\D/g, '')) || 0
        const numB = parseInt(b.tableId.replace(/\D/g, '')) || 0
        return numA - numB
      })

      setTables(tablesArray)
    } catch (err) {
      console.error('Error:', err)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'used':
        return <CheckCircle className="h-4 w-4 text-blue-400" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10">Aprobado</Badge>
      case 'used':
        return <Badge variant="outline" className="border-blue-500/50 text-blue-400 bg-blue-500/10">Usado</Badge>
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 bg-yellow-500/10">Pendiente</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10">Cancelado</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-3 text-white/60">Cargando datos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-500/50 bg-red-500/10">
        <CardContent className="pt-6">
          <p className="text-center text-red-400">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 w-full rounded-lg bg-red-500/20 px-4 py-2 text-red-400 hover:bg-red-500/30"
          >
            Intentar de nuevo
          </button>
        </CardContent>
      </Card>
    )
  }

  if (tables.length === 0) {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-white/40" />
            <p className="text-white/60">
              No hay covers aprobados todavía.
            </p>
            <p className="mt-2 text-sm text-white/40">
              Los covers aparecerán aquí una vez que sean aprobados.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Resumen General
          </CardTitle>
          <CardDescription className="text-white/60">
            Total de mesas con covers: {tables.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {tables.reduce((sum, table) => sum + table.approvedCount, 0)}
              </div>
              <div className="text-sm text-green-300/80">Aprobados</div>
            </div>
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {tables.reduce((sum, table) => sum + table.usedCount, 0)}
              </div>
              <div className="text-sm text-blue-300/80">Usados</div>
            </div>
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">
                {tables.reduce((sum, table) => sum + table.totalCount, 0)}
              </div>
              <div className="text-sm text-orange-300/80">Total Covers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de mesas */}
      <div className="space-y-4">
        {tables.map((table) => (
          <Card key={table.tableId} className="border-white/10 bg-white/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">
                    Mesa {table.tableId.replace('mesa-', '')}
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    {table.totalCount} {table.totalCount === 1 ? 'cover' : 'covers'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {table.approvedCount > 0 && (
                    <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10">
                      {table.approvedCount} aprobado{table.approvedCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  {table.usedCount > 0 && (
                    <Badge variant="outline" className="border-blue-500/50 text-blue-400 bg-blue-500/10">
                      {table.usedCount} usado{table.usedCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {table.covers.map((cover) => (
                  <div
                    key={cover.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(cover.status)}
                      <div className="flex-1">
                        <p className="font-medium text-white">{cover.cover_name}</p>
                        <p className="text-xs text-white/60">
                          Código: <span className="font-mono">{cover.qr_code}</span>
                        </p>
                        {cover.scanned_at && (
                          <p className="text-xs text-blue-400 mt-1">
                            Escaneado: {new Date(cover.scanned_at).toLocaleString('es-MX')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(cover.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

