import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Donar } from './donar';

describe('Donar', () => {
  let component: Donar;
  let fixture: ComponentFixture<Donar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Donar]
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
