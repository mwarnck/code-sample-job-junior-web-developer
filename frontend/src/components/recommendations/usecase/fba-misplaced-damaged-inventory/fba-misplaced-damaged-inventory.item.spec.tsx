import { test, expect } from '@playwright/experimental-ct-react';
import {
  FbaMisplacedDamagedInventoryItemAutomatedLastMessageArthy,
  FbaMisplacedDamagedInventoryItemAutomatedLastMessageUser,
  FbaMisplacedDamagedInventoryItemAutomatedWithoutMessages,
  FbaMisplacedDamagedInventoryItemResolved,
  FbaMisplacedDamagedInventoryItemUnresolved
} from './fba-misplaced-damaged-inventory.item.story';
import { CONFIG } from '@/lib/config/config';

test.describe('FbaMisplacedDamagedInventory Item', () => {
  test('renders the modal-button if the recommendation is not resolved', async ({ mount }) => {
    const component = await mount(<FbaMisplacedDamagedInventoryItemUnresolved />);
    await expect(
      component.getByTestId('fba_misplaced_damaged_inventory_details_button')
    ).toBeVisible();
  });
  test('dont renders the modal-button if the recommendation is resolved', async ({ mount }) => {
    const component = await mount(<FbaMisplacedDamagedInventoryItemResolved />);
    await expect(
      component.getByTestId('fba_misplaced_damaged_inventory_details_button')
    ).toBeHidden();
  });
  test('checks the value change of the dropdown', async ({ mount }) => {
    const component = await mount(<FbaMisplacedDamagedInventoryItemUnresolved />);
    await expect(component.getByTestId('select-status')).toHaveAttribute('value', 'empty');
  });
  test('shows the modal after click on details', async ({ mount, page }) => {
    const component = await mount(<FbaMisplacedDamagedInventoryItemUnresolved />);
    await component.getByTestId('fba_misplaced_damaged_inventory_details_button').click();
    // Modal ist innerhalb der component immer hidden...page muss verwendet werden...
    await expect(page.getByTestId('fba_misplaced_damaged_inventory_modal')).toBeVisible();
  });
});
test.describe('FbaMisplacedDamagedInventory Item automation messages automation acc view', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.USER}`, async (route) => {
      await route.fulfill({
        json: { data: { _id: '123', userModules: [{ key: 'unlimited' }, { key: 'automation' }] } }
      });
    });
  });
  test('shows the modal-button text if no messages are available', async ({ mount }) => {
    const component = await mount(<FbaMisplacedDamagedInventoryItemUnresolved />);
    await expect(component.getByTestId('message-modal-button')).toBeVisible();
    await expect(component.getByTestId('message-modal-button')).toContainText(
      'Nachricht schreiben'
    );
  });
  test('shows the right modal button text if last message is from automation user and checks if textfield disabled', async ({
    mount,
    page
  }) => {
    const component = await mount(<FbaMisplacedDamagedInventoryItemAutomatedLastMessageArthy />);
    await expect(component.getByTestId('message-modal-button')).toBeVisible();
    await expect(component.getByTestId('message-modal-button')).toContainText(
      'Gesendete Nachricht anzeigen'
    );
    await component.getByTestId('message-modal-button').click();
    await expect(page.getByTestId('message-modal')).toBeVisible();
    await expect(page.getByTestId('message-textfield')).toBeDisabled();
  });
  test('shows the right modal button text if last message is from user', async ({ mount }) => {
    const component = await mount(<FbaMisplacedDamagedInventoryItemAutomatedLastMessageUser />);
    await expect(component.getByTestId('message-modal-button')).toBeVisible();
    await expect(component.getByTestId('message-modal-button')).toContainText('Antwort anzeigen');
  });
  test('open and close the message modal', async ({ mount, page }) => {
    const component = await mount(<FbaMisplacedDamagedInventoryItemAutomatedWithoutMessages />);

    await expect(component.getByTestId('message-modal-button')).toBeVisible();
    await component.getByTestId('message-modal-button').click();
    await expect(page.getByTestId('message-modal')).toBeVisible();
    await expect(page.getByTestId('close-button')).toBeVisible();
    await page.getByTestId('close-button').click();
  });
  test('sends a message to the user', async ({ mount, page }) => {
    let isPostSendMessageCalled = false;
    await page.route(`${CONFIG.API.ENDPOINT}/recommendations/1234567890/messages`, (route) => {
      isPostSendMessageCalled = true;
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: []
        })
      });
    });
    const component = await mount(<FbaMisplacedDamagedInventoryItemAutomatedLastMessageUser />);
    await expect(component.getByTestId('message-modal-button')).toBeVisible();
    await component.getByTestId('message-modal-button').click();
    await expect(page.getByTestId('message-modal')).toBeVisible();
    await expect(page.getByTestId('send-button')).toBeDisabled();
    await expect(page.getByTestId('message-textfield')).toBeVisible();
    await page.getByTestId('message-textfield').fill('test-123');
    await expect(page.getByTestId('send-button')).not.toBeDisabled();
    await page.getByTestId('send-button').click();
    //check if the post request was sent
    await expect(isPostSendMessageCalled).toBe(true);
    await expect(page.getByTestId('message-modal')).toBeHidden();
  });
  test('shows the answer of the user with two uploads', async ({ mount, page }) => {
    const component = await mount(<FbaMisplacedDamagedInventoryItemAutomatedLastMessageUser />);

    await expect(component.getByTestId('message-modal-button')).toBeVisible();
    await component.getByTestId('message-modal-button').click();
    await expect(page.getByTestId('message-modal')).toBeVisible();
    await expect(page.getByTestId('modal-dialog-container-message')).toBeVisible();
    await expect(page.getByTestId('modal-dialog-container-message')).toContainText(
      'Vincent tu was für dein Geld!'
    );
    await expect(page.getByTestId('file-download-button')).toHaveCount(2);
  });
});
test.describe('FbaMisplacedDamagedInventory Item automation messages user view', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.USER}`, async (route) => {
      await route.fulfill({
        json: { data: { _id: '123', userModules: [{ key: 'unlimited' }] } }
      });
    });
  });
  test('dont shows the modal-button of automation user and dont shows packinglist button', async ({
    mount
  }) => {
    const component = await mount(<FbaMisplacedDamagedInventoryItemAutomatedWithoutMessages />);
    await expect(component.getByTestId('packinglist-button')).toBeHidden();
    await expect(component.getByTestId('message-modal-button')).toBeHidden();
  });
  test('dont shows the user modal-button if last message is from user', async ({ mount }) => {
    const component = await mount(<FbaMisplacedDamagedInventoryItemAutomatedLastMessageUser />);
    await expect(
      component.getByTestId('fba_misplaced_damaged_inventory_message_details_button')
    ).toBeHidden();
  });
  test('shows the user modal-button, the modal, and modal content if last message is from automation acc', async ({
    mount,
    page
  }) => {
    const component = await mount(<FbaMisplacedDamagedInventoryItemAutomatedLastMessageArthy />);
    await component.getByTestId('fba_misplaced_damaged_inventory_message_details_button').click();
    await expect(page.getByTestId('fba_misplaced_damaged_inventory_message_modal')).toBeVisible();
    const dataCyKeys = [
      'infos-image',
      'infos-name',
      'infos-sku',
      'infos-fnsku',
      'infos-asin',
      'file-upload-container',
      'message-textfield'
    ];
    dataCyKeys.forEach(async (dataCyKey) => {
      await expect(page.getByTestId(`${dataCyKey}`)).toBeVisible();
    });
    await expect(page.getByTestId('modal-message')).toContainText('Lorem ipsum dolor sit amet');
  });
  test('send a message to the automation acc', async ({ mount, page }) => {
    let isPostSendMessageCalled = false;
    await page.route(`${CONFIG.API.ENDPOINT}/recommendations/0987654321/messages`, (route) => {
      isPostSendMessageCalled = true;
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: []
        })
      });
    });
    const component = await mount(<FbaMisplacedDamagedInventoryItemAutomatedLastMessageArthy />);
    await expect(
      component.getByTestId('fba_misplaced_damaged_inventory_message_details_button')
    ).toBeVisible();
    await component.getByTestId('fba_misplaced_damaged_inventory_message_details_button').click();
    await expect(page.getByTestId('fba_misplaced_damaged_inventory_message_modal')).toBeVisible();
    await expect(page.getByTestId('send-automation-message-button')).toBeDisabled();
    await expect(page.getByTestId('message-textfield')).toBeVisible();
    await page.getByTestId('message-textfield').fill('test-123');
    await expect(page.getByTestId('send-automation-message-button')).not.toBeDisabled();
    await page.getByTestId('send-automation-message-button').click();
    //check if the post request was sent
    await expect(isPostSendMessageCalled).toBe(true);
    await expect(page.getByTestId('fba_misplaced_damaged_inventory_message_modal')).toBeHidden();
  });
  test('send a message, with files to the automation acc', async ({ mount, page }) => {
    let isPostSendMessageCalled = false;
    await page.route(`${CONFIG.API.ENDPOINT}/recommendations/0987654321/messages`, (route) => {
      isPostSendMessageCalled = true;
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: []
        })
      });
    });
    let isPostUploadFilesCalled = false;
    await page.route(`${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.USER_UPLOADS}`, (route) => {
      isPostUploadFilesCalled = true;
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: { url: 'testurl' }
        })
      });
    });
    const component = await mount(<FbaMisplacedDamagedInventoryItemAutomatedLastMessageArthy />);
    await expect(
      component.getByTestId('fba_misplaced_damaged_inventory_message_details_button')
    ).toBeVisible();
    await component.getByTestId('fba_misplaced_damaged_inventory_message_details_button').click();
    await expect(page.getByTestId('fba_misplaced_damaged_inventory_message_modal')).toBeVisible();
    await expect(page.getByTestId('file-upload-container')).toBeVisible();
    await page.getByTestId('file-upload-input').setInputFiles({
      name: 'myFile.pdf',
      mimeType: 'text/plain',
      buffer: Buffer.from('myFile.pdf')
    });
    await expect(isPostUploadFilesCalled).toBe(true);
    await expect(page.getByTestId('file-upload-item')).toHaveCount(1);
    await page.getByTestId('file-upload-input').setInputFiles({
      name: 'mySecondFile.pdf',
      mimeType: 'text/plain',
      buffer: Buffer.from('mySecondFile.pdf')
    });
    await expect(page.getByTestId('file-upload-item')).toHaveCount(2);
    await expect(page.getByTestId('send-automation-message-button')).toBeDisabled();
    await expect(page.getByTestId('message-textfield')).toBeVisible();
    await page.getByTestId('message-textfield').fill('test-123');
    await page.getByTestId('send-automation-message-button').click();
    await expect(isPostSendMessageCalled).toBe(true);
    await expect(page.getByTestId('fba_misplaced_damaged_inventory_message_modal')).toBeHidden();
  });
});
