import React, { useEffect, useState } from 'react';

import { BundleSkuDialogComponent } from './bundle-sku-dialog.component';
import { EditableTextfield } from '../../../ui/editable-textfield.component';
import { useUpdateBundleSku } from '../../queries/mutations/use-update-bundle-sku.mutation';

interface BundleSkuComponentProps {
  dialogOpen: boolean;
  setDialogOpen: (arg: boolean) => void;
  recommendationId: string;
  initialBundleSku?: string;
  cta?: boolean;
  resolved_status: string;
}

export const BundleSkuComponent: React.FC<BundleSkuComponentProps> = ({
  dialogOpen,
  setDialogOpen,
  recommendationId,
  initialBundleSku = '',
  cta = false,
  resolved_status
}) => {
  const [bundleSku, setBundleSku] = useState(initialBundleSku || '');
  const [bundleSkuTextfieldDisabled, setBundleSkuTextfieldDisabled] = useState(
    initialBundleSku ? true : false
  );
  const updateBundleSkuMutation = useUpdateBundleSku();

  useEffect(() => {
    // only when open in cta modal, because on recommendation page the dialog is permantly open when one recommendation has resolved status 'done'
    if (cta) {
      if (resolved_status === 'done') {
        setDialogOpen(true);
      }
    }
  }, [resolved_status, setDialogOpen, cta]);

  const updateBundleSku = () => {
    updateBundleSkuMutation.mutate({
      _id: recommendationId,
      bundle_sku: bundleSku
    });
    setDialogOpen(false);
    if (!cta) setBundleSkuTextfieldDisabled(true);
  };

  const handleCancelEdit = () => {
    const cancelValue = initialBundleSku || '';
    setBundleSku(cancelValue);
    setBundleSkuTextfieldDisabled(true);
  };

  const handleClose = () => {
    setBundleSku(initialBundleSku || '');
    setDialogOpen(false);
  };

  return (
    <>
      {dialogOpen && (
        <BundleSkuDialogComponent
          modalOpen={dialogOpen}
          handleClose={handleClose}
          updateBundleSku={updateBundleSku}
          bundleSku={bundleSku}
          setBundleSku={setBundleSku}
        />
      )}
      {!cta && resolved_status === 'done' && (
        <EditableTextfield
          inputValue={bundleSku}
          uniqueId={recommendationId}
          labelText='Bundle SKU'
          setValue={setBundleSku}
          disabled={bundleSkuTextfieldDisabled}
          setDisabled={setBundleSkuTextfieldDisabled}
          handleCancel={handleCancelEdit}
          handleUpdate={updateBundleSku}
          valueAlreadySet={initialBundleSku ? true : false}
          isRegEx
          dataCy='bundle-sku'
        />
      )}
    </>
  );
};
