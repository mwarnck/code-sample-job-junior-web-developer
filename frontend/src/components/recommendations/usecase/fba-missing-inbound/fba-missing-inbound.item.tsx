import { useMemo, useState } from 'react';

import { AmazonAccount } from '@/types/user/user-amazon-account.type';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Button, Grid, Link, Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { CONFIG } from '@/lib/config/config';
import useApi from '@/lib/hooks/useApi';
import { ModalCtaBasic } from '@/components/assistant/components/modal/modal-cta-basic.component';
import { CtaFbaMissingInbounds } from '@/components/assistant/types/assistant-cta.type';
import {
  FbaMissingInboundRecommendation,
  IRefundBySkus
} from '@/types/recommendations/recommendation.type';

import UsecaseDetails from '../../components/details/recommendations.usecase-details.component';
import Dropdown from '../../components/dropdown/recommendations.dropdown.component';
import { EditableTextfield } from '../../../ui/editable-textfield.component';
import MessageModal from '../../components/messages/recommendations.message-dialog.component';
import ProductInfosGridItem from '../../components/products-info/recommendations.product-infos.component';
import {
  convertToCta,
  createDigitNumber,
  getUsecaseDetailsLength
} from '../../helpers/recommendations.helpers.utils';
import useIsAutomatedAndNotAutomationAcc from '../../helpers/useIsAutomatedAndNotAutomationAcc';
import useRecommendationsWriteAccess from '../../helpers/useRecommendationsWriteAccess';
import { useUpdateRecommendationsCaseReimbursementId } from '../../queries/mutations/use-update-recommendations-case-reimbursement-id.mutation';
import { useUpdateRecommendationsStatus } from '../../queries/mutations/use-update-recommendations-status.mutation';
// import { recommendationsConfig } from '../../recommendations.config';
import { UseCaseContainer } from '../usecases.style';
import { getTldFromLocale } from '@/components/dashboard/helpers/locale/get-tld-from-locale.helper';
import dayjs from 'dayjs';
import { useIsAutomationAccount } from '../../helpers/useIsAutomationAccount';

interface MissingInboundProps {
  productData: FbaMissingInboundRecommendation;
  amazonAccount: AmazonAccount;
  isAutomated: boolean;
  resolvedBy?: string;
  isOnboarding?: boolean;
}

// Fehlender Wareneingang
const FbaMissingInboundItem: React.FC<MissingInboundProps> = ({
  productData,
  amazonAccount,
  isAutomated,
  resolvedBy,
  isOnboarding = false
}) => {
  const { t } = useTranslation(['recommendations', 'common']);
  const accountHasWriteAccess = useRecommendationsWriteAccess();
  const isAutomatedAndNotAutomationAcc = useIsAutomatedAndNotAutomationAcc(isAutomated);
  const [callApi] = useApi();

  const isAutomationAcc = useIsAutomationAccount();
  const [caseId, setCaseId] = useState(productData?.case_id || '');
  const [caseIdTextfieldDisabled, setCaseIdTextfieldDisabled] = useState(
    productData?.case_id ? true : false
  );

  const domain = getTldFromLocale(amazonAccount.default_marketplace_country);

  useMemo(() => {
    setCaseId(productData?.case_id || '');
    setCaseIdTextfieldDisabled(productData?.case_id ? true : false);
  }, [productData?.case_id]);

  const isLastMessageFromAutomation = productData?.is_last_message_from_automation ?? false;

  const dropdownValues = [
    'done',
    'reimbursed',
    'rejected',
    'not_shipped',
    'expired',
    'stock_found',
    'commercial_invoice',
    'proof_of_service',
    'confirm_quantity',
    'not_interesting'
  ];

  const updateRecommendationStatusMutation = useUpdateRecommendationsStatus();
  const updateRecommendationCaseReimbursementIdMutation =
    useUpdateRecommendationsCaseReimbursementId();

  const handleChange = (status: string) => {
    updateRecommendationStatusMutation.mutate({
      _id: productData._id,
      status,
      resolver: resolvedBy
    });
  };

  const updateCaseId = () => {
    updateRecommendationCaseReimbursementIdMutation.mutate({
      _id: productData._id,
      case_reimbursement_id: caseId
    });
    setCaseIdTextfieldDisabled(true);
  };
  const handleCancelEdit = () => {
    const cancelValue = productData?.case_id || '';
    setCaseId(cancelValue);
    setCaseIdTextfieldDisabled(true);
  };

  const getPackinglist = () => {
    callApi(
      `${CONFIG.API.ENDPOINT}/recommendations/${productData?._id}/generate-packing-list`,
      'get',
      {
        errorNotification: true,
        onSuccess: (blob) => {
          // @ts-ignore
          const blobResult = new Blob([blob], { type: 'application/pdf' });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blobResult);
          link.download = `packingList_${productData?.shipment_id}.pdf`;
          link.click();
        }
      }
    );
  };

  const ctaForModal = convertToCta.classic_cta(productData) as CtaFbaMissingInbounds;

  if (isAutomatedAndNotAutomationAcc) {
    ctaForModal.automated = true;
  }

  const usecaseLength = (customLength = 0, dataKeys: string[] = []) => {
    let length = getUsecaseDetailsLength(customLength, productData, dataKeys);

    if (isAutomationAcc) {
      length += 1;
    }

    return length;
  };

  return (
    <UseCaseContainer container spacing={2}>
      <Grid item xs={12} sm={8} md={10}>
        <Stack spacing={2} useFlexGap>
          <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            <UsecaseDetails
              detailsLength={usecaseLength(5, [
                'reimbursement_quantity',
                'stock_found_quantity'
                // no added length for reimbursement_amount because instead the potential reimbursement will not shown
                // 'reimbursement_amount'
              ])}
              usecase={productData?.usecase}
              details={[
                ...(productData?.reimbursement_amount > 0 ||
                productData?.stock_found_quantity > 0 ||
                productData?.reimbursement_quantity > 0
                  ? [
                      {
                        name: 'reimbursement-amount-total',
                        value: createDigitNumber(
                          productData?.reimbursement_amount > 0
                            ? productData?.reimbursement_amount
                            : 0,
                          productData?.currency
                        ),
                        customValueStyle: {
                          color: 'success.dark'
                        }
                      }
                    ]
                  : []),
                ...(productData?.reimbursement_quantity > 0
                  ? [
                      {
                        name: 'reimbursement-quantity-total',
                        value: productData?.reimbursement_quantity,
                        customValueStyle: {
                          color: 'success.dark'
                        }
                      }
                    ]
                  : []),
                ...(productData?.stock_found_quantity > 0
                  ? [
                      {
                        name: 'stock-found-quantity-total',
                        value: productData?.stock_found_quantity,
                        customValueStyle: {
                          color: 'success.dark'
                        }
                      }
                    ]
                  : []),
                ...(!productData?.reimbursement_amount &&
                !productData?.stock_found_quantity &&
                !productData?.reimbursement_quantity
                  ? [
                      {
                        name: 'refund-total',
                        value: [
                          'reimbursed',
                          'rejected',
                          'not_shipped',
                          'expired',
                          'stock_found',
                          'not_interesting'
                        ].includes(productData?.resolved_status)
                          ? createDigitNumber(0, productData?.currency)
                          : createDigitNumber(productData?.refund_total, productData?.currency)
                      }
                    ]
                  : []),
                {
                  name: 'missings-total',
                  value: productData?.missings_total
                },
                {
                  name: 'shipment-id',
                  value: (
                    <Link
                      target='_blank'
                      rel='noopener noreferrer'
                      href={`https://sellercentral.amazon.${domain}/fba/inbound-shipment/summary/${productData?.shipment_id}/contents`}
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      {productData?.shipment_id}
                      <OpenInNewIcon
                        sx={{
                          width: '24px',
                          height: '24px',
                          ml: 0.5
                        }}
                      />
                    </Link>
                  )
                },
                {
                  name: 'shipment-date',
                  value: productData?.shipment_date
                    ? dayjs(productData?.shipment_date).format(t('common:general.date.long'))
                    : t('recommendations:recommendations.fba_missing_inbound.case-id-not-available')
                },
                accountHasWriteAccess || isAutomatedAndNotAutomationAcc
                  ? {
                      name: 'case-id',
                      value: caseId ? (
                        <Link
                          target='_blank'
                          rel='noopener noreferrer'
                          href={`https://sellercentral.amazon.${domain}/cu/case-dashboard/view-case?caseID=${caseId}`}
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          {caseId}
                          <OpenInNewIcon
                            sx={{
                              width: '24px',
                              height: '24px',
                              ml: 0.5
                            }}
                          />
                        </Link>
                      ) : (
                        t(
                          'recommendations:recommendations.fba_missing_inbound.case-id-not-available'
                        )
                      )
                    }
                  : null
              ]}
            />
          </Grid>
          {productData.refund_by_skus.map((sku: IRefundBySkus) => (
            <Grid
              key={sku.sku}
              container
              spacing={{ xs: 2, md: 3 }}
              columns={{ xs: 4, sm: 8, md: 12 }}
            >
              <ProductInfosGridItem
                image={sku?.image}
                name={sku?.name}
                asin={sku?.asin}
                sku={sku?.sku}
                fnsku={null}
              />
              <UsecaseDetails
                detailsLength={usecaseLength(5, [])}
                usecase={productData?.usecase}
                details={[
                  {
                    name: 'refund',
                    value: [
                      'reimbursed',
                      'rejected',
                      'not_shipped',
                      'expired',
                      'stock_found',
                      'not_interesting'
                    ].includes(productData?.resolved_status)
                      ? createDigitNumber(0, productData?.currency)
                      : createDigitNumber(sku?.refund, productData?.currency)
                  },
                  {
                    name: 'missings',
                    value: sku?.missings
                  },
                  {
                    name: 'quantity-shipped',
                    value: sku?.quantity_shipped
                  },
                  {
                    name: 'quantity-received',
                    value: sku?.quantity_received
                  }
                ]}
              />
            </Grid>
          ))}
        </Stack>
      </Grid>
      <Grid item xs={12} sm={4} md={2}>
        <Stack spacing={2}>
          {!accountHasWriteAccess || isAutomatedAndNotAutomationAcc || isOnboarding ? null : ( // TODO: recheck logic
            <EditableTextfield
              inputValue={caseId}
              uniqueId={productData?.shipment_id}
              labelText={t('recommendations:recommendations.fba_missing_inbound.case-id')}
              setValue={setCaseId}
              disabled={caseIdTextfieldDisabled}
              setDisabled={setCaseIdTextfieldDisabled}
              handleCancel={handleCancelEdit}
              handleUpdate={updateCaseId}
              valueAlreadySet={productData?.case_id ? true : false}
              isRegEx
              dataCy='recommendation-id'
              maxInputLength={15}
            />
          )}
          {isOnboarding ? null : (
            <Dropdown
              handleChange={handleChange}
              recoStatus={productData?.resolved_status || 'empty'}
              values={dropdownValues}
              usecase={productData?.usecase}
              isAutomated={isAutomated}
            />
          )}

          {productData?.resolved || isAutomatedAndNotAutomationAcc ? null : (
            <ModalCtaBasic
              data={ctaForModal}
              displayMode='stepper'
              currency={amazonAccount?.currency}
              defaultMarketplace={amazonAccount?.default_marketplace_country}
            />
          )}

          {isAutomationAcc ? (
            <>
              <Button
                data-cy='packinglist-button'
                variant='contained'
                onClick={() => getPackinglist()}
              >
                {t('recommendations:recommendations.fba_missing_inbound.packinglist')}
                <FileDownloadIcon sx={{ ml: 1 }} />
              </Button>

              <MessageModal
                messages={productData?.messages}
                recommendationId={productData?._id}
                isLastMessageFromAutomation={isLastMessageFromAutomation}
              />
            </>
          ) : null}

          {isAutomatedAndNotAutomationAcc &&
          productData?.messages?.length &&
          isLastMessageFromAutomation ? (
            <ModalCtaBasic
              data={convertToCta.automation_message_cta(productData) as CtaFbaMissingInbounds}
              displayMode='stepper'
              modalButtonText='show-message'
              currency={amazonAccount?.currency}
              defaultMarketplace={amazonAccount?.default_marketplace_country}
            />
          ) : null}
        </Stack>
      </Grid>
    </UseCaseContainer>
  );
};

export default FbaMissingInboundItem;
