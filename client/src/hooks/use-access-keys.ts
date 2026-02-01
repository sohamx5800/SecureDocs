import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertAccessKey } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAccessKeys() {
  return useQuery({
    queryKey: [api.accessKeys.list.path],
    queryFn: async () => {
      const res = await fetch(api.accessKeys.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch access keys");
      return api.accessKeys.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateAccessKey() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertAccessKey) => {
      const res = await fetch(api.accessKeys.create.path, {
        method: api.accessKeys.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create access key");
      return api.accessKeys.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.accessKeys.list.path] });
      toast({ title: "Success", description: "Access key generated" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Could not create access key", 
        variant: "destructive" 
      });
    },
  });
}

export function useDeleteAccessKey() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.accessKeys.delete.path, { id });
      const res = await fetch(url, { 
        method: api.accessKeys.delete.method,
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to delete access key");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.accessKeys.list.path] });
      toast({ title: "Deleted", description: "Access key revoked successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Could not delete access key", 
        variant: "destructive" 
      });
    },
  });
}
