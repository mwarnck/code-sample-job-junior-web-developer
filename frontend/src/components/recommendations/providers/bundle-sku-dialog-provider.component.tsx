import { createContext, useState, useContext } from 'react';

type BundleSkuDialogContextProps = {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const BundleSkuDialogContext = createContext<BundleSkuDialogContextProps | false>(false);

type BundleSkuDialogProviderProps = {
  children: React.ReactNode;
};

export const BundleSkuDialogProvider: React.FC<BundleSkuDialogProviderProps> = ({ children }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <BundleSkuDialogContext.Provider value={{ dialogOpen, setDialogOpen }}>
      {children}
    </BundleSkuDialogContext.Provider>
  );
};

export const useBundleSkuDialog = (): BundleSkuDialogContextProps => {
  const context = useContext(BundleSkuDialogContext);
  if (!context) {
    throw new Error('useBundleSkuDialog must be called within a BundleSkuDialogProvider');
  }
  return context;
};
