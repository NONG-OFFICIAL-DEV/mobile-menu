import { formatCurrency, formatKHR } from '@nong-official-dev/core'

export function useMoney() {
  // `Intl.NumberFormat('en-US', { currency: 'KHR' })` renders the ISO code
  // ("KHR 1,234.00") rather than the ៛ symbol — `en-US` locale data has no
  // symbol mapping for it. `formatKHR` is the package's own dedicated
  // workaround (km-KH formatting + a hardcoded ៛ suffix), so route KHR
  // there and everything else through the normal currency formatter.
  function formatMoney(value: number | null | undefined, currencyCode = 'USD'): string {
    if (currencyCode === 'KHR') return formatKHR(value)
    return formatCurrency(value, 'en-US', currencyCode)
  }

  return { formatMoney }
}
