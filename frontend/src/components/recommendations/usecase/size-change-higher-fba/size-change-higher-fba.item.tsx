import { AmazonAccount } from '@/types/user/user-amazon-account.type';
import { Grid, Link, Stack } from '@mui/material';

import { ModalCtaBasic } from '@/components/assistant/components/modal/modal-cta-basic.component';
import { CtaSizeChangeHigherFba } from '@/components/assistant/types/assistant-cta.type';
import { SizeChangeHigherFbaRecommendation } from '@/types/recommendations/recommendation.type';
import { useTranslation } from 'next-i18next';

import UsecaseDetails from '../../components/details/recommendations.usecase-details.component';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Dropdown from '../../components/dropdown/recommendations.dropdown.component';
import ProductInfosGridItem from '../../components/products-info/recommendations.product-infos.component';
import {
  convertToCta,
  createDigitNumber,
  createDimensionsString,
  createWeightString
} from '../../helpers/recommendations.helpers.utils';
import useIsAutomatedAndNotAutomationAcc from '../../helpers/useIsAutomatedAndNotAutomationAcc';
import { useUpdateRecommendationsStatus } from '../../queries/mutations/use-update-recommendations-status.mutation';
import { UseCaseContainer } from '../usecases.style';
import { SizeChangeHigherFbaModalContent } from '@/components/assistant/components/cta/usecases/size-change-higher-fba/automation/size-change-higher-fba-modal-content.component';
// import { recommendationsConfig } from '../../recommendations.config';
import MessageModal from '../../components/messages/recommendations.message-dialog.component';
import useRecommendationsWriteAccess from '../../helpers/useRecommendationsWriteAccess';
import { useState } from 'react';
import { useUpdateRecommendationsCaseReimbursementId } from '../../queries/mutations/use-update-recommendations-case-reimbursement-id.mutation';
import { getTldFromLocale } from '@/components/dashboard/helpers/locale/get-tld-from-locale.helper';
import { EditableTextfield } from '@/components/ui/editable-textfield.component';
import { useIsAutomationAccount } from '../../helpers/useIsAutomationAccount';

interface ProductProps {
  productData: SizeChangeHigherFbaRecommendation;
  amazonAccount: AmazonAccount;
  isAutomated: boolean;
  fromConfirmMeasurementModal?: boolean;
}
// Amazon Messung überprüfen
export const dropdownItems = ['done', 'corrected', 'verified', 'not_interesting'];

const SizeChangeHigherFbaItem: React.FC<ProductProps> = ({
  productData,
  amazonAccount,
  isAutomated,
  fromConfirmMeasurementModal = false
}) => {
  const { t } = useTranslation(['recommendations', 'common']);
  const updateRecommendationStatusMutation = useUpdateRecommendationsStatus();
  const updateRecommendationCaseReimbursementIdMutation =
    useUpdateRecommendationsCaseReimbursementId();
  const isAutomatedAndNotAutomationAcc = useIsAutomatedAndNotAutomationAcc(isAutomated);
  const accountHasWriteAccess = useRecommendationsWriteAccess();

  const isAutomationAcc = useIsAutomationAccount();
  const isLastMessageFromArthy = productData.is_last_message_from_automation ?? false;
  const [caseId, setCaseId] = useState(productData?.case_id || '');
  const [caseIdTextfieldDisabled, setCaseIdTextfieldDisabled] = useState(
    productData?.case_id ? true : false
  );
  const domain = getTldFromLocale(amazonAccount?.default_marketplace_country);

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

  const handleChange = (status: string) => {
    updateRecommendationStatusMutation.mutate({
      _id: productData._id,
      status
    });
  };

  const ctaData = convertToCta.classic_cta(productData) as CtaSizeChangeHigherFba;

  if (isAutomatedAndNotAutomationAcc) {
    ctaData.automated = true;
  }

  return (
    <>
      {!fromConfirmMeasurementModal ? (
        <UseCaseContainer container data-cy='item-container'>
          <Grid item xs={12} sm={8} md={10}>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
              <ProductInfosGridItem
                image={productData?.image}
                name={productData?.name}
                asin={productData?.asin}
                sku={productData?.sku}
                fnsku={null}
              />
              <UsecaseDetails
                detailsLength={!['corrected'].includes(productData?.resolved_status) ? 7 : 4}
                usecase={productData?.usecase}
                details={[
                  ...(['corrected'].includes(productData?.resolved_status)
                    ? [
                        {
                          name: 'realized-savings',
                          value: createDigitNumber(
                            productData?.realized_savings,
                            productData?.currency
                          ),
                          customValueStyle: { color: 'success.dark' }
                        }
                      ]
                    : []),
                  ...(['corrected'].includes(productData?.resolved_status)
                    ? [
                        {
                          name: 'orders-since-corrected',
                          value: productData?.orders_since_corrected
                            ? productData?.orders_since_corrected
                            : 0,

                          customValueStyle: { color: 'success.dark' }
                        }
                      ]
                    : []),
                  ...(['corrected'].includes(productData?.resolved_status)
                    ? [
                        {
                          name: 'realized-average-saving-per-order',
                          value: createDigitNumber(
                            productData?.average_saving_per_order,
                            productData?.currency
                          ),
                          customValueStyle: { color: 'success.dark' }
                        }
                      ]
                    : []),
                  ...(!['corrected'].includes(productData?.resolved_status)
                    ? [
                        {
                          name: 'dimensions-before',
                          value: createDimensionsString(productData?.before?.dimensions)
                        }
                      ]
                    : []),
                  ...(!['corrected'].includes(productData?.resolved_status)
                    ? [
                        {
                          name: 'dimensions-after',
                          value: createDimensionsString(productData?.after?.dimensions)
                        }
                      ]
                    : []),
                  ...(!['corrected'].includes(productData?.resolved_status)
                    ? [
                        {
                          name: 'weight-before',
                          value: createWeightString(productData?.before?.weight)
                        }
                      ]
                    : []),
                  ...(!['corrected'].includes(productData?.resolved_status)
                    ? [
                        {
                          name: 'weight-after',
                          value: createWeightString(productData?.after?.weight)
                        }
                      ]
                    : []),
                  ...(!['corrected'].includes(productData?.resolved_status)
                    ? [
                        {
                          name: 'savings-unit',
                          value: createDigitNumber(
                            productData?.additional_fees?.average_per_unit,
                            productData?.currency
                          )
                        }
                      ]
                    : []),
                  ...(!['corrected'].includes(productData?.resolved_status)
                    ? [
                        {
                          name: 'savings-year',
                          value: createDigitNumber(
                            productData?.additional_fees?.yearly,
                            productData?.currency
                          )
                        }
                      ]
                    : []),
                  ...(['corrected', 'done'].includes(productData?.resolved_status)
                    ? [
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
                      ]
                    : [])
                ]}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <Stack spacing={2}>
              {!accountHasWriteAccess || isAutomatedAndNotAutomationAcc ? null : ( // TODO: recheck logic
                <EditableTextfield
                  inputValue={caseId}
                  // uniqueId={productData?.shipment_id}
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
              <Dropdown
                handleChange={handleChange}
                recoStatus={productData?.resolved_status || 'empty'}
                values={dropdownItems}
                usecase={productData?.usecase}
                isAutomated={isAutomated}
              />

              {productData?.resolved ||
              (isAutomatedAndNotAutomationAcc && productData.confirm_wrong_measurement) ? null : (
                <ModalCtaBasic
                  data={ctaData}
                  currency={amazonAccount?.currency}
                  defaultMarketplace={amazonAccount?.default_marketplace_country}
                  modalButtonText={ctaData.automated ? 'confirm-measurement' : undefined}
                >
                  {ctaData.automated && <SizeChangeHigherFbaModalContent cta={ctaData} />}
                </ModalCtaBasic>
              )}

              {isAutomationAcc ? (
                <MessageModal
                  messages={productData?.messages}
                  isLastMessageFromAutomation={isLastMessageFromArthy}
                  recommendationId={productData?._id}
                />
              ) : null}

              {isAutomatedAndNotAutomationAcc &&
              productData?.messages?.length &&
              isLastMessageFromArthy ? (
                <ModalCtaBasic
                  data={convertToCta.automation_message_cta(productData) as CtaSizeChangeHigherFba}
                  displayMode='stepper'
                  currency={amazonAccount?.currency}
                  defaultMarketplace={amazonAccount?.default_marketplace_country}
                  modalButtonText='show-message'
                />
              ) : null}
            </Stack>
          </Grid>
        </UseCaseContainer>
      ) : (
        <UseCaseContainer container>
          <Grid item xs={12} sm={12} md={12}>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
              <ProductInfosGridItem
                image={productData?.image}
                name={productData?.name}
                asin={productData?.asin}
                sku={productData?.sku}
                fnsku={null}
              />
              <UsecaseDetails
                detailsLength={6}
                usecase={productData?.usecase}
                details={[
                  {
                    name: 'dimensions-before',
                    value: createDimensionsString(productData?.before?.dimensions)
                  },
                  {
                    name: 'dimensions-after',
                    value: createDimensionsString(productData?.after?.dimensions)
                  },
                  {
                    name: 'weight-before',
                    value: createWeightString(productData?.before?.weight)
                  },
                  {
                    name: 'weight-after',
                    value: createWeightString(productData?.after?.weight)
                  },
                  {
                    name: 'additional-fee-per-unit',
                    value: createDigitNumber(
                      productData?.additional_fees?.average_per_unit,
                      productData?.currency
                    )
                  },
                  {
                    name: 'additional-fee-per-year',
                    value: createDigitNumber(
                      productData?.additional_fees?.yearly,
                      productData?.currency
                    )
                  }
                ]}
              />
            </Grid>
          </Grid>
        </UseCaseContainer>
      )}
    </>
  );
};

export default SizeChangeHigherFbaItem;
