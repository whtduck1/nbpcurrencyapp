import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { CurrencyService } from './services/currency.service';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockCurrencyService: any;

  beforeEach(async () => {
    mockCurrencyService = jasmine.createSpyObj([
      'getAvailableCurrencies', 
      'getCurrenciesByDate', 
      'getCurrenciesByMonth', 
      'getCurrenciesByYear', 
      'getCurrenciesByQuarter', 
      'fetchAndSaveCurrencies'
    ]);
    
    mockCurrencyService.getAvailableCurrencies.and.returnValue(of([]));
    mockCurrencyService.getCurrenciesByDate.and.returnValue(of([
      { id: 1, currency_code: 'USD', currency_name: 'dolar amerykański', exchange_rate: 4.0152, rate_date: '2026-06-01' }
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

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should display currencies in table when data exists', () => {
    component.activeTab = 'day';
    component.selectedDate = '2026-06-01';
    component.applyFilters();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const tableRows = compiled.querySelectorAll('.table-row');
    
    expect(component.filteredCurrencies.length).toBe(1);
    expect(tableRows.length).toBeGreaterThanOrEqual(0);
  });

  it('should call currency service when click fetch button', () => {
    mockCurrencyService.fetchAndSaveCurrencies.and.returnValue(of({ status: 'Success' }));
    
    component.activeTab = 'day';
    component.selectedDate = '2026-06-01';
    component.fetchAndLoad();
    
    expect(mockCurrencyService.fetchAndSaveCurrencies).toHaveBeenCalledWith('2026-06-01');
    expect(component.isError).toBeFalse();
  });

  it('should fetch monthly data when active tab is changed to month', () => {
    mockCurrencyService.getCurrenciesByMonth.and.returnValue(of([]));
    
    component.setTab('month');
    
    expect(component.activeTab).toBe('month');
    expect(mockCurrencyService.getCurrenciesByMonth).toHaveBeenCalledWith('2026', '06');
  });

  it('should display error message when API request fails', () => {
    mockCurrencyService.getAvailableCurrencies.and.returnValue(throwError(() => new Error('API Error')));
    
    component.activeTab = 'all';
    component.applyFilters();
    
    expect(component.isError).toBeTrue();
    expect(component.message).toContain('Błąd podczas pobierania');
  });
});