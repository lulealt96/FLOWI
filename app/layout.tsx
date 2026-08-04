import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Flowi — Tu hub de vida personal",
  description: "Organiza tus proyectos, tareas y vida personal desde WhatsApp con IA.",
}

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={plusJakarta.variable} suppressHydrationWarning>
<body className="flowi-bg min-h-dvh antialiased">
        {children}
      </body>
    </html>
  )
}
