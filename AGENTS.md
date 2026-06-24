<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## <!-- END:nextjs-agent-rules -->

## 🏗️ Project Rules & Tech Stack Standards

### **1. Core Architecture (Next.js & Bun)**

- **Bun Native**: ใช้ `bun` ในการรัน Dev Server, ติดตั้ง package, และรันสคริปต์ทั้งหมด
- **App Router**: ใช้ Next.js App Router (`app/`) เป็นหลัก
- **Server Components (RSC)**: ดึงข้อมูลใน Server Components เมื่อเป็นไปได้เพื่อประสิทธิภาพสูงสุด

### **2. Supabase Isolation Policy**

- **Server-Only Access**: ติดต่อ Database และ Auth ผ่าน **Next.js Server-side** เท่านั้น
- **No Client Import**: ห้ามเรียกใช้ `@supabase/supabase-js` หรือ `@supabase/ssr` ใน Script ฝั่ง Client (คอมโพเนนต์ `'use client'`) ยกเว้นส่วนของ Admin Realtime
- **Type Safety**: รัน `bunx supabase gen types typescript` เพื่อสร้าง Type ของ Database และใช้ในการสร้าง Supabase Client เสมอ

### **3. Backend Modular Architecture**

- **Module-Based Structure**: แยก Logic Backend ใน `src/app/api/[module]/` ตามโดเมนธุรกิจ Service ให้เขียนเป็น Class
- **Encapsulation**: แต่ละโมดูล API ควรมีไฟล์ `route.ts`, `service.ts`, และ `schema.ts` ภายในโฟลเดอร์ของตัวเองเพื่อแยกหน้าที่ชัดเจน
- **Zod Validation**: ข้อมูลที่ส่งมายัง API ต้องผ่านการ `.parse()` ด้วย **Zod** เสมอ และรอ **Throw Error** เมื่อเกิดข้อผิดพลาด
- **Standard Response**: ใช้ CreateSuccessResponse และ CreateErrorResponse ในการส่งกลับ Response

### **4. UI & Design System (HeroUI V3 & Figma)**

- **HeroUI V3**: ใช้คอมโพเนนต์จาก **HeroUI** เป็นหลัก ศึกษาผ่าน [v3.heroui.com/react/llms.txt](https://v3.heroui.com/react/llms.txt)
- **Figma Alignment**: พัฒนา UI ให้ตรงตามดีไซน์แบบ Pixel-perfect (Spacing, Typography, Colors)
- **React Icons**: ใช้ **react-icons** เพียงอย่างเดียวและปรับแต่งผ่าน Tailwind

---

## 📂 Modular Folder Structure (Server-Side Driven)

```text
app/
│   ├── (protected)/        # หน้าที่ต้องผ่านการตรวจสอบจาก proxy.ts
│   ├── (auth)/             # หน้า Login/Register
│   └── api/                # จุดเดียวที่มีการเรียกใช้ Supabase
│       └── [module]/       # แบ่งตามโดเมน (เช่น users, products)
│           ├── route.ts    # API Entry point
│           ├── service.ts  # Supabase call
│           └── schema.ts   # Zod validation schema
├── components/             # UI Components (PascalCase)
├── hooks/                  # Custom React Hooks (kebab-case)
├── types/                  # Type definitions
├── middleware.ts           # Proxy middleware
├── lib/
│   ├── axiosInstance.ts    # ตัวเชื่อม Client ไปยัง API Routes
│   └── supabase.ts         # Supabase Server Client (Service Role)
├── store/                  # Zustand Stores (Client state only)
└── proxy.ts                # Middleware

```

---

## 🔒 Security & Workflow

### **1. Backend Middleware (requireAuth)**

- **Internal Protection**: สร้างฟังก์ชัน `requireAuth()` เพื่อเช็ค Session ในทุก API Route ก่อนประมวลผล
- **Unauthorized**: หากไม่มี Session ให้ส่ง `401 Unauthorized` พร้อม Error message มาตรฐาน

### **2. Frontend Middleware (Server Redirect)**

- **Proxy/Middleware**: ใช้ `proxy.ts` จัดการ Auth State ตั้งแต่ระดับ Server ชื่อไฟล์ให้ใช้ proxy.ts เสมอ // ตรงกับ Next.js 16
- **Strict Redirect**: หาก User เข้าถึง Protected Routes โดยไม่มี Session ให้ `NextResponse.redirect` ไปยังหน้า `/login` ทันที
- **Token Refresh**: อัปเดต Auth Token ใน Cookies ให้เป็นปัจจุบันเสมอตามมาตรฐาน `@supabase/ssr`

### **3. Strict Coding Standards**

- **No Any**: ห้ามใช้ `any` เด็ดขาด ให้ใช้ `z.infer<typeof schema>` เสมอ
- **File Naming**: คอมโพเนนต์ใช้ `PascalCase.tsx`, ไฟล์ทั่วไปใช้ `kebab-case.ts`
- **Axios Error Handling**: ในการพัฒนาส่วน frontend ควรใช้ axios Instance ในการเรียกใช้งาน API ทุกครั้ง และในส่วน catch Error ให้มีการเช็คด้วยว่าเป็น Error ของอะไรเช่น axios.isAxiosError(error) เพื่อความปลอดภัย
- **Zustand**: ใช้ Zustand เป็น Library หลักในการจัดการ Global State

**Please Verify Before Done (Bun run typecheck)**
