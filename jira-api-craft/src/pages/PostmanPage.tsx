import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { motion } from "framer-motion";
import { Key, Send, Code2, Copy, Loader2, CheckCircle, Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";

const PostmanPage = () => {
  const { postmanAccessToken, setPostmanAccessToken } = useAuth();
  const { isPostmanAuthenticated, loginPostman } = useAuth();
  const navigate = useNavigate();

  // Auth state (API-key only)
  const [showLogin, setShowLogin] = useState(!isPostmanAuthenticated);
  const [loginLoading, setLoginLoading] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(postmanAccessToken || "");

  // Collections (local state)
  const [collections, setCollections] = useState<{ id: string; name: string; createdAt?: string }[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  interface PostmanCollection {
    id?: string;
    name?: string;
    createdAt?: string;
    item?: PostmanCollectionItem[];
    items?: PostmanCollectionItem[];
    [key: string]: unknown;
  }
  interface PostmanCollectionItem {
    name?: string;
    item?: PostmanCollectionItem[];
    items?: PostmanCollectionItem[];
    [key: string]: unknown;
  }
  const [collectionDetails, setCollectionDetails] = useState<PostmanCollection | null>(null);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPostmanAuthenticated) setShowLogin(false);
  }, [isPostmanAuthenticated]);

  

  // Removed unused handleLogout



  type CollectionsApiResponse = {
    collections?: { id: string; name: string; createdAt?: string }[];
    error?: string;
  };
  const fetchCollections = React.useCallback(
    async (key?: string) => {
      try {
        const res = await api.getPostmanCollections() as CollectionsApiResponse;
        if (res.error) {
          // show nothing, but log
          console.warn('getPostmanCollections:', res.error);
          return;
        }

        const data = res.collections as { id: string; name: string; createdAt?: string }[];
        setCollections(data || []);
      } catch (err) {
        console.error('fetchCollections error', err);
      }
    },
    []
  );

  type CollectionDetailsApiResponse = {
    collection?: PostmanCollection;
    error?: string;
  };
  const fetchCollectionDetails = async (id: string) => {
    setSelectedCollectionId(id);
    setLoadingCollection(true);
    setCollectionDetails(null);
    try {
      const res = await api.getPostmanCollection(id, postmanAccessToken || undefined) as CollectionDetailsApiResponse;
      if (res.error) {
        toast.error(res.error || 'Failed to load collection');
        setCollectionDetails(null);
      } else {
        setCollectionDetails(res.collection);
      }
    } catch (err) {
      console.error('fetchCollectionDetails', err);
      toast.error('Failed to load collection');
    } finally {
      setLoadingCollection(false);
    }
  };

  const copyCollectionJson = async () => {
    if (!collectionDetails) return toast.warning('No collection loaded');
    try {
      const text = JSON.stringify(collectionDetails, null, 2);
      await navigator.clipboard.writeText(text);
      toast.success('Collection JSON copied to clipboard');
    } catch (e) {
      console.error('copyCollectionJson', e);
      toast.error('Failed to copy');
    }
  };

  const downloadCollectionJson = () => {
    if (!collectionDetails) return toast.warning('No collection loaded');
    try {
      const text = JSON.stringify(collectionDetails, null, 2);
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const name = (collectionDetails && (collectionDetails.name || selectedCollectionId)) || `collection-${selectedCollectionId}`;
      a.href = url;
      a.download = `${name}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Collection downloaded');
    } catch (e) {
      console.error('downloadCollectionJson', e);
      toast.error('Failed to download');
    }
  };

  const extractItemNames = (col: PostmanCollection): string[] => {
    const out: string[] = [];
    const walk = (items: PostmanCollectionItem[] | undefined) => {
      if (!items || !Array.isArray(items)) return;
      for (const it of items) {
        if (it && typeof it.name === 'string') out.push(it.name);
        // some Postman collections nest items under 'item'
        if (it && (it.item || it.items)) {
          walk((it.item as PostmanCollectionItem[]) || (it.items as PostmanCollectionItem[]));
        }
      }
    };
    if (col && (col.item || col.items)) walk((col.item as PostmanCollectionItem[]) || (col.items as PostmanCollectionItem[]));
    return out;
  };
  useEffect(() => {
    // on mount, if we have api key or logged in, load collections
    if (postmanAccessToken) {
      fetchCollections().catch(() => {});
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

  }, [fetchCollections, postmanAccessToken]);

  // no route param handling here; collection details live on their own page

  if (showLogin) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Login to Postman</h1>
            <p className="text-muted-foreground text-sm">Access your collections and generate API collections</p>
          </div>

          <form onSubmit={handleApiKeyLogin} className="space-y-4">
            <label className="block text-sm font-medium text-foreground">Postman API Key</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="PMAK-xxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                disabled={loginLoading}
              />
              <button
                type="submit"
                disabled={loginLoading}
                className="w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                {loginLoading ? "Connecting..." : "Use API Key"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">If you don't have an API key, leave the field empty and the generator will open.</p>
          </form>
        </motion.div>
      </div>
    );
  }

  // Handle API key login
  async function handleApiKeyLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const apiKey = apiKeyInput?.trim();
      if (!apiKey) {
        toast.error('API key is required');
        return;
      }
      const resp = await api.postmanLoginWithApiKey(apiKey);
      if (resp.success) {
        // persist key in app state and auth
        setPostmanAccessToken(apiKey);
        loginPostman({ name: 'Postman User', email: '' }, resp.token || apiKey);
        setShowLogin(false);
        toast.success('Connected to Postman');
        await fetchCollections();
      } else {
        toast.error(resp.error || 'Failed to connect Postman');
      }
    } catch (err) {
      console.error('handleApiKeyLogin', err);
      toast.error('Failed to connect Postman');
    } finally {
      setLoginLoading(false);
    }
  }


  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Postman Integration</h1>
          <p className="text-muted-foreground mt-1">Manage collections and generate test scripts</p>
        </div>
      </div>

      {/* Collections Section */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
              <Send className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Collections</h2>
              <p className="text-xs text-muted-foreground">Saved Postman collections</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">{collections.length} saved</div>
        </div>

        {collections.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No collections yet. Use "Create Collection" to save one.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map((c) => (
              <div key={c.id} className={`p-4 rounded-lg border border-border bg-background/50 hover:shadow-md ${selectedCollectionId === c.id ? 'ring-2 ring-orange-300' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => fetchCollectionDetails(c.id)}>
                    <h3 className="font-medium text-foreground">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{c.createdAt ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OpenCollectionButton collectionId={c.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {selectedCollectionId && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Collection Details</h3>
            <div className="flex items-center gap-2">
              <button onClick={copyCollectionJson} className="px-3 py-1.5 rounded-md bg-orange-100 text-orange-700 text-sm hover:bg-orange-200">Copy JSON</button>
              <button onClick={downloadCollectionJson} className="px-3 py-1.5 rounded-md bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm hover:opacity-90">Download JSON</button>
            </div>
          </div>
          {loadingCollection ? (
            <div className="text-sm text-muted-foreground">Loading collection...</div>
          ) : collectionDetails ? (
            (() => {
              const names = extractItemNames(collectionDetails);
              if (names.length === 0) {
                return <pre className="p-4 rounded-lg bg-muted text-sm font-mono text-foreground overflow-auto max-h-72">{JSON.stringify(collectionDetails, null, 2)}</pre>;
              }
              return (
                <div className="p-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-auto">
                    {names.map((n, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-border bg-background/60 shadow-sm hover:shadow-md">
                        <div className="text-sm font-medium text-foreground truncate">{n}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-sm text-muted-foreground">No details to show.</div>
          )}
        </motion.div>
      )}

      {/* API Key Section */}
      {/* <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
              <Key className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Postman API Key</h2>
              <p className="text-xs text-muted-foreground">Stored locally in your browser</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input type={showKey ? "text" : "password"} value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="PMAK-xxxxxxxxxxxxxxxx" className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
          </div>
      
        </div>
      </motion.div> */}

      {/* Create Collection */}
      {/* <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
            <Send className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Create Collection</h2>
            <p className="text-xs text-muted-foreground">{generatedEndpoints.length} endpoints available</p>
          </div>
        </div>
        <button onClick={createCollection} disabled={creatingCollection || !postmanApiKey || generatedEndpoints.length === 0} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">{creatingCollection ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 text-white" />}Create Collection from Generated APIs</button>
      </motion.div> */}

      {/* Test Scripts */}
      {/* <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">AI Test Scripts</h2>
            <p className="text-xs text-muted-foreground">Generate Postbot-like test scripts</p>
          </div>
        </div>

        <button onClick={generateTests} disabled={generatingTests} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mb-4">{generatingTests ? (<><Loader2 className="w-4 h-4 animate-spin" />AI is thinking...</>) : (<><Code2 className="w-4 h-4 text-white" />Generate Test Scripts</>)}</button>

        {(displayedScript || generatingTests) && (
          <div className="relative">
            {displayedScript && (<button onClick={() => { navigator.clipboard.writeText(testScripts); toast.success("Copied test scripts"); }} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground z-10"><Copy className="w-4 h-4" /></button>)}
            <pre className="p-4 rounded-lg bg-muted text-sm font-mono text-foreground overflow-x-auto max-h-96 whitespace-pre-wrap">{generatingTests && !displayedScript && (<span className="text-muted-foreground animate-pulse">Generating test scripts...</span>)}{displayedScript}{displayedScript && displayedScript.length < testScripts.length && (<span className="inline-block w-2 h-4 bg-orange-500 animate-pulse_glow ml-0.5" />)}</pre>
          </div>
        )}
      </motion.div> */}
    </div>
  );
};

export default PostmanPage;

function OpenCollectionButton({ collectionId }: { collectionId: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/dashboard/postman/collection/${encodeURIComponent(collectionId)}`)}
      className="px-3 py-1 rounded-md bg-orange-50 text-orange-700 text-sm hover:bg-orange-100"
    >
      Open
    </button>
  );
}
