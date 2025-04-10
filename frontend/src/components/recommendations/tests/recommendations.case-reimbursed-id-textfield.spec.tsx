import { EditableTextfield } from '../../ui/editable-textfield.component';
import { test, expect } from '@playwright/experimental-ct-react';

test.describe('recommendations reimbursement-case-id-textfield', () => {
  test('renders the textfield component with no initial data -> shows only send icon', async ({
    mount
  }) => {
    const component = await mount(
      <EditableTextfield
        inputValue={''}
        labelText={'Case ID'}
        setValue={() => null}
        disabled={false}
        setDisabled={() => null}
        handleCancel={() => null}
        handleUpdate={() => null}
        valueAlreadySet={false}
        isRegEx
        dataCy='recommendation-id'
      />
    );

    await expect(component.getByTestId('recommendation-id-textfield-send')).toBeVisible();
    await expect(component.getByTestId('recommendation-id-textfield-cancel')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield-edit')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield')).toBeVisible();
    await expect(
      component.getByTestId('recommendation-id-textfield').getByLabel('Case ID')
    ).not.toBeDisabled();
  });

  test('renders the textfield component with data -> shows only edit icon', async ({ mount }) => {
    const component = await mount(
      <EditableTextfield
        inputValue={'1234567890'}
        labelText={'Case ID'}
        setValue={() => null}
        disabled={true}
        setDisabled={() => null}
        handleCancel={() => null}
        handleUpdate={() => null}
        valueAlreadySet={true}
        isRegEx
        dataCy='recommendation-id'
      />
    );

    await expect(component.getByTestId('recommendation-id-textfield-send')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield-cancel')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield-edit')).toBeVisible();
    await expect(component.getByTestId('recommendation-id-textfield')).toBeVisible();
    await expect(
      component.getByTestId('recommendation-id-textfield').getByLabel('Case ID')
    ).toBeDisabled();
  });

  test('renders the textfield component with data and not disabled -> shows send and cancel icon', async ({
    mount
  }) => {
    const component = await mount(
      <EditableTextfield
        inputValue={'1234567890'}
        labelText={'Case ID'}
        setValue={() => null}
        disabled={false}
        setDisabled={() => null}
        handleCancel={() => null}
        handleUpdate={() => null}
        valueAlreadySet={true}
        isRegEx
        dataCy='recommendation-id'
      />
    );

    await expect(component.getByTestId('recommendation-id-textfield-send')).toBeVisible();
    await expect(component.getByTestId('recommendation-id-textfield-cancel')).toBeVisible();
    await expect(component.getByTestId('recommendation-id-textfield-edit')).toBeHidden();
    await expect(component.getByTestId('recommendation-id-textfield')).toBeVisible();
    await expect(
      component.getByTestId('recommendation-id-textfield').getByLabel('Case ID')
    ).not.toBeDisabled();
  });
});
