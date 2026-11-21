import {
  Link,
  useRouter,
  type ErrorComponentProps,
} from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <main className="grid min-h-svh place-items-center px-6 py-16">
      <div className="max-w-md space-y-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          ไม่พบหน้านี้
        </h1>
        <p className="text-muted-foreground">
          ไม่พบหน้าที่คุณต้องการ กรุณาตรวจสอบที่อยู่ หรือกลับไปหน้าแรก
        </p>
        <Button asChild>
          <Link to="/">กลับหน้าแรก</Link>
        </Button>
      </div>
    </main>
  )
}

export function RouteErrorPage({ reset }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <main className="grid min-h-svh place-items-center px-6 py-16">
      <div className="max-w-md space-y-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          ไม่สามารถโหลดหน้านี้ได้
        </h1>
        <p role="alert" className="text-muted-foreground">
          กรุณาลองใหม่อีกครั้ง หรือกลับไปหน้าแรก
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => {
              void router.invalidate()
              reset()
            }}
          >
            ลองอีกครั้ง
          </Button>
          <Button variant="outline" asChild>
            <a href="/">กลับหน้าแรก</a>
          </Button>
        </div>
      </div>
    </main>
  )
}
