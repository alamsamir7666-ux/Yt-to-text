export { default } from "@kinde-oss/kinde-auth-nextjs/middleware";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sign-in|sign-up|api/auth).*)",
  ],
};
