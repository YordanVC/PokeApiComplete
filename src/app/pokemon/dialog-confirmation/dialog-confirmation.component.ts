import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialsModule } from '../../materials/materials.module';

@Component({
  selector: 'app-dialog-confirmation',
  imports: [MaterialsModule],
  templateUrl: './dialog-confirmation.component.html',
  styleUrl: './dialog-confirmation.component.css'
})
export class DialogConfirmationComponent {
  message: string;
  constructor(private dialogRef: MatDialogRef<DialogConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      pokemonName: string,
      message?: string }
  ) {
    this.message = this.data.message || 
      `¿Está apunto de capturar a ${this.data.pokemonName}?`;
  }


  onConfirm() {
    this.dialogRef.close(true); // Devuelve true si se confirma
  }

  onCancel() {
    this.dialogRef.close(false); // Devuelve false si se cancela
  }
}
