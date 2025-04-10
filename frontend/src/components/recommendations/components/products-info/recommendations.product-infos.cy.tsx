import { minimalRecommendation } from 'tests/db/data/recommendations';

import ProductInfos from './recommendations.product-infos.component';

const recommendation = minimalRecommendation.size_change_higher_fba();
const { name, image, asin, sku } = recommendation[0];

describe('Recommendations Product-Infos Component', () => {
  it('renders the product infos component', () => {
    cy.nextMount(<ProductInfos image={image} name={name} asin={asin} sku={sku} fnsku={null} />);
    cy.get('[data-cy=recommendations-infos-no-image]').should('not.exist');
    cy.get('[data-cy=recommendations-infos-image]').should('exist');
    cy.get('[data-cy=recommendations-infos-asin]').should('exist').contains(asin);
    cy.get('[data-cy=recommendations-infos-sku-fnsku]').should('exist').contains(sku);

    cy.get('[data-cy=recommendations-infos-name]')
      .should('exist')
      .contains(name?.slice(0, 20));
  });

  it('renders the not available picture', () => {
    cy.nextMount(<ProductInfos image={null} name={name} asin={asin} sku={sku} fnsku={null} />);
    cy.get('[data-cy=recommendations-infos-no-image]').should('exist');
  });
  it('renders fnsku instead of sku', () => {
    cy.nextMount(<ProductInfos image={image} name={name} asin={asin} sku={null} fnsku={sku} />);

    cy.get('[data-cy=recommendations-infos-sku-fnsku]').should('exist').contains(sku);
  });
  it('shows not available if asin is not available', () => {
    cy.nextMount(<ProductInfos image={null} name={null} asin={null} sku={sku} fnsku={null} />);
    cy.get('[data-cy=recommendations-infos-asin]').contains('nicht mehr verfügbar');
  });
});
