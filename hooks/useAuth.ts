import { useContext } from "react";
import { AuthContext, AuthContextType } from "@/providers/AuthProvider";

const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  loading: false,
  signOut: async () => {},
  refreshUser: async () => {},
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
}
