import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth';

export interface LoginResponse {
  token: string;
  role: string;
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true,
})
export class Login implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    console.log('Form submitted, valid:', this.loginForm.valid);
    if (this.loginForm.valid) {
      console.log('Form Values:', this.loginForm.value);
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: LoginResponse) => {
          console.log('Login successful! Response:', response);

          localStorage.setItem('authToken', response.token);
          localStorage.setItem('userRole', response.role);

          // Navigate based on role
          switch (response.role) {
            case 'admin':
              console.log("admin verified")
              this.router.navigate(['/admin']);
              console.log("admin logged")
              break;
            case 'employee':
              this.router.navigate(['/employee']);
              break;
            case 'manager':
              this.router.navigate(['/manager']);
              break;
            case 'travel-admin':
              this.router.navigate(['/travel-admin']);
              break;
            default:
              console.error('Unknown role:', response.role);
              this.errorMessage = 'Unknown role: ' + response.role;
          }
        },
        error: (err: unknown) => {
          console.error('Login failed1:', err);
          this.errorMessage = 'Invalid email or password';
        },
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
