import { Component, OnInit } from '@angular/core';
import { CurrencyService } from './services/currency.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  title = 'Kursy walut NBP';
  allCurrencies: any[] = []; 
  filteredCurrencies: any[] = []; 
  activeTab: string = 'day'; 

  selectedDate: string = '2026-06-01'; 
  selectedYear: string = '2026';        
  selectedMonth: string = '06';        
  selectedQuarter: string = 'Q2';      

  message: string = '';
  isError: boolean = false;

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.loadAllCurrencies();
  }

  loadAllCurrencies(): void {
    this.currencyService.getAvailableCurrencies().subscribe({
      next: (data) => {
        this.allCurrencies = data;
        this.applyFilters(); 
      },
      error: (err) => {
        this.message = 'Błąd podczas ładowania danych z bazy!';
        this.isError = true;
      }
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.message = '';
    this.applyFilters();
  }

  fetchAndLoad(): void {
    this.message = 'Inicjalizacja pobierania danych z API NBP...';
    this.isError = false;
    const requestsList = [];

    if (this.activeTab === 'day') {
      if (!this.selectedDate) return;
      requestsList.push(this.currencyService.fetchAndSaveCurrencies(this.selectedDate));
    } 
    else if (this.activeTab === 'month') {
      this.message = `Pobieranie dni roboczych dla miesiąca ${this.selectedMonth}.${this.selectedYear}...`;
      for (let d = 1; d <= 31; d++) {
        const dayStr = d < 10 ? `0${d}` : `${d}`;
        const dateStr = `${this.selectedYear}-${this.selectedMonth}-${dayStr}`;
        requestsList.push(this.currencyService.fetchAndSaveCurrencies(dateStr));
      }
    } 
    else if (this.activeTab === 'quarter') {
      this.message = `Pobieranie danych dla kwartału ${this.selectedQuarter} (${this.selectedYear})...`;
      let months: string[] = [];
      if (this.selectedQuarter === 'Q1') months = ['01', '02', '03'];
      else if (this.selectedQuarter === 'Q2') months = ['04', '05', '06'];
      else if (this.selectedQuarter === 'Q3') months = ['07', '08', '09'];
      else if (this.selectedQuarter === 'Q4') months = ['10', '11', '12'];

      for (const m of months) {
        for (let d = 1; d <= 31; d++) {
          const dayStr = d < 10 ? `0${d}` : `${d}`;
          const dateStr = `${this.selectedYear}-${m}-${dayStr}`;
          requestsList.push(this.currencyService.fetchAndSaveCurrencies(dateStr));
        }
      }
    } 
    else if (this.activeTab === 'year') {
      this.message = `Pobieranie zestawienia danych dla roku ${this.selectedYear}...`;
      for (let m = 1; m <= 12; m++) {
        const monthStr = m < 10 ? `0${m}` : `${m}`;
        requestsList.push(this.currencyService.fetchAndSaveCurrencies(`${this.selectedYear}-${monthStr}-15`));
      }
    }

    if (requestsList.length === 0) return;

    forkJoin(requestsList).subscribe({
      next: () => {
        this.message = 'Dane zostały pomyślnie zaktualizowane!';
        this.isError = false;
        this.loadAllCurrencies();
      },
      error: () => {
        this.message = 'Zakończono pobieranie pakietu danych (dni wolne zostały automatycznie pominięte).';
        this.isError = false;
        this.loadAllCurrencies();
      }
    });
  }

  applyFilters(): void {
    this.filteredCurrencies = this.allCurrencies.filter(item => {
      if (this.activeTab === 'all') {
        return true;
      }

      const dateParts = item.rate_date.split('-'); 
      const year = dateParts[0];
      const month = dateParts[1];
      
      const monthInt = parseInt(month, 10);
      let quarter = '';
      if (monthInt >= 1 && monthInt <= 3) quarter = 'Q1';
      else if (monthInt >= 4 && monthInt <= 6) quarter = 'Q2';
      else if (monthInt >= 7 && monthInt <= 9) quarter = 'Q3';
      else if (monthInt >= 10 && monthInt <= 12) quarter = 'Q4';

      if (this.activeTab === 'day') {
        return item.rate_date === this.selectedDate;
      }
      if (this.activeTab === 'month') {
        return year === this.selectedYear && month === this.selectedMonth;
      }
      if (this.activeTab === 'quarter') {
        return year === this.selectedYear && quarter === this.selectedQuarter;
      }
      if (this.activeTab === 'year') {
        return year === this.selectedYear;
      }
      return true;
    });
  }
}