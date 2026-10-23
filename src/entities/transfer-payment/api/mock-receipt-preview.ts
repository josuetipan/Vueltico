/** Vista previa simulada (sin OCR ni conexión bancaria). */
export function mockReceiptPreviewUrl(label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="900" viewBox="0 0 640 900">
  <rect fill="#f4f4f5" width="640" height="900"/>
  <rect fill="#fff" x="40" y="60" width="560" height="780" rx="8" stroke="#d4d4d8"/>
  <text x="80" y="120" font-family="sans-serif" font-size="22" fill="#18181b">Comprobante simulado</text>
  <text x="80" y="160" font-family="sans-serif" font-size="14" fill="#71717a">${label.replace(/[<>&]/g, "")}</text>
  <text x="80" y="200" font-family="sans-serif" font-size="12" fill="#a1a1aa">No es evidencia de acreditación bancaria.</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
