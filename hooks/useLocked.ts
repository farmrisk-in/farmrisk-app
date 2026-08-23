import { useAuth } from "@/hooks/useAuth";

/**
 * Hook to check if features should be locked.
 * Features are locked when there is no authenticated user.
 */
export function useLocked(): { isLocked: boolean } {
  const { user } = useAuth();
  return {
    isLocked: !user,
  };
}

export default useLocked;
