import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialPokemonSelectionComponent } from './initial-pokemon-selection.component';

describe('InitialPokemonSelectionComponent', () => {
  let component: InitialPokemonSelectionComponent;
  let fixture: ComponentFixture<InitialPokemonSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitialPokemonSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitialPokemonSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
