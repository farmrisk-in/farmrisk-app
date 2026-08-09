import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { SavedField, NewFieldRecord } from "@/types/fields";
import { listFields, saveField, deleteField } from "@/lib/farms/storage";

export function useFields() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;

  const query = useQuery({
    queryKey: ["saved-fields", userId],
    queryFn: () => listFields(userId),
  });

  const saveMutation = useMutation({
    mutationFn: (input: NewFieldRecord) => saveField(userId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-fields", userId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteField(userId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-fields", userId] }),
  });

  return {
    fields: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    saveField: saveMutation.mutateAsync,
    deleteField: deleteMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch: query.refetch,
  };
}
