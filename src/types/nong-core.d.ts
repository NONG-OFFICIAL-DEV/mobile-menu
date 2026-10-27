// Ambient types for the untyped private package `@nong-official-dev/core`.
// Only the exports actually used by this app are declared.
declare module '@nong-official-dev/core' {
  export function formatCurrency(value: number | null | undefined, locale?: string, currency?: string): string
  export function formatCurrencyNoSymbol(value: number | null | undefined, locale?: string): string
  export function formatKHR(value: number | null | undefined): string

  export function formatDate(date?: Date | string): string
  export function formatDateTime(date?: Date | string): string
  export function formatDateText(date?: Date | string, locale?: string): string
  export function formatLocalDate(date: Date | string): string
  export function formatTimeAgo(dateString: string): string
  export function addDays(date?: Date | string, days?: number): Date

  export function calcTotal(items: Array<{ price: number; quantity: number }>): number
  export function calcItemCount(items: Array<{ quantity: number }>): number
  export const ORDER_STATUS: Record<string, string>
  export const KITCHEN_STATUS: Record<string, string>
}
