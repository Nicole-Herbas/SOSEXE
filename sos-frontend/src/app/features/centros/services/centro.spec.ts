import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CentroService } from './centro';

describe('CentroService', () => {

  let service: CentroService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(CentroService);

  });

  it('should be created', () => {

    expect(service).toBeTruthy();

  });

});