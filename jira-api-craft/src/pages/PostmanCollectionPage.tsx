import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { motion } from "framer-motion";
import { Copy, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

const PostmanCollectionPage = () => {
  const params = useParams<{ collectionId?: string }>();
  const { collectionId } = params;
  const { postmanAccessToken } = useAuth();
  const navigate = useNavigate();

  type PostmanCollectionItem = { [key: string]: unknown };
  type PostmanCollection = { id?: string; name?: string; item?: PostmanCollectionItem[]; items?: PostmanCollectionItem[]; [key: string]: unknown };
  const [collection, setCollection] = useState<PostmanCollection | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!collectionId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getPostmanCollection(collectionId, postmanAccessToken || undefined);
        type ApiResponse = { collection?: PostmanCollection } | PostmanCollection;
        const isApiResponseWithCollection = (obj: unknown): obj is { collection: PostmanCollection } =>
          typeof obj === 'object' &&
          obj !== null &&
          'collection' in obj &&
          typeof (obj as { collection?: unknown }).collection === 'object' &&
          (obj as { collection?: unknown }).collection !== null;
        if (isApiResponseWithCollection(res)) setCollection(res.collection);
        else setCollection(res as PostmanCollection);
      } catch (e) {
        console.error('load collection', e);
        toast.error('Failed to load collection');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [collectionId, postmanAccessToken]);

  const copyJson = async () => {
    if (!collection) return toast.warning('No collection loaded');
    try {
      await navigator.clipboard.writeText(JSON.stringify(collection, null, 2));
      toast.success('Collection JSON copied');
    } catch (e) {
      console.error(e);
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Collection Details</h1>
          <p className="text-sm text-muted-foreground">Detailed view for collection {collectionId}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/dashboard/postman')} className="px-3 py-1 rounded-md border">Back to Collections</button>
          <button onClick={copyJson} className="px-3 py-1 rounded-md bg-muted">Copy JSON</button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
        ) : collection ? (
          <pre className="p-4 rounded bg-muted text-sm font-mono overflow-auto max-h-[60vh]">{JSON.stringify(collection, null, 2)}</pre>
        ) : (
          <div className="text-sm text-muted-foreground">No collection loaded.</div>
        )}
      </motion.div>
    </div>
  );
};

export default PostmanCollectionPage;
