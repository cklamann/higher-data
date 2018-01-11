import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartCreatorComponent } from './chart-creator.component';

describe('ChartCreatorComponent', () => {
  let component: ChartCreatorComponent;
  let fixture: ComponentFixture<ChartCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
