import { test, expect } from '@playwright/experimental-ct-react';

import fakeAmazonAccount from '../../../tests/db/data/amazonAccount';
import { minimalRecommendation } from '../../../tests/db/data/recommendations';
// import { CONFIG } from "@/lib/config/config";
import userWithSomeAccounts from '../../../tests/db/data/user-with-some-accounts';
import Recommendations from './recommendations.component';
import { AbilityWrapper } from '@/playwright/utils/AbilityWrapper';

const amazonAccount = fakeAmazonAccount.minimal();
amazonAccount.status = 'finished';
amazonAccount.synch_dashboard = {
  status: 'finished'
};

const user = userWithSomeAccounts(1, 2).currentUser;
user.userModules = [
  // @ts-ignore
  ...user.userModules,
  // @ts-ignore
  { key: 'paid' }
];

const recommendations = {
  fba_misplaced_damaged_inventory: {
    ...minimalRecommendation.fba_misplaced_damaged_inventory(),
    automated: true
  }
};

const sharedAmazonAccount = fakeAmazonAccount.minimal();
sharedAmazonAccount.status = 'finished';
sharedAmazonAccount.synch_dashboard = {
  status: 'finished'
};
sharedAmazonAccount.permission = {
  resolved: [
    {
      name: 'recommendations',
      access: ['read']
    }
  ],

  type: 'role',
  value: 'analyst'
};

test.describe('Recommendations Component', () => {
  test('renders the recommendations component', async ({ mount }) => {
    const mockUseAmazonAccountsQ = () => ({
      isLoading: false,
      data: [amazonAccount]
    });

    const mockUseUserQ = () => ({
      isLoading: false,
      data: user
    });

    const mockUseRecommendationsQuery = () => ({
      isLoading: false,
      data: recommendations
    });
    const mockUseSelectedAccPaidStatusQ = () => ({
      isLoading: false,
      fetchStatus: 'idle',
      data: { isSelectedAccPaid: true }
    });
    // const mockUseFlag = () => true;

    const component = await mount(
      <AbilityWrapper roles={['unlimited', 'paid']}>
        <Recommendations
          // @ts-ignore
          useAmazonAccountsQ={mockUseAmazonAccountsQ()}
          // @ts-ignore
          useUserQ={mockUseUserQ()}
          // @ts-ignore
          useRecommendationsQuery={mockUseRecommendationsQuery()}
          // @ts-ignore
          useSelectedAccPaidStatusQ={mockUseSelectedAccPaidStatusQ()}
          // useFlag={mockUseFlag}
        />
      </AbilityWrapper>,
      {
        hooksConfig: {
          setAmazonAccount: {
            ...amazonAccount
          }
        }
      }
    );

    await expect(component.getByTestId('recommendations-component')).toBeVisible();
  });

  test('shows the automated status', async ({ mount }) => {
    const mockUseAmazonAccountsQ = () => ({
      isLoading: false,
      data: [amazonAccount]
    });

    const mockUseUserQ = () => ({
      isLoading: false,
      data: user
    });

    const mockUseRecommendationsQuery = () => ({
      isLoading: false,
      data: recommendations
    });
    const mockUseSelectedAccPaidStatusQ = () => ({
      isLoading: false,
      fetchStatus: 'idle',
      data: { isSelectedAccPaid: true }
    });
    // const mockUseFlag = () => true;

    const component = await mount(
      <AbilityWrapper roles={['unlimited', 'paid']}>
        <Recommendations
          // @ts-ignore
          useAmazonAccountsQ={mockUseAmazonAccountsQ()}
          // @ts-ignore
          useUserQ={mockUseUserQ()}
          // @ts-ignore
          useRecommendationsQuery={mockUseRecommendationsQuery()}
          // @ts-ignore
          useSelectedAccPaidStatusQ={mockUseSelectedAccPaidStatusQ()}
          // useFlag={mockUseFlag}
        />
      </AbilityWrapper>,
      {
        hooksConfig: {
          setAmazonAccount: {
            ...amazonAccount
          }
        }
      }
    );

    await expect(component.getByTestId('recommendations-header-automated-icon')).toBeVisible();
  });

  test.skip('dropdown should not be disabled', async ({ mount }) => {
    recommendations.fba_misplaced_damaged_inventory.automated = false;
    const mockUseAmazonAccountsQ = () => ({
      isLoading: false,
      data: [amazonAccount]
    });

    const mockUseUserQ = () => ({
      isLoading: false,
      data: user
    });

    const mockUseRecommendationsQuery = () => ({
      isLoading: false,
      data: {
        fba_misplaced_damaged_inventory: {
          ...minimalRecommendation.fba_misplaced_damaged_inventory(),
          automated: false
        }
      }
    });
    const mockUseSelectedAccPaidStatusQ = () => ({
      isLoading: false,
      fetchStatus: 'idle',
      data: { isSelectedAccPaid: true }
    });
    // const mockUseFlag = () => true;

    const component = await mount(
      <AbilityWrapper roles={['unlimited', 'paid']}>
        <Recommendations
          // @ts-ignore
          useAmazonAccountsQ={mockUseAmazonAccountsQ()}
          // @ts-ignore
          useUserQ={mockUseUserQ()}
          // @ts-ignore
          useRecommendationsQuery={mockUseRecommendationsQuery()}
          // @ts-ignore
          useSelectedAccPaidStatusQ={mockUseSelectedAccPaidStatusQ()}
          // useFlag={mockUseFlag}
        />
      </AbilityWrapper>,
      {
        hooksConfig: {
          setAmazonAccount: {
            ...amazonAccount
          }
        }
      }
    );

    await component.getByTestId('recommendations-headline').click();
    await expect(component.getByTestId('select-status')).not.toBeDisabled();
  });
});

test.describe('Recommendations Component for shared account with only read access', () => {
  test.skip('dropdown should be disabled', async ({ mount }) => {
    const mockUseAmazonAccountsQ = () => ({
      isLoading: false,
      data: [amazonAccount]
    });

    const mockUseUserQ = () => ({
      isLoading: false,
      data: user
    });

    const mockUseRecommendationsQuery = () => ({
      isLoading: false,
      data: recommendations
    });
    const mockUseSelectedAccPaidStatusQ = () => ({
      isLoading: false,
      fetchStatus: 'idle',
      data: { isSelectedAccPaid: true }
    });
    // const mockUseFlag = () => true;

    const component = await mount(
      <AbilityWrapper roles={['unlimited', 'paid']}>
        <Recommendations
          // @ts-ignore
          useAmazonAccountsQ={mockUseAmazonAccountsQ()}
          // @ts-ignore
          useUserQ={mockUseUserQ()}
          // @ts-ignore
          useRecommendationsQuery={mockUseRecommendationsQuery()}
          // @ts-ignore
          useSelectedAccPaidStatusQ={mockUseSelectedAccPaidStatusQ()}
          // useFlag={mockUseFlag}
        />
      </AbilityWrapper>,
      {
        hooksConfig: {
          setAmazonAccount: {
            ...sharedAmazonAccount
          }
        }
      }
    );

    await component.getByTestId('recommendations-headline').click();
    await expect(component.getByTestId('select-status')).toBeDisabled();
  });
});
