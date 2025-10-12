import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

export type UploadedAsset = { id: string; url: string };

type RecentUploadsCtx = {
  items: UploadedAsset[];
  add: (asset: UploadedAsset) => void;
};

const Ctx = createContext<RecentUploadsCtx | null>(null);

export function RecentUploadsProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<UploadedAsset[]>([]);
  const api = useMemo<RecentUploadsCtx>(() => ({
    items,
    add: (asset) => setItems((prev) => [asset, ...prev.filter((a) => a.id !== asset.id)].slice(0, 10)),
  }), [items]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useRecentUploads(): RecentUploadsCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useRecentUploads must be used within RecentUploadsProvider');
  return v;
}


