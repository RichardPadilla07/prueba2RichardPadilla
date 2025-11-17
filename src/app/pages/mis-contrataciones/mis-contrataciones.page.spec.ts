import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisContratacionesPage } from './mis-contrataciones.page';

describe('MisContratacionesPage', () => {
  let component: MisContratacionesPage;
  let fixture: ComponentFixture<MisContratacionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisContratacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
