import dayjs from 'dayjs';
import { Notification } from '@/components/dashboard/dashboard-notification.type';
import { test, expect } from '@playwright/test';
import { useUserInterceptions } from '@/playwright/interceptions/useUserInterceptions';

const testNotifications: Notification[] = [
  {
    data: { count: 1 },
    key: 'unpaid-payments',
    link: '/assignments',
    startDate: dayjs().format(),
    expireDate: dayjs().add(7, 'day').format(),
    show: () => true
  },
  {
    data: { count: 1 },
    key: 'unpaid-payments-two',
    link: '/assignments',
    startDate: dayjs().format(),
    expireDate: dayjs().add(7, 'day').format(),
    show: () => true
  }
];

test.describe('user-notifications', () => {
  test('should fetch user notifications and show them in the bell', async ({ page }) => {
    const { getUserNotifications } = await useUserInterceptions(page);
    await getUserNotifications(testNotifications);
    await page.goto('/');
    await page.waitForSelector('[data-cy=notifications-popover]');
    await page.waitForSelector('[data-cy=notifications-popover]');
    await expect(page.getByTestId('notifications-popover')).toBeVisible();
    await expect(page.getByTestId('badge-un-read')).toHaveText('2');
  });

  test('should mark all notifications as read', async ({ page }) => {
    const { getUserNotifications, patchUpdateUserNotifications } = await useUserInterceptions(page);
    await getUserNotifications(testNotifications);
    await patchUpdateUserNotifications();
    await page.goto('/');
    await page.waitForSelector('[data-cy=notifications-popover]');
    await expect(page.getByTestId('notifications-popover')).toBeVisible();
    await expect(page.getByTestId('badge-un-read')).toHaveText('2');

    await page.click('[data-cy=notifications-popover]');
    await expect(page.getByTestId('notifications-dropdown')).toBeVisible();
    await expect(page.getByTestId('mark-all-as-read')).toBeVisible();
    await page.click('[data-cy=mark-all-as-read]');
    await expect(page.getByTestId('badge-un-read')).toHaveText('0');
    await expect(page.getByTestId('notifications-dropdown')).not.toBeVisible();
  });
});
