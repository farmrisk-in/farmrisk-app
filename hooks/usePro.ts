import { useAuth } from "@/hooks/useAuth";

export function usePro() {
  const { user, session, loading } = useAuth();

  const isPro = !loading && !!session && !!user;

  const firstName = (user?.user_metadata?.first_name as string) || "";
  const lastName = (user?.user_metadata?.last_name as string) || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const email = user?.email || "";

  return {
    isPro,
    loading,
    user,
    firstName,
    lastName,
    fullName,
    email,
  };
}
