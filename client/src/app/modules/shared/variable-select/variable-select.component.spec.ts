import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableSelectComponent } from './variable-select.component';

describe('VariableSelectComponent', () => {
  let component: VariableSelectComponent;
  let fixture: ComponentFixture<VariableSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariableSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariableSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
