import { TestBed } from '@angular/core/testing';

import { UniversalStorageService } from './universal-storage.service';

describe('UniversalStorageService', () => {
  let service: UniversalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniversalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
