// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose'; // Đổi từ jwtVerify sang decodeJwt

export function proxy(request: NextRequest) { // ĐỔI TÊN HÀM THÀNH middleware
  // Lấy thẳng accessToken vì role thường nằm ở đây
  const accessToken = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login');
  const isProtectedRoute = pathname.startsWith('/tests') || pathname.startsWith('/dashboard');

  // --- BƯỚC 1: THIẾU ACCESS TOKEN KHI VÀO TRANG BẢO MẬT ---
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(loginUrl);
  }

  // --- BƯỚC 2: DECODE LẤY ROLE TỪ ACCESS TOKEN ---
  if (accessToken) {
    try {
      // Decode để đọc nội dung token mà không cần Secret Key, tránh lỗi sập Edge
      const payload = decodeJwt(accessToken);
      
      // LƯU Ý: Đảm bảo NestJS cấu hình role nằm đúng ở đây.
      // Nếu log ra thấy role nằm trong user, hãy đổi thành: payload.user?.role
      const userRole = payload.role as string; 
      
      const isAdminRoute = pathname.startsWith('/dashboard');
      const isCandidateRoute = pathname.startsWith('/tests');

      // Đã đăng nhập hợp lệ -> Không cho ở lại trang Login
      if (isAuthPage) {
        return NextResponse.redirect(
          new URL(userRole === 'HR' ? '/dashboard' : '/tests', request.url)
        );
      }

      // KỊCH BẢN: SAI QUYỀN HẠN (FORBIDDEN) -> Giữ ở đúng khu vực và báo lỗi
      if (isAdminRoute && userRole !== 'HR') {
        const fallbackUrl = new URL('/tests', request.url);
        fallbackUrl.searchParams.set('error', 'forbidden');
        return NextResponse.redirect(fallbackUrl); // Đá về /tests kèm báo lỗi
      }
      
      if (isCandidateRoute && userRole === 'HR') {
        const fallbackUrl = new URL('/dashboard', request.url);
        fallbackUrl.searchParams.set('error', 'forbidden');
        return NextResponse.redirect(fallbackUrl); // Đá về /dashboard kèm báo lỗi
      }

    } catch (error) {
      console.error("Lỗi khi decode token:", error);
      
      if (isAuthPage) return NextResponse.next();

      // Chỉ rơi vào đây khi Access Token bị biến dạng (rác)
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/tests/:path*', '/dashboard/:path*', '/tests'],
};