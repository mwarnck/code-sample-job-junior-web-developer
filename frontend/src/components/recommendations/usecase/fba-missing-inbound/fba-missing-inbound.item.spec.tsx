import { CONFIG } from '@/lib/config/config';
import { test, expect } from '@playwright/experimental-ct-react';
import {
  FbaMissingInboundItemAutomatedLastMessageArthy,
  FbaMissingInboundItemAutomatedLastMessageUser,
  FbaMissingInboundItemResolved,
  FbaMissingInboundItemUnresolved,
  FbaMissingInboundItemWithCaseId
} from './fba-missing-inbound.item.story';

test.describe('FbaMissingInbound Item', () => {
  test('renders the modal-button if the recommendation is not resolved', async ({ mount }) => {
    const component = await mount(<FbaMissingInboundItemUnresolved />);
    await expect(component.getByTestId('fba_missing_inbound_details_button')).toBeVisible();
  });
  test('dont renders the modal-button if the recommendation is resolved', async ({ mount }) => {
    const component = await mount(<FbaMissingInboundItemResolved />);
    await expect(component.getByTestId('fba_missing_inbound_details_button')).toBeHidden();
  });
  test('checks the value change of the dropdown', async ({ mount }) => {
    const component = await mount(<FbaMissingInboundItemUnresolved />);
    await expect(component.getByTestId('select-status')).toHaveAttribute('value', 'empty');
  });

  test('shows the modal after click on details', async ({ mount, page }) => {
    const component = await mount(<FbaMissingInboundItemUnresolved />);
    await component.getByTestId('fba_missing_inbound_details_button').click();
    // Modal ist innerhalb der component immer hidden...page muss verwendet werden...
    await expect(page.getByTestId('fba_missing_inbound_modal')).toBeVisible();
  });

  test('checks the case id textfield with no initial case id', async ({ mount, page }) => {
    const component = await mount(<FbaMissingInboundItemUnresolved />);
    let isPatchCaseIdCalled = false;
    await page.route(
      `${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.RECOMMENDATIONS.UPDATE_CASE_REIMBURSEMENT_ID}`,
      (route) => {
        isPatchCaseIdCalled = true;
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: []
          })
        });
      }
    );
    // check if input is not disabled and only send icon is visible
    await expect(component.getByTestId('recommendation-id-textfield-send')).toBeVisible();
    await expect(component.getByTestId('recommendation-id-textfield-cancel')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield-edit')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield')).toBeVisible();
    await expect(
      component.getByTestId('recommendation-id-textfield').getByLabel('Fall ID')
    ).not.toBeDisabled();

    // typing new id and click send
    await component
      .getByTestId('recommendation-id-textfield')
      .getByLabel('Fall ID')
      .fill('1234567890');
    await component.getByTestId('recommendation-id-textfield-send').click();
    //check if the post request was sent
    await expect(isPatchCaseIdCalled).toBe(true);

    // send should not be visible, but edit should be visible and input should be disabled
    await expect(component.getByTestId('recommendation-id-textfield-edit')).toBeVisible();
    await expect(component.getByTestId('recommendation-id-textfield-cancel')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield-send')).toBeHidden();
    await expect(
      component.getByTestId('recommendation-id-textfield').getByLabel('Fall ID')
    ).toBeDisabled();
  });

  test('checks the case id textfield with initial case id', async ({ mount, page }) => {
    const component = await mount(<FbaMissingInboundItemWithCaseId />);
    let isPatchCaseIdCalled = false;
    await page.route(
      `${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.RECOMMENDATIONS.UPDATE_CASE_REIMBURSEMENT_ID}`,
      (route) => {
        isPatchCaseIdCalled = true;
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: []
          })
        });
      }
    );

    // check if input is disabled and only edit is visible with initial reimbursment id
    await expect(component.getByTestId('recommendation-id-textfield-send')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield-cancel')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield-edit')).toBeVisible();
    await expect(component.getByTestId('recommendation-id-textfield')).toBeVisible();
    await expect(
      component.getByTestId('recommendation-id-textfield').getByLabel('Fall ID')
    ).toBeDisabled();

    // after clicking on edit send + cancel should be visible and input should not be disabled
    await component.getByTestId('recommendation-id-textfield-edit').click();
    await expect(component.getByTestId('recommendation-id-textfield-send')).toBeVisible();
    await expect(component.getByTestId('recommendation-id-textfield-cancel')).toBeVisible();
    await expect(component.getByTestId('recommendation-id-textfield-edit')).toBeHidden();
    await component.getByTestId('recommendation-id-textfield').getByLabel('Fall ID').fill(''); // clear the input field
    await component
      .getByTestId('recommendation-id-textfield')
      .getByLabel('Fall ID')
      .fill('1234567890');
    await component.getByTestId('recommendation-id-textfield-send').click();
    //check if the post request was sent
    await expect(isPatchCaseIdCalled).toBe(true);

    // after typing new id and clicking send, the edit icon should be visible and the input should be disabled and has the new value
    await expect(
      component.getByTestId('recommendation-id-textfield').getByLabel('Fall ID')
    ).toHaveValue('1234567890');
    await expect(
      component.getByTestId('recommendation-id-textfield').getByLabel('Fall ID')
    ).toBeDisabled();
    await expect(component.getByTestId('recommendation-id-textfield-send')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield-cancel')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield-edit')).toBeVisible();
  });

  test('checks if the case id textfield get the old value after clicking on cancel', async ({
    mount
  }) => {
    const component = await mount(<FbaMissingInboundItemWithCaseId />);

    // check if input is disabled and only edit is visible with initial reimbursment id
    await expect(component.getByTestId('recommendation-id-textfield-send')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield-cancel')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield-edit')).toBeVisible();
    await expect(component.getByTestId('recommendation-id-textfield')).toBeVisible();
    await expect(
      component.getByTestId('recommendation-id-textfield').getByLabel('Fall ID')
    ).toBeDisabled();

    // click on edit and type in the a new id
    await component.getByTestId('recommendation-id-textfield-edit').click();
    await expect(component.getByTestId('recommendation-id-textfield-send')).toBeVisible();
    await expect(component.getByTestId('recommendation-id-textfield-cancel')).toBeVisible();
    await expect(component.getByTestId('recommendation-id-textfield-edit')).toBeHidden();
    await component.getByTestId('recommendation-id-textfield').getByLabel('Fall ID').fill(''); // clear the input field
    await component
      .getByTestId('recommendation-id-textfield')
      .getByLabel('Fall ID')
      .fill('1234567890');

    // after clicking on cancel
    await component.getByTestId('recommendation-id-textfield-cancel').click();
    await expect(
      component.getByTestId('recommendation-id-textfield').getByLabel('Fall ID')
    ).toHaveValue('0987654321');
    await expect(
      component.getByTestId('recommendation-id-textfield').getByLabel('Fall ID')
    ).toBeDisabled();
    await expect(component.getByTestId('recommendation-id-textfield-send')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield-cancel')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield-edit')).toBeVisible();
  });

  test('checks if the case id textfield validation', async ({ mount, page }) => {
    const component = await mount(<FbaMissingInboundItemUnresolved />);

    let isPatchCaseIdCalled = false;
    await page.route(
      `${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.RECOMMENDATIONS.UPDATE_CASE_REIMBURSEMENT_ID}`,
      (route) => {
        isPatchCaseIdCalled = true;
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: []
          })
        });
      }
    );

    // check the default max character length of 10
    await component
      .getByTestId('recommendation-id-textfield')
      .getByLabel('Fall ID')
      .fill('1234567890123456');
    await component.getByTestId('recommendation-id-textfield-send').click();
    //check if the post request was sent
    await expect(isPatchCaseIdCalled).toBe(false);
    await expect(
      component.getByTestId('recommendation-id-textfield').getByLabel('Fall ID')
    ).toHaveValue(''); // because of max length of 10 the fill method with 11 characters failes and returns empty string instead in playwright

    // check if only numbers and letters are allowed
    await component.getByTestId('recommendation-id-textfield').getByLabel('Fall ID').fill(''); // clear the input field
    await component
      .getByTestId('recommendation-id-textfield')
      .getByLabel('Fall ID')
      .fill('-.,!?:*><=1Aa');
    await component.getByTestId('recommendation-id-textfield-send').click();
    await expect(
      component.getByTestId('recommendation-id-textfield').getByLabel('Fall ID')
    ).toHaveValue(''); // because of only numbers and letters are allowed the fill method with special characters failes and returns empty string instead in playwright
  });
});

test.describe('FbaMissingInbound Item automation messages automation acc view', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.USER}`, async (route) => {
      await route.fulfill({
        json: { data: { _id: '123', userModules: [{ key: 'unlimited' }, { key: 'automation' }] } }
      });
    });
  });
  test('shows the modal-button text and packinglist button', async ({ mount }) => {
    const component = await mount(<FbaMissingInboundItemUnresolved />);

    await expect(component.getByTestId('message-modal-button')).toBeVisible();
    await expect(component.getByTestId('message-modal-button')).toContainText(
      'Nachricht schreiben'
    );
  });

  test('shows the right modal button text if last message is from automation user and checks if textfield disabled', async ({
    mount,
    page
  }) => {
    const component = await mount(<FbaMissingInboundItemAutomatedLastMessageArthy />);
    await expect(component.getByTestId('message-modal-button')).toBeVisible();
    await expect(component.getByTestId('message-modal-button')).toContainText(
      'Gesendete Nachricht anzeigen'
    );
    await component.getByTestId('message-modal-button').click();
    await expect(page.getByTestId('message-modal')).toBeVisible();
    await expect(page.getByTestId('message-textfield')).toBeDisabled();
  });

  test('shows the right modal button text if last message is from user', async ({ mount }) => {
    const component = await mount(<FbaMissingInboundItemAutomatedLastMessageUser />);
    await expect(component.getByTestId('message-modal-button')).toBeVisible();
    await expect(component.getByTestId('message-modal-button')).toContainText('Antwort anzeigen');
  });

  test('open and close the message modal', async ({ mount, page }) => {
    const component = await mount(<FbaMissingInboundItemUnresolved />);

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

    const component = await mount(<FbaMissingInboundItemAutomatedLastMessageUser />);

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
    const component = await mount(<FbaMissingInboundItemAutomatedLastMessageUser />);

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

test.describe('FbaMissingInbound Item automation messages user view', () => {
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
    const component = await mount(<FbaMissingInboundItemUnresolved />);
    await expect(component.getByTestId('packinglist-button')).toBeHidden();
    await expect(component.getByTestId('message-modal-button')).toBeHidden();
  });

  test('dont shows the user message modal if messages are not available', async ({ mount }) => {
    const component = await mount(<FbaMissingInboundItemUnresolved />);
    await expect(component.getByTestId('fba_missing_inbound_message_details_button')).toBeHidden();
  });

  test('dont shows the user modal-button if last message is from user', async ({ mount }) => {
    const component = await mount(<FbaMissingInboundItemAutomatedLastMessageUser />);
    await expect(component.getByTestId('fba_missing_inbound_message_details_button')).toBeHidden();
  });

  test('shows the user modal-button, the modal, and modal content if last message is from automation acc', async ({
    mount,
    page
  }) => {
    const component = await mount(<FbaMissingInboundItemAutomatedLastMessageArthy />);

    await component.getByTestId('fba_missing_inbound_message_details_button').click();
    await expect(page.getByTestId('fba_missing_inbound_message_modal')).toBeVisible();

    const dataCyKeys = [
      'infos-image',
      'infos-name',
      'infos-sku-fnsku',
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
    const component = await mount(<FbaMissingInboundItemAutomatedLastMessageArthy />);
    await expect(component.getByTestId('fba_missing_inbound_message_details_button')).toBeVisible();
    await component.getByTestId('fba_missing_inbound_message_details_button').click();
    await expect(page.getByTestId('fba_missing_inbound_message_modal')).toBeVisible();
    await expect(page.getByTestId('send-automation-message-button')).toBeDisabled();
    await expect(page.getByTestId('message-textfield')).toBeVisible();
    await page.getByTestId('message-textfield').fill('test-123');
    await expect(page.getByTestId('send-automation-message-button')).not.toBeDisabled();
    await page.getByTestId('send-automation-message-button').click();
    //check if the post request was sent
    await expect(isPostSendMessageCalled).toBe(true);
    await expect(page.getByTestId('fba_missing_inbound_message_modal')).toBeHidden();
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
    const component = await mount(<FbaMissingInboundItemAutomatedLastMessageArthy />);
    await expect(component.getByTestId('fba_missing_inbound_message_details_button')).toBeVisible();
    await component.getByTestId('fba_missing_inbound_message_details_button').click();
    await expect(page.getByTestId('fba_missing_inbound_message_modal')).toBeVisible();
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
    await expect(page.getByTestId('fba_missing_inbound_message_modal')).toBeHidden();
  });
});
