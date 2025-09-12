import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Login,
        HttpClientTestingModule,    // Mock HTTP calls
        RouterTestingModule,       // Mock routing
        ReactiveFormsModule        // For forms
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should require email and password', () => {
    const emailControl = component.loginForm.controls['email'];
    const passwordControl = component.loginForm.controls['password'];
    
    expect(emailControl.valid).toBeFalsy();
    expect(passwordControl.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.controls['email'];
    
    emailControl.setValue('invalid-email');
    expect(emailControl.valid).toBeFalsy();
    
    emailControl.setValue('valid@email.com');
    expect(emailControl.valid).toBeTruthy();
  });

  it('should show error for short password', () => {
    const passwordControl = component.loginForm.controls['password'];
    
    passwordControl.setValue('123');
    expect(passwordControl.valid).toBeFalsy();
    
    passwordControl.setValue('password123');
    expect(passwordControl.valid).toBeTruthy();
  });
});
