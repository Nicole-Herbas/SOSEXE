import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { Navbar } from './navbar';

describe('Navbar', () => {

  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;

    httpMock.match(req => req.url.includes('/i18n/')).forEach(req => req.flush({}));

    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});