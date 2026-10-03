import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'WashFlow Carwash — POS & Admin',
  description: 'Sistem POS dan administrasi carwash modern. Penerimaan kendaraan, inspeksi, antrean, pembayaran, dan laporan.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
