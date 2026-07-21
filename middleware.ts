import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const publicRoutes = new Set([
  "/login",
  "/forgot-password",
  "/otp",
  "/reset-password",
])

function isPublicRoute(pathname: string) {
  return publicRoutes.has(pathname)
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (token) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    "/((?!api/auth|api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
