import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TranslationHelperService {
  constructor(private translateService: TranslateService) {}

  /**
   * Pluralize a translation key based on a count
   * Example: pluralize('clients.orders', 5) returns the key for plural form
   */
  pluralize(baseKey: string, count: number): Observable<string> {
    const key = count > 1 ? `${baseKey}_plural` : baseKey;
    return this.translateService.get(key).pipe(
      map(translated => `${count} ${translated}`)
    );
  }

  /**
   * Get translated text with parameters
   * Example: interpolate('messages.welcome', { name: 'John' })
   */
  interpolate(key: string, params?: any): Observable<string> {
    return this.translateService.get(key, params);
  }

  /**
   * Get multiple translations at once
   */
  getMultiple(keys: string[]): Observable<{ [key: string]: string }> {
    return this.translateService.get(keys);
  }

  /**
   * Get instant translation (synchronous)
   */
  instant(key: string, params?: any): string {
    return this.translateService.instant(key, params);
  }
}
