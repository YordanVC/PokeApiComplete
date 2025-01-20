import { Component } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [MaterialsModule,CommonModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  loginValid: boolean = true;
  year: number = new Date().getFullYear();

  constructor(private authService: AuthService, private router: Router) {

  }

  login(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.loginValid = true;
        this.authService.setAuthenticated(true)
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        console.error('Login failed ', err)
        this.loginValid = false;
      }
    });
  }
}
