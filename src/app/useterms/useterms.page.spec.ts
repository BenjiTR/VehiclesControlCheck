import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsetermsPage } from './useterms.page';

describe('UsetermsPage', () => {
  let component: UsetermsPage;
  let fixture: ComponentFixture<UsetermsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsetermsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
