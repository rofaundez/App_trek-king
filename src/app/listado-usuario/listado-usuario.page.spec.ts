import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoUsuarioPage } from './listado-usuario.page';

describe('ListadoUsuarioPage', () => {
  let component: ListadoUsuarioPage;
  let fixture: ComponentFixture<ListadoUsuarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListadoUsuarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
