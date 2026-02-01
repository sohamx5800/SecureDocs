import { AdminLayout } from "@/components/layout-admin";
import { useAccessKeys, useCreateAccessKey, useDeleteAccessKey } from "@/hooks/use-access-keys";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Trash2, 
  QrCode, 
  Copy, 
  Key, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import QRCode from "react-qr-code";
import { useToast } from "@/hooks/use-toast";

export default function AdminKeysPage() {
  const { data: keys, isLoading } = useAccessKeys();
  const { mutate: createKey, isPending: isCreating } = useCreateAccessKey();
  const { mutate: deleteKey } = useDeleteAccessKey();
  const { toast } = useToast();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState<{open: boolean, key: string, label: string | null}>({open: false, key: '', label: ''});
  const [newLabel, setNewLabel] = useState("");

  const downloadQRCode = () => {
    const svg = document.querySelector("#qr-code-svg");
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `qr-code-${qrOpen.key}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleCreate = () => {
    // Generate a random secure-ish string on client or let server handle.
    // Schema says `key` is required. Let's generate a random one here.
    const randomKey = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    
    createKey({ 
      key: randomKey.toUpperCase(),
      label: newLabel || undefined 
    }, {
      onSuccess: () => {
        setCreateOpen(false);
        setNewLabel("");
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Access key copied to clipboard." });
  };

  const getViewUrl = (key: string) => {
    return `${window.location.origin}/view`;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Access Keys</h1>
          <p className="text-muted-foreground mt-1">Manage secure access links for your clients.</p>
        </div>
        
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Generate New Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Access Key</DialogTitle>
              <DialogDescription>Create a new access key to share documents.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="label">Label (Optional)</Label>
              <Input 
                id="label" 
                placeholder="e.g. Client A - Q4 Report" 
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Key"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !keys?.length ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Key className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-medium text-foreground">No active keys</p>
            <p className="text-sm max-w-xs mt-1">Generate a key to start sharing documents.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead>Label</TableHead>
                <TableHead>Access Key</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id} className="hover:bg-muted/20 border-border/50">
                  <TableCell className="font-medium text-foreground">
                    {key.label || <span className="text-muted-foreground italic">No label</span>}
                  </TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-xs font-mono">{key.key}</code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {key.createdAt && format(new Date(key.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium border border-green-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Active
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => copyToClipboard(getViewUrl(key.key))}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Link</span>
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setQrOpen({ open: true, key: key.key, label: key.label })}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">QR</span>
                      </Button>
                      
                      <div className="w-px h-4 bg-border mx-1" />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke Access Key?</AlertDialogTitle>
                            <AlertDialogDescription>
                              The key <span className="font-mono font-semibold">{key.key}</span> will stop working immediately. 
                              Users with this link will no longer be able to view documents.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteKey(key.id)}
                            >
                              Revoke Key
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen.open} onOpenChange={(open) => setQrOpen(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Scan to Access</DialogTitle>
            <DialogDescription className="text-center">
              {qrOpen.label || "Document Access Code"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-border/50 shadow-inner">
            <div className="p-2 bg-white rounded-lg">
              <QRCode id="qr-code-svg" value={getViewUrl(qrOpen.key)} size={200} />
            </div>
            <p className="mt-4 font-mono text-sm bg-muted px-3 py-1 rounded">
              {qrOpen.key}
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
             <Button variant="outline" className="flex-1" onClick={() => copyToClipboard(getViewUrl(qrOpen.key))}>
               <Copy className="w-4 h-4 mr-2" />
               Copy Link
             </Button>
             <Button className="flex-1" onClick={downloadQRCode}>
               <QrCode className="w-4 h-4 mr-2" />
               Download PNG
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
