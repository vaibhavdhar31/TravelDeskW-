import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let mockRouter: jasmine.SpyObj<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });
    
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    route = {} as ActivatedRouteSnapshot;
    state = {} as RouterStateSnapshot;
  });

  it('should allow access when valid token exists', () => {
    // Create a valid JWT token (mock)
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjo5OTk5OTk5OTk5fQ.Lm_8cLSbzRWD7vEpNzgQjnFWlPh8Wg5K6tY8sJ9X7Qs';
    
    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('userRole', 'employee');
    
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBeTruthy();
    
    // Cleanup
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
  });

  it('should redirect to login when no token exists', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBeFalsy();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
