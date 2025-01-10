import { Component } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';

@Component({
  selector: 'app-no-found',
  standalone: true,
  imports: [MaterialsModule],
  templateUrl: './no-found.component.html',
  styleUrl: './no-found.component.css'
})
export class NoFoundComponent {

}
