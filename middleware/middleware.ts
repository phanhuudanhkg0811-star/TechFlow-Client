// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Lấy Secret Key y hệt như bên NestJS để giải mã
// Chú ý: Ở Next.js middleware, secret phải được encode thành Uint8Array
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('refreshToken')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login');
  const isCandidateRoute = pathname.startsWith('/tests');
  const isAdminRoute = pathname.startsWith('/dashboard');
  const isProtectedRoute = isCandidateRoute || isAdminRoute;

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Nếu CÓ token, tiến hành SOI HÀNG (Xác thực chữ ký)
  if (token) {
    try {
      // jwtVerify sẽ tự động check xem token có bị làm giả hay hết hạn không. 
      // Nếu giả, nó sẽ quăng lỗi văng xuống catch block.
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // Ép kiểu role (Ví dụ: 'HR' hoặc 'CANDIDATE')
      const userRole = payload.role as string; 

      // KỊCH BẢN A: Bảo vệ Dashboard (Chỉ HR/Admin mới được vào)
      if (isAdminRoute && userRole !== 'HR') {
        // Ứng viên táy máy gõ URL /dashboard -> Đá về khu vực làm test
        return NextResponse.redirect(new URL('/tests', request.url));
      }

      // KỊCH BẢN B: Bảo vệ khu vực ứng viên (Tùy chọn: HR không cần vào làm test)
      if (isCandidateRoute && userRole === 'HR') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // KỊCH BẢN C: Đã đăng nhập mà cố vào lại /login -> Điều hướng đúng sân nhà
      if (isAuthPage) {
        if (userRole === 'HR') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
          return NextResponse.redirect(new URL('/tests', request.url));
        }
      }

    } catch (error) {
      // BẮT QUẢ TANG: Token giả mạo, bị chỉnh sửa hoặc đã hết hạn
      console.error("Token xảo trá hoặc hết hạn:", error);
      
      // Xóa luôn cái cookie giả mạo đó và đá về trang login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('refresh_token');
      return response;
    }
  }

  // Mọi thứ hợp lệ, giấy tờ đầy đủ -> Mở cổng
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/tests/:path*',
    '/dashboard/:path*'
  ],
};