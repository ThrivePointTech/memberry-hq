'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface QrTileProps {
  title: string
  subtitle?: string
  url: string
  filename: string
  logoSrc?: string
}

function composeLogo(ctx: CanvasRenderingContext2D, logo: HTMLImageElement, canvasSize: number) {
  const logoSize = Math.round(canvasSize * 0.22)
  const x = Math.round((canvasSize - logoSize) / 2)
  const y = Math.round((canvasSize - logoSize) / 2)
  const padding = 6

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2)
  ctx.drawImage(logo, x, y, logoSize, logoSize)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function QrTile({ title, subtitle, url, filename, logoSrc }: QrTileProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false

    async function render() {
      const dpr = window.devicePixelRatio || 1
      const displaySize = 200
      const renderSize = displaySize * dpr

      await new Promise<void>((resolve, reject) =>
        QRCode.toCanvas(canvas!, url, { width: renderSize, margin: 2 }, (err) =>
          err ? reject(err) : resolve(),
        ),
      )

      if (cancelled) return

      canvas!.style.width = `${displaySize}px`
      canvas!.style.height = `${displaySize}px`

      if (logoSrc) {
        const logo = await loadImage(logoSrc).catch(() => null)
        if (!cancelled && logo) {
          const ctx = canvas!.getContext('2d')
          if (ctx) composeLogo(ctx, logo, renderSize)
        }
      }

      const qrDataUrl = await QRCode.toDataURL(url, { width: 512, margin: 2 })
      if (cancelled) return

      if (!logoSrc) {
        setDataUrl(qrDataUrl)
        return
      }

      const offscreen = document.createElement('canvas')
      offscreen.width = 512
      offscreen.height = 512
      const ctx = offscreen.getContext('2d')!
      const qrImg = await loadImage(qrDataUrl)
      ctx.drawImage(qrImg, 0, 0)

      const logo = await loadImage(logoSrc).catch(() => null)
      if (logo) composeLogo(ctx, logo, 512)

      if (!cancelled) setDataUrl(offscreen.toDataURL('image/png'))
    }

    render().catch(console.error)

    return () => { cancelled = true }
  }, [url, logoSrc])

  function handleDownload() {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename
    a.click()
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-sm">{title}</CardTitle>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </CardHeader>
      <CardContent className="flex justify-center">
        <canvas ref={canvasRef} className="rounded-md" />
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={!dataUrl}>
          <Download size={14} className="mr-1.5" />
          Download PNG
        </Button>
      </CardFooter>
    </Card>
  )
}
