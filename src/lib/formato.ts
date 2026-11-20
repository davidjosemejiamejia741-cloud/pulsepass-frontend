/** NFR-FE-008: formato es-CO para moneda y fechas. */
const moneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const fechaCorta = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const fechaDosDigitos = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const hora = new Intl.DateTimeFormat('es-CO', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const fechaNumerica = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function limpiarMes(texto: string): string {
  // Intl puede devolver "12 dic. 2026" o "12 de dic de 2026": se normaliza a "12 dic 2026".
  return texto.replace(/\./g, '').replace(/ de /g, ' ').replace(/\s+/g, ' ').trim()
}

/** Convierte LocalDateTime/LocalDate del backend (sin zona horaria) en Date local. */
export function aFecha(valor: string): Date {
  // "2026-12-12" sin hora se interpretaría como UTC: se fuerza a medianoche local.
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T00:00:00`) : new Date(valor)
}

/** PrecioCOP: 250000 -> "$ 250.000" */
export function formatearPrecio(valor: number): string {
  // Intl separa "$" y la cifra con un espacio duro (U+00A0, incluido en \s); se normaliza.
  return moneda.format(valor).replace(/\s/g, ' ')
}

/** "12 dic 2026" */
export function formatearFecha(valor: string): string {
  return limpiarMes(fechaCorta.format(aFecha(valor)))
}

/** "05 nov 2026" (tarjetas de ticket) */
export function formatearFechaDia2(valor: string): string {
  return limpiarMes(fechaDosDigitos.format(aFecha(valor)))
}

/** "12 dic 2026 · 20:00" */
export function formatearFechaHora(valor: string, separador = ' · '): string {
  const fecha = aFecha(valor)
  return `${limpiarMes(fechaCorta.format(fecha))}${separador}${hora.format(fecha)}`
}

/** "05 nov 2026 14:32" */
export function formatearMarcaTiempo(valor: string): string {
  const fecha = aFecha(valor)
  return `${limpiarMes(fechaDosDigitos.format(fecha))} ${hora.format(fecha)}`
}

/** "12/04/1998" */
export function formatearFechaNumerica(valor: string): string {
  return fechaNumerica.format(aFecha(valor))
}

/** "Solar Beat" -> "SB", "andrea" -> "A" */
export function iniciales(texto: string): string {
  const partes = texto.trim().split(/\s+/).filter(Boolean)
  const letras = partes.slice(0, 2).map((p) => p.charAt(0).toUpperCase())
  return letras.join('') || '?'
}
