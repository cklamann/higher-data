import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableSourcesComponent } from './variable-sources.component';

describe('VariableSourcesComponent', () => {
  let component: VariableSourcesComponent;
  let fixture: ComponentFixture<VariableSourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariableSourcesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariableSourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
