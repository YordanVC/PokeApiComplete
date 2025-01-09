import { Component } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MaterialsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

}
