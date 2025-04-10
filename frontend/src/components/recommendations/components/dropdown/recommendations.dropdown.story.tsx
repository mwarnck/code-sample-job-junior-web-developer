import Dropdown from './recommendations.dropdown.component';

export const DropdownWithoutStatusAndAutomatedTrue = () => {
  return (
    <Dropdown
      handleChange={() => {}}
      recoStatus={'empty'}
      values={['done', 'not_intersting']}
      usecase={'fba_missing_inbound'}
      isAutomated={true}
    />
  );
};
export const DropdownWithoutStatusAndAutomatedFalse = () => {
  return (
    <Dropdown
      handleChange={() => {}}
      recoStatus={'empty'}
      values={['done', 'not_intersting']}
      usecase={'fba_missing_inbound'}
      isAutomated={false}
    />
  );
};
