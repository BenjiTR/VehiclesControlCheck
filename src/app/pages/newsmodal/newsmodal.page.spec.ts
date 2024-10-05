import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsmodalPage } from './newsmodal.page';

describe('NewsmodalPage', () => {
  let component: NewsmodalPage;
  let fixture: ComponentFixture<NewsmodalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsmodalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
