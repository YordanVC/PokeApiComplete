import { Component } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    imports: [MaterialsModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent {
    constructor(
        public authService: AuthService, 
        private router: Router
      ) {}
    
      logout(): void {
        this.authService.logout();
      }
}
