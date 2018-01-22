import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableDefinerComponent } from './variable-definer.component';

describe('VariableDefinerComponent', () => {
  let component: VariableDefinerComponent;
  let fixture: ComponentFixture<VariableDefinerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariableDefinerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariableDefinerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
