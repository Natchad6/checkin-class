"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Spinner, Toast } from "@heroui/react"
import { useAuthStore } from "@/store/auth-store"
import axiosInstance from "@/lib/axiosInstance"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axiosInstance.get("/api/auth/me")

        if (response.data.success) {
          setUser(response.data.data)
          setIsLoading(false)
        } else {
          logout()
          router.push("/login")
        }
      } catch (error) {
        logout()
        router.push("/login")
      }
    }

    checkSession()
  }, [setUser, logout, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" color="current" />

          <p className="text-[10px] font-bold tracking-[0.2em] text-[#A1A1A1] uppercase">
            Verifying Session
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toast.Provider />
      {children}
    </>
  )
}
