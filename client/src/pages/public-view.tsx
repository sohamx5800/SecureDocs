import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { usePublicDocuments } from "@/hooks/use-documents";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DocumentViewer } from "@/components/doc-viewer";
import { Loader2, ShieldCheck, ArrowRight, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function PublicViewPage() {
  const [location] = useLocation();
  const [keyInput, setKeyInput] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Extract key from URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const keyFromUrl = params.get("key");
    if (keyFromUrl) {
      setActiveKey(keyFromUrl);
      setKeyInput(keyFromUrl);
    }
  }, []);

  const { data: documents, isLoading, error } = usePublicDocuments(activeKey || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.trim()) {
      setActiveKey(keyInput.trim());
      // Update URL without reload to make it shareable
      const newUrl = `${window.location.pathname}?key=${encodeURIComponent(keyInput.trim())}`;
      window.history.pushState({}, '', newUrl);
    }
  };

  // 1. Initial State: No key provided
  if (!activeKey) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-xl border-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="font-display font-bold text-2xl tracking-tight">Secure Access</h1>
            <p className="text-muted-foreground mt-2">Enter your access key to view documents.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              placeholder="Enter Access Key" 
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="text-center text-lg tracking-widest uppercase font-mono h-12"
              autoFocus
            />
            <Button type="submit" className="w-full h-12 text-base" disabled={!keyInput}>
              Access Documents
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p>Verifying access key...</p>
      </div>
    );
  }

  // 3. Error State (Invalid Key)
  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-xl border-border text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-destructive">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="font-display font-bold text-xl text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            The access key you entered is invalid or has expired.
          </p>
          <Button variant="outline" onClick={() => setActiveKey(null)} className="w-full">
            Try Different Key
          </Button>
        </Card>
      </div>
    );
  }

  // 4. Success State (Document List)
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold font-display text-lg">
            <ShieldCheck className="w-6 h-6" />
            <span>SecureDocs</span>
          </div>
          <div className="text-xs font-mono bg-muted px-3 py-1 rounded text-muted-foreground">
            KEY: {activeKey}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display">Shared Documents</h2>
          <p className="text-muted-foreground">
            {documents?.length} document{documents?.length !== 1 ? 's' : ''} available for view
          </p>
        </div>

        {!documents?.length ? (
          <div className="p-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
            <p className="text-muted-foreground">No documents have been shared with this key yet.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {documents.map((doc) => (
              <DocumentViewer key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </main>
      
      <footer className="py-8 text-center text-xs text-muted-foreground">
        Secure Document Sharing • Protected Content
      </footer>
    </div>
  );
}
