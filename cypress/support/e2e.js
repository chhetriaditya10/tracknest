// cypress/support/e2e.js

// Custom commands for E2E testing
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="identifier"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('.btn-primary').click();
  // Wait for navigation to home page
  cy.url().should('include', '/home');
});