import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatGridListModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTabsModule,
    MatCardModule,
    MatDialogModule,
    MatButtonModule
  ],
  exports: [
    MatToolbarModule,
    MatGridListModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTabsModule,
    MatCardModule,
    MatDialogModule,
    MatButtonModule
  ]
})
export class MaterialsModule { }
