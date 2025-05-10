import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RutaDetallesPage } from './ruta-detalles.page';

describe('RutaDetallesPage', () => {
  let component: RutaDetallesPage;
  let fixture: ComponentFixture<RutaDetallesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RutaDetallesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
