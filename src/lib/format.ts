const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatPrice = (value: number) => currency.format(value)

export function formatDuration(seconds: number): string {
  if (seconds < 60) return 'menos de 1 min'
  return `${Math.round(seconds / 60)} min`
}
