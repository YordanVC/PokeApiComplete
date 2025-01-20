import { TestBed } from '@angular/core/testing';

import { PokemonCapturedStateService } from './pokemon-captured-state.service';

describe('PokemonCapturedStateService', () => {
  let service: PokemonCapturedStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokemonCapturedStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
