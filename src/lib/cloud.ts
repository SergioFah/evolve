import { createClient } from '@supabase/supabase-js'
import type { AppData } from '../types.ts'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_KEY as string | undefined

const client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null

// Without Supabase env vars the app runs local-only (handy for development)
export const cloudEnabled = client !== null

export class PinError extends Error {}

export type Remote = { data: AppData | null; updatedAt: number }

function toError(message: string) {
  return message.includes('invalid pin') ? new PinError(message) : new Error(message)
}

export async function loadRemote(pin: string): Promise<Remote> {
  if (!client) throw new Error('cloud disabled')
  const { data, error } = await client.rpc('load_state', { p_pin: pin })
  if (error) throw toError(error.message)
  const row = (Array.isArray(data) ? data[0] : data) as { data: AppData | null; updated_at: number } | undefined
  return { data: row?.data ?? null, updatedAt: Number(row?.updated_at ?? 0) }
}

export async function saveRemote(pin: string, data: AppData, updatedAt: number) {
  if (!client) throw new Error('cloud disabled')
  const { error } = await client.rpc('save_state', { p_pin: pin, p_data: data, p_updated_at: updatedAt })
  if (error) throw toError(error.message)
}
