import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const { isAuthenticated } = getKindeServerSession();
  if (await isAuthenticated()) redirect("/");

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            Transcript<span className="text-accent">AI</span>
          </h1>
          <p className="text-text-muted text-sm">YouTube video to text, instantly.</p>
        </div>

        {/* Card */}
        <div className="bg-bg-surface border border-border rounded-2xl p-8">
          <h2 className="font-display text-xl font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-text-muted text-sm mb-8">Sign in to your account to continue</p>

          <div className="flex flex-col gap-3">
            <LoginLink
              authUrlParams={{ connection_id: "google" }}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-white text-gray-900 font-medium text-sm hover:bg-gray-100 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </LoginLink>

            <LoginLink className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-bg-card border border-border text-white font-medium text-sm hover:border-accent/50 transition-colors">
              ✉️ Continue with Magic Link
            </LoginLink>
          </div>

          <p className="text-center text-text-muted text-xs mt-6">
            Don&apos;t have an account?{" "}
            <RegisterLink className="text-accent hover:underline">Sign up free</RegisterLink>
          </p>
        </div>
      </div>
    </main>
  );
}
