import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Link,
  TextField,
  Typography
} from '@mui/material';

import { useRecommendationsStore } from '@/lib/state-management/useRecommendationsStore';
import { useUpdateRecommendationMessages } from '../../queries/mutations/use-update-recommendation-messages.mutation';
import MessageHistory from './recommendations.message-history';
import { useUpdateMessageMarkAsRead } from '@/components/messages/queries/mutations/use-update-messages.mutation';
import { useUserQ } from '@/lib/hooks/queries/useUser.query';
import { Message } from '@/types/recommendations/recommendation.type';

interface Props {
  messages?: Message[];
  recommendationId: string;
  isLastMessageFromAutomation: boolean;
}

const MessageModal: React.FC<Props> = ({
  messages,
  recommendationId,
  isLastMessageFromAutomation
}) => {
  const lastItem = messages?.[0];

  const { t } = useTranslation(['recommendations']);
  const messengerTextfieldValue = useRecommendationsStore((state) => state.messengerTextfieldValue);
  const setMessengerTextfieldValue = useRecommendationsStore(
    (state) => state.setMessengerTextfieldValue
  );
  const { data: user } = useUserQ();
  // (FIXED) TODO [REFACTOR AUTOMATION ASSIGNMENT]: use backend virtual property to check if last message is from arthy or not
  // (FIXED) TODO [AMZ-2345]: useIsAutomationAccount hook benutzen
  // const isLastMesssageFromArthy = lastItem?.sender === recommendationsConfig.automation_acc_id;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const updateRecommendationMessagesMutation = useUpdateRecommendationMessages();
  const updateMessageMarkAsReadMutation = useUpdateMessageMarkAsRead();
  const [replyRequired, setReplyRequired] = useState(true);
  const [messageWithCTA, setMessageWithCTA] = useState(true);

  const sendMessage = () => {
    updateRecommendationMessagesMutation.mutate({
      recommendation_id: recommendationId,
      new_message: messengerTextfieldValue,
      usecase: 'fba_missing_inbound',
      reply_required: replyRequired,
      with_cta: messageWithCTA
    });
    closeAndCleanModal();
  };

  useEffect(() => {
    // update message to read if dialog is open and last message receiver is current user
    if (isDialogOpen && lastItem && lastItem.receiver === user?._id) {
      updateMessageMarkAsReadMutation.mutate({
        messageId: lastItem!._id
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDialogOpen, lastItem, user?._id]);

  const getModalButtonKey = () => {
    if (messages?.length) {
      if (isLastMessageFromAutomation) {
        return { key: 'wait', buttonColor: 'background.paper' };
      }
      return { key: 'show', buttonColor: 'success.dark' };
    }
    return { key: 'write', buttonColor: 'primary.main' };
  };

  const closeAndCleanModal = () => {
    setMessengerTextfieldValue('');
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        data-cy='message-modal-button'
        variant={isLastMessageFromAutomation ? 'outlined' : 'contained'}
        onClick={() => setIsDialogOpen(true)}
        sx={{
          backgroundColor: getModalButtonKey().buttonColor
        }}
      >
        {t(
          `recommendations:recommendations.fba_missing_inbound.message-dialog.button-${
            getModalButtonKey().key
          }`,
          { defaultValue: '' }
        )}
      </Button>
      <Dialog
        open={isDialogOpen}
        maxWidth='md'
        fullWidth
        onClose={() => closeAndCleanModal()}
        data-cy='message-modal'
      >
        <DialogTitle>
          {t('recommendations:recommendations.fba_missing_inbound.message-dialog.title')}
        </DialogTitle>

        <DialogContent>
          {messages?.length ? (
            <Box
              sx={{
                p: 3,
                my: 2,
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.primary.main}`
              }}
              data-cy='modal-dialog-container-message'
            >
              <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                {t(
                  isLastMessageFromAutomation
                    ? 'recommendations:recommendations.fba_missing_inbound.message-dialog.automation-question'
                    : 'recommendations:recommendations.fba_missing_inbound.message-dialog.user-response'
                )}
              </Typography>
              {lastItem?.text}
            </Box>
          ) : null}

          {lastItem?.files?.length ? (
            <Box>
              <Typography sx={{ ml: 1 }}>
                {t(
                  'recommendations:recommendations.fba_missing_inbound.message-dialog.user-uploads'
                )}
              </Typography>
              <Box>
                {lastItem?.files.map((doc, idx) => (
                  <Link
                    key={doc + idx}
                    href={doc}
                    underline='none'
                    target='_blank'
                    rel='noreferrer'
                  >
                    <Button
                      data-cy='file-download-button'
                      variant='contained'
                      size='small'
                      onClick={() => null}
                      sx={{ ml: 1, mb: 1 }}
                    >
                      {doc.split('/')[doc.split('/').length - 1]}
                      <FileDownloadIcon sx={{ ml: 1 }} />
                    </Button>
                  </Link>
                ))}
              </Box>
              <Divider sx={{ m: 1 }} />
            </Box>
          ) : null}
          <Box sx={{ display: 'flex', justifyContent: 'end' }}>
            <MessageHistory recommendationId={recommendationId} items={messages} />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t(
              'recommendations:recommendations.fba_missing_inbound.message-dialog.input-label-message'
            )}
            value={messengerTextfieldValue}
            onChange={(e) => setMessengerTextfieldValue(e.target.value)}
            disabled={isLastMessageFromAutomation}
            inputProps={{
              'data-cy': 'message-textfield'
            }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button onClick={() => closeAndCleanModal()} variant='outlined' data-cy='close-button'>
            {t('recommendations:recommendations.fba_missing_inbound.message-dialog.close')}
          </Button>

          <div>
            <FormControlLabel
              control={
                <Checkbox
                  checked={replyRequired}
                  onChange={() => setReplyRequired(!replyRequired)}
                  data-cy='reply-required-checkbox'
                />
              }
              label={t(
                'recommendations:recommendations.fba_missing_inbound.message-dialog.reply-required'
              )}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={messageWithCTA}
                  onChange={() => setMessageWithCTA(!messageWithCTA)}
                  data-cy='reply-required-checkbox'
                />
              }
              label={t(
                'recommendations:recommendations.fba_missing_inbound.message-dialog.with-cta'
              )}
            />

            <Button
              disabled={messengerTextfieldValue.length < 5}
              variant='contained'
              onClick={() => sendMessage()}
              data-cy='send-button'
            >
              {t('recommendations:recommendations.fba_missing_inbound.message-dialog.send-message')}
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default MessageModal;
