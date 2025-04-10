import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetBbddPage } from './reset-bbdd.page';

describe('ResetBbddPage', () => {
  let component: ResetBbddPage;
  let fixture: ComponentFixture<ResetBbddPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetBbddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
