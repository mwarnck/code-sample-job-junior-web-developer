import { test, expect } from '@playwright/experimental-ct-react';
import { dropdownItems } from './size-change-higher-fba.item';
import {
  SizeChangeHigherFbaItemAutomatedLastMessageArthy,
  SizeChangeHigherFbaItemAutomatedLastMessageUser,
  SizeChangeHigherFbaItemAutomatedWithoutMessages,
  SizeChangeHigherFbaItemResolved,
  SizeChangeHigherFbaItemUnresolved
} from './size-change-higher-fba.item.story';
import { CONFIG } from '@/lib/config/config';

test.describe('SizeChangeHigherFba Item', () => {
  test('renders the size change higher fba item', async ({ mount }) => {
    const component = await mount(<SizeChangeHigherFbaItemUnresolved />);
    await expect(component.getByTestId('item-container')).toBeVisible();
  });
  test('renders the modal-button if recommendation is not resolved', async ({ mount }) => {
    const component = await mount(<SizeChangeHigherFbaItemUnresolved />);
    await expect(component.getByTestId('size_change_higher_fba_details_button')).toBeVisible();
  });
  test('dont renders the modal-button if recommendation is resolved', async ({ mount }) => {
    const component = await mount(<SizeChangeHigherFbaItemResolved />);
    await expect(component.getByTestId('size_change_higher_fba_details_button')).toBeHidden();
  });
  test('should render dropdown with default value', async ({ mount }) => {
    const component = await mount(<SizeChangeHigherFbaItemUnresolved />);
    await expect(component.getByTestId('select-status')).toHaveAttribute('value', 'empty');
  });
  test('should display all options in the dropdown', async ({ mount, page }) => {
    const component = await mount(<SizeChangeHigherFbaItemUnresolved />);
    await component.getByTestId('select-value').click();
    dropdownItems.forEach(async (item) => {
      await expect(page.getByTestId(`select-option-${item}`)).toBeVisible();
    });
  });
  test('checks the value change of the dropdown', async ({ mount, page }) => {
    let isPatchUpdateCalled = false;
    await page.route(
      `${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.RECOMMENDATIONS.UPDATE_STATUS}`,
      (route) => {
        isPatchUpdateCalled = true;
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: []
          })
        });
      }
    );
    const component = await mount(<SizeChangeHigherFbaItemUnresolved />);
    await expect(component.getByTestId('select-status')).toHaveAttribute('value', 'empty');
    await component.getByTestId('select-value').click();
    await page.getByTestId('select-option-done').click();
    //check if the post request was sent
    expect(isPatchUpdateCalled).toBe(true);
  });
  test('shows the modal after click on details', async ({ mount, page }) => {
    const component = await mount(<SizeChangeHigherFbaItemUnresolved />);
    await component.getByTestId('size_change_higher_fba_details_button').click();
    await expect(page.getByTestId('size_change_higher_fba_modal')).toBeVisible();
  });
});

test.describe('SizeChangeHigher Component automation messages automation acc view', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.USER}`, async (route) => {
      await route.fulfill({
        json: { data: { _id: '123', userModules: [{ key: 'unlimited' }, { key: 'automation' }] } }
      });
    });
  });
  test('shows the modal-button with correct text (no messages)', async ({ mount }) => {
    const component = await mount(<SizeChangeHigherFbaItemAutomatedWithoutMessages />);
    await expect(component.getByTestId('message-modal-button')).toBeVisible();
    await expect(component.getByTestId('message-modal-button')).toContainText(
      'Nachricht schreiben'
    );
  });

  test('shows the right modal button text if last message is from automation user and checks if textfield disabled', async ({
    mount,
    page
  }) => {
    const component = await mount(<SizeChangeHigherFbaItemAutomatedLastMessageArthy />);
    await expect(component.getByTestId('message-modal-button')).toBeVisible();
    await expect(component.getByTestId('message-modal-button')).toContainText(
      'Gesendete Nachricht anzeigen'
    );
    await component.getByTestId('message-modal-button').click();
    await expect(page.getByTestId('message-modal')).toBeVisible();
    await expect(page.getByTestId('message-textfield')).toBeDisabled();
  });

  test('shows the right modal button text if last message is from user', async ({ mount }) => {
    const component = await mount(<SizeChangeHigherFbaItemAutomatedLastMessageUser />);
    await expect(component.getByTestId('message-modal-button')).toBeVisible();
    await expect(component.getByTestId('message-modal-button')).toContainText('Antwort anzeigen');
  });

  test('open and close the message modal', async ({ mount, page }) => {
    const component = await mount(<SizeChangeHigherFbaItemAutomatedLastMessageArthy />);
    await expect(component.getByTestId('message-modal-button')).toBeVisible();
    await component.getByTestId('message-modal-button').click();
    await expect(page.getByTestId('message-modal')).toBeVisible();
    await expect(page.getByTestId('close-button')).toBeVisible();
    await page.getByTestId('close-button').click();
  });

  test('sends a message to the user', async ({ mount, page }) => {
    let isSendMessageRequestCalled = false;
    await page.route(`${CONFIG.API.ENDPOINT}/recommendations/1234567890/messages`, (route) => {
      isSendMessageRequestCalled = true;
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: []
        })
      });
    });

    const component = await mount(<SizeChangeHigherFbaItemAutomatedLastMessageUser />);

    await expect(component.getByTestId('message-modal-button')).toBeVisible();
    await component.getByTestId('message-modal-button').click();
    await expect(page.getByTestId('message-modal')).toBeVisible();
    await expect(page.getByTestId('send-button')).toBeDisabled();
    await expect(page.getByTestId('message-textfield')).toBeVisible();
    await page.getByTestId('message-textfield').fill('test-123');
    await expect(page.getByTestId('send-button')).not.toBeDisabled();
    await page.getByTestId('send-button').click();
    await expect(page.getByTestId('message-modal')).toBeHidden();
    expect(isSendMessageRequestCalled).toBe(true);
  });

  test('shows the answer of the user with two uploads', async ({ mount, page }) => {
    const component = await mount(<SizeChangeHigherFbaItemAutomatedLastMessageUser />);
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

test.describe('SizeChangeHigher Component automation messages user view', () => {
  test('dont shows the modal-button of the automation account ', async ({ mount }) => {
    const component = await mount(<SizeChangeHigherFbaItemAutomatedWithoutMessages />);
    await expect(component.getByTestId('message-modal-button')).toBeHidden();
  });
  test('dont shows the user message modal if messages are not available', async ({ mount }) => {
    const component = await mount(<SizeChangeHigherFbaItemAutomatedWithoutMessages />);
    await expect(
      component.getByTestId('size_change_higher_fba_message_details_button')
    ).toBeHidden();
  });

  test('dont shows the user modal-button if last message is from user', async ({ mount }) => {
    const component = await mount(<SizeChangeHigherFbaItemAutomatedLastMessageUser />);
    await expect(
      component.getByTestId('size_change_higher_fba_message_details_button')
    ).toBeHidden();
  });

  test('shows the user modal-button, the modal, and modal content if last message is from automation acc', async ({
    mount,
    page
  }) => {
    const component = await mount(<SizeChangeHigherFbaItemAutomatedLastMessageArthy />);
    await component.getByTestId('size_change_higher_fba_message_details_button').click();
    await expect(page.getByTestId('size_change_higher_fba_message_modal')).toBeVisible();

    const dataCyKeys = [
      'name',
      'asin',
      'sku',
      'dimensions-before',
      'dimensions-after',
      'weight-before',
      'weight-after',
      'savings-unit',
      'savings-year',
      'file-upload-container',
      'message-textfield'
    ];
    dataCyKeys.forEach(async (dataCyKey) => {
      await expect(page.getByTestId(`${dataCyKey}`)).toBeVisible();
    });
    await expect(page.getByTestId('modal-message')).toContainText('Lorem ipsum dolor sit amet');
  });

  test('send a message to the automation acc', async ({ mount, page }) => {
    let isSendMessageRequestCalled = false;
    await page.route(`${CONFIG.API.ENDPOINT}/recommendations/0987654321/messages`, (route) => {
      isSendMessageRequestCalled = true;
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: []
        })
      });
    });
    const component = await mount(<SizeChangeHigherFbaItemAutomatedLastMessageArthy />);
    await expect(
      component.getByTestId('size_change_higher_fba_message_details_button')
    ).toBeVisible();
    await component.getByTestId('size_change_higher_fba_message_details_button').click();
    await expect(page.getByTestId('size_change_higher_fba_message_modal')).toBeVisible();
    await expect(page.getByTestId('send-automation-message-button')).toBeDisabled();
    await expect(page.getByTestId('message-textfield')).toBeVisible();
    await page.getByTestId('message-textfield').fill('test-123');
    await expect(page.getByTestId('send-automation-message-button')).not.toBeDisabled();
    await page.getByTestId('send-automation-message-button').click();
    await expect(page.getByTestId('size_change_higher_fba_message_modal')).toBeHidden();
    expect(isSendMessageRequestCalled).toBe(true);
  });

  test('send a message, with files to the automation acc', async ({ mount, page }) => {
    let isSendMessageRequestCalled = false;
    await page.route(`${CONFIG.API.ENDPOINT}/recommendations/0987654321/messages`, (route) => {
      isSendMessageRequestCalled = true;
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: []
        })
      });
    });

    await page.route(`${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.USER_UPLOADS}`, (route) => {
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: { url: 'testurl' }
        })
      });
    });
    const component = await mount(<SizeChangeHigherFbaItemAutomatedLastMessageArthy />);
    await expect(
      component.getByTestId('size_change_higher_fba_message_details_button')
    ).toBeVisible();
    await component.getByTestId('size_change_higher_fba_message_details_button').click();
    await expect(page.getByTestId('size_change_higher_fba_message_modal')).toBeVisible();
    await expect(page.getByTestId('file-upload-container')).toBeVisible();
    await page.getByTestId('file-upload-input').setInputFiles({
      name: 'myFile.pdf',
      mimeType: 'text/plain',
      buffer: Buffer.from('myFile.pdf')
    });
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
    await expect(page.getByTestId('size_change_higher_fba_message_modal')).toBeHidden();
    expect(isSendMessageRequestCalled).toBe(true);
  });
});
