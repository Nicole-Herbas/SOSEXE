import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Donar } from './donar';
import { of } from 'rxjs';
import { CentroService } from '../../../centros/services/centro';
import { provideRouter } from '@angular/router';

describe('Donar', () => {
  let component: Donar;
  let fixture: ComponentFixture<Donar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Donar],
      providers: [
        provideRouter([]),
        {
          provide: CentroService,
          useValue: {
            listarVerificados: () => of([])
          }
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Donar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
