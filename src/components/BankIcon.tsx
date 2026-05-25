const bankStyles: Record<string, { bg: string; text: string; label: string }> = {
  bca: { bg: "#0066AE", text: "white", label: "BCA" },
  bni: { bg: "#D52B1E", text: "white", label: "BNI" },
  bri: { bg: "#00529C", text: "white", label: "BRI" },
  mandiri: { bg: "#004B87", text: "white", label: "Mandiri" },
}

export function BankIcon({ bank, size = 10 }: { bank: string; size?: number }) {
  const style = bankStyles[bank]
  if (!style) return null
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white shrink-0"
      style={{
        width: size * 4,
        height: size * 4,
        fontSize: size * 0.6,
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {style.label}
    </div>
  )
}

export function getBankColor(bank: string): string {
  return bankStyles[bank]?.bg || "#888"
}

export function getBankLabel(bank: string): string {
  return bankStyles[bank]?.label || bank.toUpperCase()
}

export const POPULAR_BANKS = ["bca", "bni", "bri", "mandiri"] as const
