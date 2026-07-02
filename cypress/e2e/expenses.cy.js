describe('Basic E2E Test', () => {
  it('should load the home page', () => {
    cy.visit('/');
    cy.contains('TrackNest').should('be.visible');
  });
});
