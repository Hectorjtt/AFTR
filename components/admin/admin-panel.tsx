"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PendingPayments } from "./pending-payments"
import { QRScanner } from "./qr-scanner"

export function AdminPanel({ userId }: { userId: string }) {
  return (
    <Tabs defaultValue="payments" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-white/5">
        <TabsTrigger value="payments" className="text-white data-[state=active]:bg-white/10">
          Comprobantes de Pago
        </TabsTrigger>
        <TabsTrigger value="scanner" className="text-white data-[state=active]:bg-white/10">
          Escáner de QR
        </TabsTrigger>
      </TabsList>
      <TabsContent value="payments" className="mt-6">
        <PendingPayments />
      </TabsContent>
      <TabsContent value="scanner" className="mt-6">
        <QRScanner userId={userId} />
      </TabsContent>
    </Tabs>
  )
}


