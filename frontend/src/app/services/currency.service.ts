import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  fetchAndSaveCurrencies(date: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/currencies/fetch?target_date=${date}`, {});
  }

  getAvailableCurrencies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/currencies`);
  }

  getCurrenciesByDate(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/currencies/${date}`);
  }
}