"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  IoClose,
  IoCheckmarkCircle,
  IoWarning,
  IoCloseCircle,
} from "react-icons/io5"
import {
  BsLightningCharge,
  BsLightningChargeFill,
  BsImage,
  BsArrowRepeat,
} from "react-icons/bs"
import QrScanner from "qr-scanner"
import { toast, Button, Spinner } from "@heroui/react"
import axiosInstance from "@/lib/axiosInstance"
import axios from "axios"
import { useEventStore } from "@/store/event-store"

const ScanPage = () => {
  const { event_id } = useParams<{ event_id: string }>()

  const scannerRef = useRef<QrScanner | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isRunningRef = useRef(false)
  const isProcessingRef = useRef(false)
  const isTransitioningRef = useRef(false)

  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  )
  const [flashOn, setFlashOn] = useState(false)
  const { eventName } = useEventStore()
  const [scannedToken, setScannedToken] = useState("")
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [checkInResult, setCheckInResult] = useState<{
    type: "success" | "warning" | "danger"
    title: string
    message: string | React.ReactNode
  } | null>(null)

  const executeCheckIn = async (token: string) => {
    if (!token || isCheckingIn) return
    setIsCheckingIn(true)

    try {
      const response = await axiosInstance.post("/api/check-in", {
        token,
        event_id,
      })

      if (response.data.success) {
        const { alreadyCheckedIn, student } = response.data.data
        const studentName = `${student.firstname} ${student.lastname}`
        const studentId = student.student_id

        if (alreadyCheckedIn) {
          setCheckInResult({
            type: "warning",
            title: "เช็คอินไปแล้ว",
            message: (
              <div className="space-y-0.5">
                <div>
                  คุณ{" "}
                  <span className="font-bold text-white">
                    {studentName}
                  </span>{" "}
                </div>
                <div>
                  รหัสนิสิต: <span className="text-white ">{studentId}</span>
                </div>
                <div>
                  <span className="block text-white/50">
                    ได้เช็คอินเข้าร่วมกิจกรรมแล้ว
                  </span>
                </div>
              </div>
            ),
          })
        } else {
          setCheckInResult({
            type: "success",
            title: "Check-in สำเร็จ!",
            message: (
              <>
                <div>
                  ยินดีต้อนรับคุณ{" "}
                  <span className="font-bold text-white">{studentName}</span>
                </div>
                <div className="mt-0.5">
                  รหัสนิสิต: <span className="text-white">{studentId}</span>
                </div>
              </>
            ),
          })
        }
      }
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error.message
          : "เกิดข้อผิดพลาดในการเช็คอิน"

      setCheckInResult({
        type: "danger",
        title: "เกิดข้อผิดพลาด",
        message: errorMessage,
      })
    } finally {
      setIsCheckingIn(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCheckInResult(null)
    isProcessingRef.current = true
    setTimeout(() => {
      isProcessingRef.current = false
    }, 2000)
  }

  const handleCheckIn = (token: string) => {
    if (isProcessingRef.current || isModalOpen) return
    setScannedToken(token)
    setIsModalOpen(true)
  }

  const stopScanner = useCallback(async () => {
    if (
      !scannerRef.current ||
      !isRunningRef.current ||
      isTransitioningRef.current
    )
      return
    isTransitioningRef.current = true
    try {
      scannerRef.current.stop()
      isRunningRef.current = false
    } catch (e) {
      console.warn("Stop error:", e)
    } finally {
      isTransitioningRef.current = false
    }
  }, [])

  const startScanner = useCallback(
    async (mode: "environment" | "user") => {
      if (
        !scannerRef.current ||
        isRunningRef.current ||
        isModalOpen ||
        isTransitioningRef.current
      )
        return
      isTransitioningRef.current = true
      try {
        await scannerRef.current.setCamera(mode)
        await scannerRef.current.start()
        isRunningRef.current = true
      } catch (e) {
        console.error("Camera error:", e)
        isRunningRef.current = false
      } finally {
        isTransitioningRef.current = false
      }
    },
    [isModalOpen],
  )

  useEffect(() => {
    if (!videoRef.current) return

    const scanner = new QrScanner(
      videoRef.current,
      (result) => handleCheckIn(result.data),
      {
        preferredCamera: facingMode,
        highlightScanRegion: false,
        highlightCodeOutline: false,
        returnDetailedScanResult: true,
      },
    )

    scannerRef.current = scanner
    startScanner(facingMode)

    return () => {
      scanner.destroy()
      scannerRef.current = null
      isRunningRef.current = false
    }
  }, [event_id])

  useEffect(() => {
    if (isModalOpen) {
      stopScanner()
    } else if (!isRunningRef.current) {
      startScanner(facingMode)
    } else {
      // If already running, just update camera if facingMode changed
      scannerRef.current?.setCamera(facingMode).catch(console.error)
    }
  }, [isModalOpen, facingMode, stopScanner, startScanner])

  const handleFlash = async () => {
    if (!scannerRef.current || !isRunningRef.current) return
    const hasFlash = await scannerRef.current.hasFlash()
    if (!hasFlash) {
      toast.warning("Flash not supported")
      return
    }

    try {
      await scannerRef.current.toggleFlash()
      setFlashOn(scannerRef.current.isFlashOn())
    } catch {}
  }

  const handleFlip = async () => {
    if (isTransitioningRef.current) return
    const next: "environment" | "user" =
      facingMode === "environment" ? "user" : "environment"
    setFacingMode(next)
    setFlashOn(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      })
      handleCheckIn(result.data)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดไม่สามารถอ่าน QR Code ได้"

      setCheckInResult({
        type: "danger",
        title: "เกิดข้อผิดพลาด",
        message: message,
      })
      setIsModalOpen(true)
    } finally {
      e.target.value = ""
    }
  }

  return (
    <>
      <style>{`
        #qr-video {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border: none !important;
        }
      `}</style>

      <div className="relative h-screen w-full overflow-hidden text-white select-none">
        <video ref={videoRef} id="qr-video" />
        <div className="relative z-10 flex flex-col h-full">
          <div className="absolute inset-x-0 top-0 h-44 bg-linear-to-b from-black/70 to-transparent pointer-events-none" />

          <div className="relative flex items-center justify-between px-5 pt-4 pb-3">
            <Link
              href={`/events`}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
            >
              <IoClose size={20} />
            </Link>
            <span className="text-sm font-semibold tracking-widest uppercase drop-shadow">
              Scan
            </span>
            <div className="w-9 h-9" />
          </div>

          <div className="relative flex justify-center mt-1 mb-4">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-widest uppercase text-white/70">
                Scanning
              </span>
              <span className="w-px h-3.5 bg-white/30" />
              <span className="text-sm font-medium">
                {eventName || "Loading..."}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="relative w-full max-w-xs aspect-square">
              <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white" />
              <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white" />
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white" />
            </div>

            <Link
              href={`/events/${event_id}/enter-token`}
              className="mt-8 flex items-center gap-2 bg-black/30 backdrop-blur-sm border border-white/30 rounded-full px-6 py-2.5 text-sm font-medium text-white/80"
            >
              Enter Token Instead <span>→</span>
            </Link>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-black/70 to-transparent pointer-events-none" />
          <div className="relative flex justify-around items-center px-10 pb-10 pt-4">
            <button
              onClick={handleFlash}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${flashOn ? "bg-yellow-400/20 border border-yellow-400/40" : "bg-black/30 border border-white/20"}`}
              >
                {flashOn ? (
                  <BsLightningChargeFill
                    size={20}
                    className="text-yellow-400"
                  />
                ) : (
                  <BsLightningCharge size={20} />
                )}
              </div>
              <span className="text-[10px] tracking-widest uppercase text-white/60 drop-shadow">
                Flash
              </span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <BsImage size={18} />
              </div>
              <span className="text-[10px] tracking-widest uppercase text-white/60 drop-shadow">
                Import
              </span>
            </button>

            <button
              onClick={handleFlip}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <BsArrowRepeat size={20} />
              </div>
              <span className="text-[10px] tracking-widest uppercase text-white/60 drop-shadow">
                Flip
              </span>
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {isModalOpen && (
        <div
          className="absolute inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 px-6"
          onClick={closeModal}
        >
          <div
            className="bg-[#111] border border-white/10 rounded-[32px] w-full max-w-sm overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {checkInResult ? (
              <div className="px-8 pt-12 pb-8 flex flex-col items-center text-center">
                <div className="mb-6 animate-in zoom-in duration-500">
                  {checkInResult.type === "success" && (
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500/50">
                      <IoCheckmarkCircle size={48} className="text-green-500" />
                    </div>
                  )}
                  {checkInResult.type === "warning" && (
                    <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center border-2 border-yellow-500/50">
                      <IoWarning size={48} className="text-yellow-500" />
                    </div>
                  )}
                  {checkInResult.type === "danger" && (
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500/50">
                      <IoCloseCircle size={48} className="text-red-500" />
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">
                  {checkInResult.title}
                </h3>
                <div className="text-white/60 mb-10 leading-relaxed px-2">
                  {checkInResult.message}
                </div>

                <Button
                  onPress={closeModal}
                  className={`w-full h-[56px] rounded-[28px] font-bold text-[14px] uppercase tracking-wider ${
                    checkInResult.type === "success"
                      ? "bg-green-500 text-white"
                      : checkInResult.type === "warning"
                        ? "bg-yellow-500 text-black"
                        : "bg-red-500 text-white"
                  }`}
                >
                  ตกลง
                </Button>
              </div>
            ) : (
              <div className="px-8 pt-10 pb-8 flex flex-col items-center gap-6 text-center">
                <div>
                  <p className="font-bold text-white/40 mb-3">
                    ยืนยันการเช็คอิน
                  </p>
                  <p className="font-bold text-white/40 mb-3">Token</p>
                  <p className="text-6xl font-bold text-white">
                    {scannedToken}
                  </p>
                </div>

                <div className="w-full flex flex-col gap-3 mt-4">
                  <Button
                    onPress={() => executeCheckIn(scannedToken)}
                    isPending={isCheckingIn}
                    className="w-full h-[56px] rounded-[28px] bg-white text-black font-bold text-[14px] uppercase tracking-wider"
                  >
                    {({ isPending }) => (
                      <>
                        {isPending ? (
                          <Spinner color="current" size="sm" />
                        ) : null}
                        ยืนยัน
                      </>
                    )}
                  </Button>
                  <button
                    onClick={closeModal}
                    className="w-full h-[56px] rounded-[28px] bg-white/5 text-white/60 font-bold text-[12px] uppercase tracking-wider hover:bg-white/10 transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default ScanPage
