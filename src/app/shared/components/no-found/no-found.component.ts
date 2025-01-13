import { Component } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { Router } from '@angular/router';

@Component({
    selector: 'app-no-found',
    imports: [MaterialsModule],
    templateUrl: './no-found.component.html',
    styleUrl: './no-found.component.css'
})
export class NoFoundComponent {
  constructor(private router: Router) {}

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
