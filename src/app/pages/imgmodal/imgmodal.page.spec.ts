import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImgmodalPage } from './imgmodal.page';

describe('ImgmodalPage', () => {
  let component: ImgmodalPage;
  let fixture: ComponentFixture<ImgmodalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgmodalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
