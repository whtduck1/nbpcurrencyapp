import { Component, OnInit} from '@angular/core';
import { CurrencyService } from './services/currency.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

title = 'NBP Currency App';
  
  currencies: any[] = [];
  selectedDate: string = '2026-06-03'; 
  message: string = '';
  isError: boolean = false;

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.loadAllCurrencies();
  }

  loadAllCurrencies(): void {
    this.currencyService.getAvailableCurrencies().subscribe({
      next: (data) => {
        this.currencies = data;
      },
      error: (err) => {
        this.message = 'Błąd podczas ładowania danych z bazy!';
        this.isError = true;
        console.error(err);
      }
    });
  }

  fetchFromNbp(): void {
    if (!this.selectedDate) {
      this.message = 'Wybierz poprawną datę!';
      this.isError = true;
      return;
    }

    this.message = 'Pobieranie danych z NBP...';
    this.isError = false;

    this.currencyService.fetchAndSaveCurrencies(this.selectedDate).subscribe({
      next: (response) => {
        this.message = `Sukces! Pobrano i zapisano rekordy z NBP dla daty: ${this.selectedDate}`;
        this.isError = false;
        this.filterByDate();
      },
      error: (err) => {
        this.message = 'Błąd! NBP może nie mieć tabeli kursów dla tego dnia (np. weekend/święto) lub backend nie działa.';
        this.isError = true;
        console.error(err);
      }
    });
  }

  filterByDate(): void {
    if (!this.selectedDate) return;

    this.currencyService.getCurrenciesByDate(this.selectedDate).subscribe({
      next: (data) => {
        this.currencies = data;
        if (data.length === 0) {
          this.message = `Brak danych w bazie dla daty ${this.selectedDate}. Pobierz je najpierw z NBP!`;
          this.isError = false;
        }
      },
      error: (err) => {
        this.message = 'Błąd podczas filtrowania danych!';
        this.isError = true;
        console.error(err);
      }
    });
  }
}