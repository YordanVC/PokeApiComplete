import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { athenticatedGuard } from './athenticated.guard';

describe('athenticatedGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => athenticatedGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
