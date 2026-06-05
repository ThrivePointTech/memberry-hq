export function formatPHP(centavos: number | string): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(centavos) / 100)
}

export function formatNumber(value: number | string): string {
  return new Intl.NumberFormat('en-PH').format(Number(value))
}
