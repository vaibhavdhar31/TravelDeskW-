import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Signup } from './signup';

describe('Signup', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Signup,
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.signupForm.valid).toBeFalsy();
  });

  it('should validate required fields', () => {
    const form = component.signupForm;
    expect(form.get('firstName')?.valid).toBeFalsy();
    expect(form.get('lastName')?.valid).toBeFalsy();
    expect(form.get('email')?.valid).toBeFalsy();
    expect(form.get('password')?.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    const emailControl = component.signupForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password strength', () => {
    const passwordControl = component.signupForm.get('password');
    
    passwordControl?.setValue('weak');
    expect(passwordControl?.valid).toBeFalsy();
    
    passwordControl?.setValue('StrongPassword123!');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should validate name fields', () => {
    const firstNameControl = component.signupForm.get('firstName');
    const lastNameControl = component.signupForm.get('lastName');
    
    firstNameControl?.setValue('John');
    lastNameControl?.setValue('Doe');
    
    expect(firstNameControl?.valid).toBeTruthy();
    expect(lastNameControl?.valid).toBeTruthy();
  });
});
