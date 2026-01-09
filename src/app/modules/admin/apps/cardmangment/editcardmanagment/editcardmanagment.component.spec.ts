import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditcardmanagmentComponent } from './editcardmanagment.component';

describe('EditcardmanagmentComponent', () => {
  let component: EditcardmanagmentComponent;
  let fixture: ComponentFixture<EditcardmanagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditcardmanagmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditcardmanagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
