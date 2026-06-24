"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  TextField,
  Label,
  Button,
  InputGroup,
  Alert,
  FieldError,
  Spinner,
} from "@heroui/react"
import { LuHexagon, LuArrowRight, LuEye, LuEyeOff } from "react-icons/lu"
import axios from "axios"
import axiosInstance from "@/lib/axiosInstance"

const LoginPage = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string
    password?: string
  }>({})

  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axiosInstance.get("/api/auth/me")
        if (response.data.success) {
          router.push("/events")
        }
      } catch (error) {}
    }
    checkSession()
  }, [router])

  const toggleVisibility = () => setIsVisible((prev) => !prev)

  const handleLogin = async () => {
    const newErrors: { username?: string; password?: string } = {}
    if (!username.trim()) newErrors.username = "Please enter your username"
    if (!password.trim()) newErrors.password = "Please enter your password"

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors)
      return
    }

    setFieldErrors({})
    setError(null)
    setIsLoading(true)

    try {
      const response = await axiosInstance.post("/api/auth/login", {
        username,
        password,
      })

      if (response.data.success) {
        router.push("/events")
      } else {
        setError(response.data.error.message || "Login failed")
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error?.message ||
            "An error occurred during login",
        )
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-8  font-sans text-[#171717] container mx-auto max-w-[440px]">
      <div className="flex items-center gap-2 mb-8">
        <div className="relative flex items-center justify-center">
          <LuHexagon className="w-7 h-7 stroke-[1.2]" />
          <div className="absolute w-1.2 h-1.2 bg-current rounded-full" />
        </div>
        <span className="font-bold tracking-[0.2em] text-[11px]">
          POGEARMON
        </span>
      </div>

      <div className="mb-8">
        <p className="text-[#A1A1A1] text-[9px] font-bold tracking-[0.25em] mb-3 uppercase">
          SIGN IN
        </p>
        <h1 className="text-[40px] leading-[1.1] font-semibold tracking-tight text-[#111111]">
          Welcome!
          <br />
          <span className="font-normal text-[32px]">Please login</span>
        </h1>
      </div>

      {error && (
        <div className="mb-6">
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
            </Alert.Content>
          </Alert>
        </div>
      )}

      <div className="space-y-4 w-full">
        <TextField
          className="w-full group"
          name="username"
          isInvalid={!!fieldErrors.username}
        >
          <Label className="text-[#171717] text-sm font-medium mb-1.5 block">
            Username
          </Label>
          <InputGroup className="w-full bg-white border border-[#E5E5E5] rounded-2xl shadow-sm focus-within:border-[#0A0A0A] transition-all duration-200 overflow-hidden">
            <InputGroup.Input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (fieldErrors.username) {
                  setFieldErrors((prev) => ({ ...prev, username: undefined }))
                }
              }}
              placeholder="Enter your username"
              className="w-full h-11 bg-transparent border-none rounded-none px-4 text-[14px] focus:ring-0 outline-none"
            />
          </InputGroup>
          {fieldErrors.username && (
            <FieldError className="mt-1 text-xs text-danger">
              {fieldErrors.username}
            </FieldError>
          )}
        </TextField>

        {/* Password Field */}
        <TextField
          className="w-full group"
          name="password"
          isInvalid={!!fieldErrors.password}
        >
          <Label className="text-[#171717] text-sm font-medium mb-1.5 block">
            Password
          </Label>
          <InputGroup className="w-full bg-white border border-[#E5E5E5] rounded-2xl shadow-sm focus-within:border-[#0A0A0A] transition-all duration-200 overflow-hidden">
            <InputGroup.Input
              type={isVisible ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }))
                }
              }}
              placeholder="Enter your password"
              className="grow h-11 bg-transparent border-none rounded-none px-4 text-[14px] focus:ring-0 outline-none"
            />
            <InputGroup.Suffix className="pr-1.5">
              <Button
                isIconOnly
                aria-label={isVisible ? "Hide password" : "Show password"}
                size="sm"
                variant="ghost"
                className="text-[#A1A1A1] hover:text-[#0A0A0A] hover:bg-transparent"
                onPress={toggleVisibility}
              >
                {isVisible ? (
                  <LuEyeOff className="w-5 h-5" />
                ) : (
                  <LuEye className="w-5 h-5" />
                )}
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
          {fieldErrors.password && (
            <FieldError className="mt-1 text-xs text-danger">
              {fieldErrors.password}
            </FieldError>
          )}
        </TextField>
      </div>

      <div className="pt-8">
        <Button
          className="w-full h-14 bg-[#0A0A0A] text-white rounded-full flex items-center justify-center gap-3 font-bold tracking-[0.2em] text-[10px] hover:bg-black transition-all active:scale-[0.98]"
          onPress={handleLogin}
          isPending={isLoading}
        >
          {({ isPending }) => (
            <>
              {isPending ? (
                <>
                  <Spinner color="current" size="sm" />
                  LOGIN
                </>
              ) : (
                <>
                  <LuArrowRight className="w-4 h-4 stroke-[2.5]" />
                  LOGIN
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default LoginPage
