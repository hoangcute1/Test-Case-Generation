import React, { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Collection {
  id: string;
  name: string;
  createdAt?: string;
}

interface Props {
  onSelect: (collectionId: string) => void;
  selectedId?: string | null;
    issues: string[];
    onHandleGenerate: (collectionId: string, issues: string[]) => Promise<void>;
    showTitle: boolean;
}

const PostmanCollectionPicker: React.FC<Props> = ({ onSelect, selectedId = null, issues, onHandleGenerate, showTitle }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  interface PostmanCollectionsResponse {
    collections?: Collection[];
    error?: string;
    [key: string]: unknown;
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getPostmanCollections()
      .then((res: PostmanCollectionsResponse | Collection[]) => {
        if (!mounted) return;
        if (res && Array.isArray((res as PostmanCollectionsResponse).collections)) {
          setCollections((res as PostmanCollectionsResponse).collections!);
        } else if (Array.isArray(res)) {
          setCollections(res);
        } else {
          setCollections([]);
          if ((res as PostmanCollectionsResponse).error) toast.error((res as PostmanCollectionsResponse).error);
        }
      })
      .catch((e) => {
        console.error("getPostmanCollections failed", e);
        toast.error("Failed to load Postman collections");
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading collections...</span>
      </div>
    );
  }

  if (!loading && collections.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No collections available. <button onClick={() => navigate('/dashboard/postman')} className="underline">Connect Postman</button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showTitle && <div className="font-medium text-sm mb-1">Postman Collections</div>}
      <div className="grid grid-cols-1 gap-2">
        {collections.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full text-left p-3 rounded-md border ${selectedId === c.id ? 'border-primary/70 bg-primary/5' : 'border-border'} hover:shadow-sm`}
          >
            <div className="font-medium text-sm truncate">{c.name}</div>
            {c.createdAt && <div className="text-xs text-muted-foreground">{c.createdAt}</div>}
          </button>
        ))}
              
      </div>
    </div>
  );
};

export default PostmanCollectionPicker;
