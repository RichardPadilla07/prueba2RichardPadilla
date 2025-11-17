import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearPlanPage } from './crear-plan.page';

describe('CrearPlanPage', () => {
  let component: CrearPlanPage;
  let fixture: ComponentFixture<CrearPlanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearPlanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
