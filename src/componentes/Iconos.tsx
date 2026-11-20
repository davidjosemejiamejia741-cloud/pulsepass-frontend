import type { ComponentProps, ReactNode } from 'react'

/** DES-01: iconografía SVG de trazo; decorativos con aria-hidden. */
type IconoProps = ComponentProps<'svg'>

function Base({ children, className = 'size-5', ...props }: IconoProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconoMusica = (p: IconoProps) => (
  <Base {...p}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </Base>
)
export const IconoMonitor = (p: IconoProps) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </Base>
)
export const IconoBalon = (p: IconoProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3v18" />
  </Base>
)
export const IconoMuseo = (p: IconoProps) => (
  <Base {...p}>
    <path d="M3 21h18M4 10h16M12 3l9 5H3l9-5ZM6 10v8M10 10v8M14 10v8M18 10v8" />
  </Base>
)
export const IconoBirrete = (p: IconoProps) => (
  <Base {...p}>
    <path d="m22 10-10-5-10 5 10 5 10-5Z" />
    <path d="M6 12v5c3 2 9 2 12 0v-5" />
  </Base>
)
export const IconoEstrella = (p: IconoProps) => (
  <Base {...p}>
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z" />
  </Base>
)
export const IconoCalendario = (p: IconoProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </Base>
)
export const IconoUbicacion = (p: IconoProps) => (
  <Base {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Base>
)
export const IconoUsuario = (p: IconoProps) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Base>
)
export const IconoBuscar = (p: IconoProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Base>
)
export const IconoFlechaIzq = (p: IconoProps) => (
  <Base {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </Base>
)
export const IconoFlechaDer = (p: IconoProps) => (
  <Base {...p}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </Base>
)
export const IconoCheck = (p: IconoProps) => (
  <Base {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Base>
)
export const IconoAdvertencia = (p: IconoProps) => (
  <Base {...p}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </Base>
)
export const IconoCerrar = (p: IconoProps) => (
  <Base {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Base>
)
export const IconoMenu = (p: IconoProps) => (
  <Base {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Base>
)
export const IconoRayo = (p: IconoProps) => (
  <Base {...p}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
  </Base>
)
export const IconoCopiar = (p: IconoProps) => (
  <Base {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Base>
)
export const IconoMas = (p: IconoProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
)
export const IconoTicket = (p: IconoProps) => (
  <Base {...p}>
    <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4V8Z" />
    <path d="M13 6v2M13 11v2M13 16v2" />
  </Base>
)
export const IconoBandeja = (p: IconoProps) => (
  <Base {...p}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1Z" />
  </Base>
)
export const IconoChevronAbajo = (p: IconoProps) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
)
export const IconoOjo = (p: IconoProps) => (
  <Base {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
)
export const IconoOjoTachado = (p: IconoProps) => (
  <Base {...p}>
    <path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-3 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.4-1.6M3 3l18 18" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Base>
)
export const IconoSol = (p: IconoProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Base>
)
export const IconoLuna = (p: IconoProps) => (
  <Base {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </Base>
)
export const IconoSede = (p: IconoProps) => (
  <Base {...p}>
    <path d="M4 21V9l8-5 8 5v12" />
    <path d="M9 21v-6h6v6" />
  </Base>
)
