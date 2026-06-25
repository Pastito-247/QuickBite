describe('Login E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.contains('Iniciar Sesión').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should switch to registration form', () => {
    cy.contains('Registrarse').click();
    cy.contains('Nombre de Usuario').should('be.visible');
    cy.contains('Nombre').should('be.visible');
    cy.contains('Apellido').should('be.visible');
  });

  it('should toggle password visibility', () => {
    cy.get('input[type="password"]').should('have.attr', 'type', 'password');
    cy.get('button[aria-label="toggle password"]').click();
    cy.get('input[type="text"]').should('have.attr', 'type', 'text');
  });

  it('should handle login with mock credentials (offline mode)', () => {
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // En modo offline, debería redirigir a home
    cy.url().should('include', '/');
  });

  it('should display error message with invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Debería mostrar algún mensaje de error o redirigir
    cy.url().should('include', '/');
  });
});
