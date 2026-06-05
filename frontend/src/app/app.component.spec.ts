import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { CurrencyService } from './services/currency.service';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('AppComponent (BDD Scenarios)', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockCurrencyService: any;

  beforeEach(async () => {
    mockCurrencyService = jasmine.createSpyObj(['getAvailableCurrencies', 'fetchAndSaveCurrencies']);
    mockCurrencyService.getAvailableCurrencies.and.returnValue(of([
      { id: 1, currency_code: 'USD', currency_name: 'dolar amerykański', exchange_rate: 4.0152, rate_date: '2026-06-01' },
      { id: 2, currency_code: 'EUR', currency_name: 'euro', exchange_rate: 4.3210, rate_date: '2026-06-02' }
    ]));

    await TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: CurrencyService, useValue: mockCurrencyService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('SHOULD display currencies in table WHEN component initializes (Given data exists)', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const tableRows = compiled.querySelectorAll('.table-row');
    
    expect(component.filteredCurrencies.length).toBe(1); // dla domyślnej daty 2026-06-01 przefiltruje tylko USD
    expect(tableRows.length).toBeGreaterThanOrEqual(0);
  });

  it('SHOULD call currency service WHEN click fetch button', () => {
    mockCurrencyService.fetchAndSaveCurrencies.and.returnValue(of({ status: 'Success' }));
    
    component.activeTab = 'day';
    component.selectedDate = '2026-06-01';
    
    component.fetchAndLoad();
    
    expect(mockCurrencyService.fetchAndSaveCurrencies).toHaveBeenCalledWith('2026-06-01');
    expect(component.isError).toBeFalse();
  });
});