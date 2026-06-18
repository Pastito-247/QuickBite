describe('Restaurants Page E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/restaurants');
  });

  it('should display restaurants list', () => {
    cy.contains('Restaurantes').should('be.visible');
    cy.contains('Burger Queen').should('be.visible');
    cy.contains('Pizza Hub').should('be.visible');
  });

  it('should display restaurant cards with information', () => {
    cy.contains('Burger Queen').should('be.visible');
    cy.contains('Hamburguesas').should('be.visible');
    cy.contains('4.8').should('be.visible');
  });

  it('should filter by category', () => {
    cy.contains('Hamburguesas').click();
    cy.url().should('include', 'category=Hamburguesas');
  });

  it('should search restaurants', () => {
    cy.get('input[placeholder="Buscar restaurantes..."]').type('Pizza');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', 'search=Pizza');
  });

  it('should navigate to menu page on restaurant click', () => {
    cy.contains('Burger Queen').click();
    cy.url().should('include', '/menu');
  });
});
