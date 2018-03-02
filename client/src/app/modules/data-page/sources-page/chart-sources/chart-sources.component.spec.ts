import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSourcesComponent } from './chart-sources.component';

describe('ChartSourcesComponent', () => {
  let component: ChartSourcesComponent;
  let fixture: ComponentFixture<ChartSourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartSourcesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartSourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
