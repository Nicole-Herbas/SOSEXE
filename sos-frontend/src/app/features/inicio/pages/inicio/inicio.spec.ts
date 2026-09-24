import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Inicio } from './inicio';

describe('Inicio', () => {

  let component: Inicio;
  let fixture: ComponentFixture<Inicio>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Inicio);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a deadline for every news item', () => {
    expect(component.allNews.length).toBeGreaterThan(0);

    component.allNews.forEach((news) => {
      expect(news.deadline).toBeTruthy();
      expect(news.deadline.trim()).not.toBe('');
    });
  });

});