"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { scanTicket } from "@/lib/tickets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Camera, Loader2 } from "lucide-react"

export function QRScanner({ userId }: { userId: string }) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; ticket?: any } | null>(null)
  const [manualCode, setManualCode] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastScannedCode = useRef<string>("")
  const scannerId = "qr-reader"

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode(scannerId)
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScan(decodedText)
        },
        (errorMessage) => {
          // Ignorar errores de escaneo continuo
        }
      )

      setScanning(true)
      setResult(null)
    } catch (err) {
      console.error("Error al iniciar escáner:", err)
      alert("Error al iniciar la cámara. Asegúrate de dar permisos de cámara.")
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current = null
          setScanning(false)
        })
        .catch((err) => {
          console.error("Error al detener escáner:", err)
        })
    }
  }

  const handleScan = async (qrCode: string) => {
    // Evitar escanear el mismo código múltiples veces muy rápido
    if (isProcessing || lastScannedCode.current === qrCode) {
      return
    }

    setIsProcessing(true)
    lastScannedCode.current = qrCode
    
    const scanResult = await scanTicket(qrCode, userId)
    
    if (scanResult.success) {
      setResult({
        success: true,
        message: `Ticket escaneado exitosamente: ${scanResult.ticket?.cover_name}`,
        ticket: scanResult.ticket,
      })
    } else {
      setResult({
        success: false,
        message: scanResult.error || "Error al escanear ticket",
      })
    }
    
    // Permitir escanear otro ticket después de 2 segundos
    setTimeout(() => {
      setIsProcessing(false)
      setResult(null) // Limpiar el resultado anterior
      lastScannedCode.current = "" // Permitir escanear el mismo código después de un tiempo
    }, 2000)
  }

  const handleManualScan = async () => {
    if (!manualCode.trim()) {
      alert("Por favor ingresa un código QR")
      return
    }

    const scanResult = await scanTicket(manualCode.trim(), userId)
    
    if (scanResult.success) {
      setResult({
        success: true,
        message: `Ticket escaneado exitosamente: ${scanResult.ticket?.cover_name}`,
        ticket: scanResult.ticket,
      })
      setManualCode("")
    } else {
      setResult({
        success: false,
        message: scanResult.error || "Error al escanear ticket",
      })
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        stopScanning()
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Escáner de QR</CardTitle>
          <CardDescription className="text-white/60">
            Escanea el código QR del ticket para validar la entrada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!scanning ? (
            <div className="space-y-4">
              <Button
                onClick={startScanning}
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
              >
                <Camera className="mr-2 h-4 w-4" />
                Iniciar Escáner
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-2 text-white/60">O</span>
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ingresa el código QR manualmente"
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-orange-500 focus:outline-none"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleManualScan()
                    }
                  }}
                />
                <Button
                  onClick={handleManualScan}
                  variant="outline"
                  className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  Escanear Código Manual
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div id={scannerId} className="mx-auto max-w-md" />
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-blue-500/20 p-3 text-blue-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Procesando ticket...</span>
                </div>
              )}
              <Button
                onClick={stopScanning}
                variant="destructive"
                className="w-full"
              >
                Detener Escáner
              </Button>
            </div>
          )}

          {result && (
            <Card
              className={`border ${
                result.success
                  ? "border-green-500/50 bg-green-500/10"
                  : "border-red-500/50 bg-red-500/10"
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        result.success ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {result.message}
                    </p>
                    {result.success && result.ticket && (
                      <div className="mt-2 space-y-1 text-sm text-white/80">
                        <p>Mesa: {result.ticket.table_id}</p>
                        <p>Nombre: {result.ticket.cover_name}</p>
                        <p>
                          Escaneado:{" "}
                          {new Date().toLocaleString("es-MX")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


