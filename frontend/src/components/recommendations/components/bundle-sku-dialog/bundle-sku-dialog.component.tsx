import React from 'react';

import { Box, DialogActions, DialogContent, TextField } from '@mui/material';

import { useTranslation } from 'next-i18next';
import { CtaButton } from '@/components/assistant/components/buttons/cta-button.component';
import ModalDialogContainer from '@/components/assistant/components/modal/modal-dialog-container.component';

interface BundleSkuDialogComponentProps {
  modalOpen: boolean;
  handleClose: () => void;
  updateBundleSku: () => void;
  bundleSku: string;
  setBundleSku: (arg: string) => void;
}

export const BundleSkuDialogComponent: React.FC<BundleSkuDialogComponentProps> = ({
  modalOpen,
  handleClose,
  updateBundleSku,
  bundleSku,
  setBundleSku
}) => {
  const { t } = useTranslation(['recommendations']);
  const title = t('recommendations:recommendations.bundle-sku-dialog.title');
  const subtitle = t('recommendations:recommendations.bundle-sku-dialog.subtitle');

  return (
    <ModalDialogContainer
      modalOpen={modalOpen}
      onClose={handleClose}
      title={title}
      message={subtitle}
      dataCy='bundle-sku-dialog'
      maxWidth='md'
    >
      <DialogContent>
        <TextField
          label={'Bundle-SKU'}
          onChange={(e) => setBundleSku(e.target.value)}
          value={bundleSku || ''}
          size='small'
          sx={{ mr: 1, mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <CtaButton onClick={handleClose} variant='outlined'>
          {t('recommendations:recommendations.bundle-sku-dialog.back')}
        </CtaButton>
        <Box sx={{ display: 'inline-flex' }}>
          <CtaButton onClick={updateBundleSku} variant='contained' disabled={bundleSku === ''}>
            {t('recommendations:recommendations.bundle-sku-dialog.submit')}
          </CtaButton>
        </Box>
      </DialogActions>
    </ModalDialogContainer>
  );
};
