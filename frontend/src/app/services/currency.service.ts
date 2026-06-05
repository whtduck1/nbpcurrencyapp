import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = 'http://localhost:8000/api/currencies';

  constructor(private http: HttpClient) {}

  getAvailableCurrencies(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getCurrenciesByDate(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${date}`);
  }

  getCurrenciesByYear(year: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/year/${year}`);
  }

  getCurrenciesByQuarter(year: string, quarter: string): Observable<any[]> {
    const qNumber = quarter.replace('Q', '');
    return this.http.get<any[]>(`${this.apiUrl}/quarter/${year}/${qNumber}`);
  }

  getCurrenciesByMonth(year: string, month: string): Observable<any[]> {
    const mNumber = parseInt(month, 10).toString();
    return this.http.get<any[]>(`${this.apiUrl}/month/${year}/${mNumber}`);
  }

  fetchAndSaveCurrencies(date: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/fetch?target_date=${date}`, {});
  }
}