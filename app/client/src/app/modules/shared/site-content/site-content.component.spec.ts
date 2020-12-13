import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableDefinitionSelectComponent } from './variable-definition-select.component';

describe('VariableDefinitionSelectComponent', () => {
  let component: VariableDefinitionSelectComponent;
  let fixture: ComponentFixture<VariableDefinitionSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariableDefinitionSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariableDefinitionSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
