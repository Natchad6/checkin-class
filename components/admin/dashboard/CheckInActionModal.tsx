"use client"

import React from "react"
import { IoCheckmarkCircle, IoWarning, IoCloseCircle } from "react-icons/io5"
import { Button, Spinner } from "@heroui/react"

interface Student {
  student_id: string
  firstname: string | null
  lastname: string | null
  email: string
  group: string | null
  token?: string
}

interface ActionResult {
  type: "success" | "warning" | "danger"
  title: string
  message: string | React.ReactNode
}

interface CheckInActionModalProps {
  isOpen: boolean
  onClose: () => void
  modalAction: {
    student: Student
    isCancel: boolean
  } | null
  isProcessingAction: boolean
  actionResult: ActionResult | null
  onConfirm: () => void
}

export function CheckInActionModal({
  isOpen,
  onClose,
  modalAction,
  isProcessingAction,
  actionResult,
  onConfirm,
}: CheckInActionModalProps) {
  if (!isOpen || !modalAction) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 px-6"
      onClick={onClose}
    >
      <div
        className="bg-[#111] border border-white/10 rounded-[32px] w-full max-w-sm overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {actionResult ? (
          <div className="px-8 pt-12 pb-8 flex flex-col items-center text-center">
            <div className="mb-6 animate-in zoom-in duration-500">
              {actionResult.type === "success" && (
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500/50">
                  <IoCheckmarkCircle size={48} className="text-green-500" />
                </div>
              )}
              {actionResult.type === "warning" && (
                <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center border-2 border-yellow-500/50">
                  <IoWarning size={48} className="text-yellow-500" />
                </div>
              )}
              {actionResult.type === "danger" && (
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500/50">
                  <IoCloseCircle size={48} className="text-red-500" />
                </div>
              )}
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              {actionResult.title}
            </h3>
            <div className="text-white/60 mb-10 leading-relaxed px-2 text-sm">
              {actionResult.message}
            </div>

            <Button
              onPress={onClose}
              className={`w-full h-[56px] rounded-[28px] font-bold text-[14px] uppercase tracking-wider ${
                actionResult.type === "success"
                  ? "bg-green-500 text-white"
                  : actionResult.type === "warning"
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
              <p className="font-bold text-white/40 mb-3 uppercase tracking-wider text-xs">
                {modalAction.isCancel ? "ยืนยันการยกเลิกเช็คอิน" : "ยืนยันการเช็คอิน"}
              </p>
              <p className="text-xl font-bold text-white mb-1">
                {modalAction.student.firstname} {modalAction.student.lastname}
              </p>
              <p className="text-sm font-semibold text-white/60">
                รหัสนิสิต: {modalAction.student.student_id}
              </p>
              {modalAction.student.token && (
                <p className="text-xs text-white/40 mt-1 font-mono">
                  Token: {modalAction.student.token}
                </p>
              )}
            </div>

            <div className="w-full flex flex-col gap-3 mt-4">
              <Button
                onPress={onConfirm}
                isPending={isProcessingAction}
                className={`w-full h-[56px] rounded-[28px] font-bold text-[14px] uppercase tracking-wider ${
                  modalAction.isCancel
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {({ isPending }) => (
                  <>
                    {isPending ? (
                      <Spinner color="current" size="sm" className="mr-2" />
                    ) : null}
                    ยืนยัน
                  </>
                )}
              </Button>
              <button
                onClick={onClose}
                className="w-full h-[56px] rounded-[28px] bg-white/5 text-white/60 font-bold text-[12px] uppercase tracking-wider hover:bg-white/10 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
