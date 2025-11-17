import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContratacionesAsesorPage } from './contrataciones-asesor.page';

describe('ContratacionesAsesorPage', () => {
  let component: ContratacionesAsesorPage;
  let fixture: ComponentFixture<ContratacionesAsesorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ContratacionesAsesorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
