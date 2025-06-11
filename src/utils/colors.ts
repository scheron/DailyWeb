type RGB = {r: number; g: number; b: number}

function hexToRgb(hex: string): RGB {
  const bigint = parseInt(hex.slice(1), 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export function generateGradient(fromHex: string, toHex: string, steps: number = 10): string[] {
  const fromRgb = hexToRgb(fromHex)
  const toRgb = hexToRgb(toHex)

  const palette: string[] = []

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const r = Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * t)
    const g = Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * t)
    const b = Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * t)
    palette.push(rgbToHex(r, g, b))
  }

  return palette
}

export function getOppositeColor(color: string): string {
  const rgb = hexToRgb(color)
  const r = Math.round(rgb.r + (255 - rgb.r) * 0.7)
  const g = Math.round(rgb.g + (255 - rgb.g) * 0.7)
  const b = Math.round(rgb.b + (255 - rgb.b) * 0.7)
  return rgbToHex(r, g, b)
}
