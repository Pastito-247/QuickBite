describe('Home Page E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display home page', () => {
    cy.contains('¿Qué te provoca pedir hoy').should('be.visible');
    cy.contains('Plato, restaurante, antojo').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Buscar');
  });

  it('should display restaurant categories', () => {
    cy.contains('Hamburguesas').should('be.visible');
    cy.contains('Pizzas').should('be.visible');
    cy.contains('Mexicana').should('be.visible');
  });

  it('should display mock restaurants', () => {
    cy.contains('Burger Queen').should('be.visible');
    cy.contains('Pizza Hub').should('be.visible');
    cy.contains('Taco Fiesta').should('be.visible');
  });

  it('should handle search input', () => {
    cy.get('input[placeholder="Plato, restaurante, antojo"]').type('hamburguesa');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', 'restaurants');
  });

  it('should handle address selection', () => {
    cy.get('select').should('be.visible');
    cy.get('select').select('Providencia, Región Metropolitana');
    cy.get('select').should('have.value', 'Providencia, Región Metropolitana');
  });

  it('should navigate to restaurants page on category click', () => {
    cy.contains('Hamburguesas').click();
    cy.url().should('include', 'restaurants');
    cy.url().should('include', 'category');
  });
});
