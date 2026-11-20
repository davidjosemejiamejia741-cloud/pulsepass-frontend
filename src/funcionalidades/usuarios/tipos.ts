import { z } from 'zod'

/** UserResponse (sin hash ni credenciales). */
export const UsuarioSchema = z.object({
  id: z.number().nullish(),
  username: z.string(),
  email: z.string(),
  active: z.boolean().nullish(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullish(),
  city: z.string().nullish(),
  birthDate: z.string(),
})
export type Usuario = z.infer<typeof UsuarioSchema>

const bytesUtf8 = (texto: string) => new TextEncoder().encode(texto).length

function hoyIso(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** RegisterUserRequest. La edad mínima NO se valida aquí (es regla del backend por evento). */
export const RegistroFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Ingresa un nombre de usuario')
    .max(100, 'Máximo 100 caracteres'),
  email: z.email('Ingresa un correo válido').max(150, 'Máximo 150 caracteres'),
  firstName: z.string().trim().min(1, 'Ingresa tus nombres').max(100, 'Máximo 100 caracteres'),
  lastName: z.string().trim().min(1, 'Ingresa tus apellidos').max(100, 'Máximo 100 caracteres'),
  birthDate: z
    .string()
    .min(1, 'Ingresa tu fecha de nacimiento')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida')
    .refine((v) => v <= hoyIso(), 'La fecha no puede ser futura'),
  password: z
    .string()
    .refine((p) => [...p].length >= 12, 'La contraseña debe tener al menos 12 caracteres')
    .refine((p) => bytesUtf8(p) <= 72, 'La contraseña no puede superar 72 bytes'),
})
export type RegistroForm = z.infer<typeof RegistroFormSchema>
