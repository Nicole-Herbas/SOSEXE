import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CentroService } from './centro';

describe('CentroService', () => {
  let service: CentroService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CentroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
