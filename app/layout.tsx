import type { Metadata } from "next"
import { Anuphan } from "next/font/google"
import "./globals.css"

const anuphan = Anuphan({
  subsets: ["latin", "thai"],
  variable: "--font-anuphan",
})

export const metadata: Metadata = {
  title: "TA Digitalcitizens",
  description: "TA Digitalcitizens Portal",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${anuphan.variable} h-full`}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}