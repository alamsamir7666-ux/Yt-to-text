import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import DashboardWrapper from "@/components/layout/DashboardWrapper";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, getUser } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    redirect("/sign-in");
  }

  const user = await getUser();

  return <DashboardWrapper user={user}>{children}</DashboardWrapper>;
}
