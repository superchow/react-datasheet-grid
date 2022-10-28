import { createTextColumn } from './textColumn'

export const intColumn = createTextColumn<number | null>({
  align: 'right',
  formatBlurredInput: (value) =>
    typeof value === 'number' ? new Intl.NumberFormat().format(value) : '',
  parseUserInput: (value) => {
    const number = parseFloat(value)
    return !isNaN(number) ? Math.round(number) : null
  },
  parsePastedValue: (value) => {
    const number = parseFloat(value)
    return !isNaN(number) ? Math.round(number) : null
  },
})
