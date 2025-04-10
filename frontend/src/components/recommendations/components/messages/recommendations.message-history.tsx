import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Divider,
  Link,
  Typography
} from '@mui/material';

import dayjs from 'dayjs';
import { AssistantAvatarComponent } from '@/components/assistant/components/assistant/assistant-avatar.component';
// import { recommendationsConfig } from '../../recommendations.config';
import { useUpdateRecommendationMessagesMarkAllAsRead } from '../../queries/mutations/use-update-recommendation-messages-mark-all-as-read.mutation';
import { Message } from '@/types/recommendations/recommendation.type';
import { useIsAutomationAccount } from '../../helpers/useIsAutomationAccount';
import { useUserQ } from '@/lib/hooks/queries/useUser.query';

interface Props {
  recommendationId: string;
  items?: Message[];
}

const MessageHistory: React.FC<Props> = ({ recommendationId, items }) => {
  const { data: user } = useUserQ();
  const { t } = useTranslation(['recommendations', 'common']);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const updateRecommendationMessagesMarkAllAsReadMutation =
    useUpdateRecommendationMessagesMarkAllAsRead();
  // (FIXED) TODO [AMZ-2345]: useIsAutomationAccount hook benutzen
  const isAutomationUser = useIsAutomationAccount();

  useEffect(() => {
    if (isDialogOpen && recommendationId) {
      updateRecommendationMessagesMarkAllAsReadMutation.mutate(recommendationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDialogOpen, recommendationId]);

  const getMessage = (item) => {
    // const isArthyMessage = item.sender === recommendationsConfig.automation_acc_id;
    // (FIXED) TODO [AMZ-2345]: useIsAutomationAccount hook benutzen
    let isArthyMessage = false;
    if (isAutomationUser) {
      isArthyMessage = item.sender === user?._id ? true : false;
    } else {
      isArthyMessage = item.sender !== user?._id ? true : false;
    }
    const isOwnMessage = user?._id === item.sender;

    return (
      <Box
        sx={{
          justifyContent: isOwnMessage ? 'end' : 'start',
          mt: 4,
          display: 'flex'
        }}
      >
        <Box sx={{ maxWidth: '70%', minWidth: '20%', display: 'flex' }}>
          <Typography
            component='span'
            sx={{
              position: 'relative',
              border: '1px solid',
              p: 2,
              minWidth: 194,

              borderRadius: 2,
              borderColor: (theme) =>
                isOwnMessage ? theme.palette.grey[500] : theme.palette.primary.main,
              boxShadow: (theme) =>
                `1px 1px 4px 0 ${
                  isOwnMessage ? theme.palette.grey[600] : theme.palette.primary.light
                }`
            }}
          >
            {item.text}
            {isArthyMessage ? (
              <Box
                sx={{
                  position: 'absolute',
                  left: -20,
                  top: -20,
                  width: 8
                }}
              >
                <AssistantAvatarComponent isLoading={false} isMinimized={false} avatarSize={40} />
              </Box>
            ) : null}

            <Typography
              sx={{
                position: 'absolute',
                right: 8,
                bottom: -24,
                color: (theme) => theme.palette.grey[500]
              }}
              variant='body2'
            >
              {dayjs(item.created_at).format(`${t('common:general.date.longEscapeSafe')} / HH:MM`)}
            </Typography>
          </Typography>

          <Box>
            {item?.files?.map((doc, idx) => (
              <Link key={doc + idx} href={doc} underline='none' target='_blank' rel='noreferrer'>
                <Button
                  data-cy='products-upload-modal-download-button'
                  variant='contained'
                  size='small'
                  onClick={() => null}
                  sx={{ ml: 1, mb: 1 }}
                >
                  <FileDownloadIcon />
                </Button>
              </Link>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Button disabled={!items?.length} onClick={() => setIsDialogOpen(true)}>
        {t(
          'recommendations:recommendations.fba_missing_inbound.message-dialog.show-message-history'
        )}
      </Button>
      <Dialog open={isDialogOpen} fullWidth maxWidth='md' onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>
          {t('recommendations:recommendations.fba_missing_inbound.message-dialog.message-history')}
        </DialogTitle>
        <Box sx={{ p: 4 }}>
          {items
            ?.map((item, idx) => (
              <Fragment key={`${item?.text}-text-${idx}`}>{getMessage(item)}</Fragment>
            ))
            .reverse()}
        </Box>
        <Divider sx={{ m: 1, mt: 2 }} />
        <DialogActions sx={{ justifyContent: 'start', mb: 1 }}>
          <Button sx={{ ml: 2 }} variant='outlined' onClick={() => setIsDialogOpen(false)}>
            {t('recommendations:recommendations.fba_missing_inbound.message-dialog.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default MessageHistory;
