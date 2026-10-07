import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImpressionAdminApiConfigComponent } from './impression-admin-api-config.component';

describe('ImpressionAdminApiConfigComponent', () => {
  let component: ImpressionAdminApiConfigComponent;
  let fixture: ComponentFixture<ImpressionAdminApiConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImpressionAdminApiConfigComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ImpressionAdminApiConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
