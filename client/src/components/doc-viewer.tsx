import { FileText, Image as ImageIcon, Download, ExternalLink } from "lucide-react";
import { type Document } from "@shared/schema";
import { Button } from "@/components/ui/button";

export function DocumentViewer({ doc }: { doc: Document }) {
  const isPDF = doc.fileType === "pdf";
  const isImage = doc.fileType === "image";

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm animate-in">
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {isPDF ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-sm md:text-base leading-tight">{doc.title}</h3>
            <p className="text-xs text-muted-foreground">{doc.filename}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" asChild className="h-8 gap-2">
            <a href={doc.url} download target="_blank" rel="noopener noreferrer">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          </Button>
        </div>
      </div>
      
      <div className="bg-muted/10 min-h-[300px] flex items-center justify-center p-4">
        {isImage && (
          <img 
            src={doc.url} 
            alt={doc.title} 
            className="max-w-full max-h-[80vh] rounded shadow-lg object-contain"
          />
        )}
        
        {isPDF && (
          <div className="w-full h-[600px] md:h-[800px] bg-white rounded shadow-sm border border-border">
            <iframe 
              src={`${doc.url}#toolbar=0`} 
              className="w-full h-full rounded"
              title={doc.title}
            >
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
                <p>This browser does not support PDF embedding.</p>
                <Button asChild>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    Download PDF
                  </a>
                </Button>
              </div>
            </iframe>
          </div>
        )}
      </div>
    </div>
  );
}
