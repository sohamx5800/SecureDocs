import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useDocuments() {
  return useQuery({
    queryKey: [api.documents.list.path],
    queryFn: async () => {
      const res = await fetch(api.documents.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch documents");
      return api.documents.list.responses[200].parse(await res.json());
    },
  });
}

export function usePublicDocuments(key: string) {
  return useQuery({
    queryKey: [api.documents.publicList.path, key],
    queryFn: async () => {
      // Pass key as query param
      const url = `${api.documents.publicList.path}?key=${encodeURIComponent(key)}`;
      const res = await fetch(url);
      
      if (res.status === 401) {
        throw new Error("Invalid access key");
      }
      if (!res.ok) throw new Error("Failed to fetch documents");
      
      return api.documents.publicList.responses[200].parse(await res.json());
    },
    enabled: !!key,
    retry: false,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(api.documents.create.path, {
        method: api.documents.create.method,
        body: formData, // Browser sets Content-Type to multipart/form-data automatically
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.documents.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to upload document");
      }
      
      return api.documents.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path] });
      toast({ title: "Success", description: "Document uploaded successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Upload failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.documents.delete.path, { id });
      const res = await fetch(url, { 
        method: api.documents.delete.method,
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to delete document");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path] });
      toast({ title: "Deleted", description: "Document removed successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Could not delete document", 
        variant: "destructive" 
      });
    },
  });
}
