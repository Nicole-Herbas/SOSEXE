import { TestBed } from '@angular/core/testing';
import { Centro } from './centro';

describe('Centro', () => {
  let service: Centro;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Centro);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
