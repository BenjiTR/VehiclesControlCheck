import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserdataviewPage } from './userdataview.page';

describe('UserdataviewPage', () => {
  let component: UserdataviewPage;
  let fixture: ComponentFixture<UserdataviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UserdataviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
