import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserdataPage } from './userdata.page';

describe('UserdataPage', () => {
  let component: UserdataPage;
  let fixture: ComponentFixture<UserdataPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UserdataPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
