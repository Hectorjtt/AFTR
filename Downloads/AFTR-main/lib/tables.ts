import { supabase } from './supabase'

const normalizeId = (value: string) => {
  const onlyDigits = value.replace(/[^0-9]/g, '')
  return onlyDigits || value // fallback para no perder IDs no numéricos
}

type TableStatuses = {
  flags: Record<string, boolean>          // is_occupied manual (table_status)
  approvedCounts: Record<string, number>  // tickets aprobados por mesa
}

// Obtiene:
// - flags de ocupación manual desde table_status
// - conteo de tickets aprobados por mesa (para determinar si llegó al mínimo)
export async function getTableStatuses() {
  // 1) Flags manuales
  const { data: statusRows, error: flagsError } = await supabase
    .from('table_status')
    .select('table_id, is_occupied')

  if (flagsError) {
    console.error('Error al obtener estado de mesas:', flagsError)
    return { data: null, error: flagsError }
  }

  const flags: Record<string, boolean> = {}
  statusRows?.forEach((row) => {
    const key = normalizeId(row.table_id)
    flags[key] = row.is_occupied
  })

  // 2) Conteo de tickets aprobados
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('table_id')
    .eq('status', 'approved')

  if (ticketsError) {
    console.error('Error al obtener tickets aprobados:', ticketsError)
    return { data: null, error: ticketsError }
  }

  const approvedCounts: Record<string, number> = {}
  tickets?.forEach((ticket) => {
    const key = normalizeId(ticket.table_id)
    approvedCounts[key] = (approvedCounts[key] || 0) + 1
  })

  const data: TableStatuses = { flags, approvedCounts }
  return { data, error: null }
}

export type { TableStatuses }
