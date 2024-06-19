import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NeweventPage } from './newevent.page';

describe('NeweventPage', () => {
  let component: NeweventPage;
  let fixture: ComponentFixture<NeweventPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NeweventPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
