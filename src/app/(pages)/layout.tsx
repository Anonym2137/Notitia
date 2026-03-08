import "./globals.css";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";

export const dynamic = 'force-dynamic';

export default async function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const supabase = await createClient()
  const data = await supabase.auth.getUser()

  let profile = null
  if (data.data.user) {
    const { data: profileData } = await supabase
      .from("users")
      .select("username, full_name")
      .eq("user_id", data.data.user.id)
      .single()
    profile = profileData
  }
  return (
    <>
      <NavBar user={data.data.user || null} profile={profile} />
      <PageTransition>{children}</PageTransition>
      <Footer />
      <BottomNav />
    </>
  );
}
