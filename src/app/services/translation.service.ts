import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = new BehaviorSubject<string>('fr');
  public currentLanguage$ = this.currentLanguage.asObservable();

  constructor(private translate: TranslateService) {
    this.initializeTranslations();
  }

  private initializeTranslations() {
    // Définir les langues disponibles
    this.translate.addLangs(['en', 'fr', 'ar']);
    
    // Obtenir la langue stockée ou utiliser le français par défaut
    const storedLanguage = localStorage.getItem('language') || 'fr';
    this.setLanguage(storedLanguage);
  }

  setLanguage(language: string): void {
    this.translate.use(language);
    this.currentLanguage.next(language);
    localStorage.setItem('language', language);
  }

  getCurrentLanguage(): string {
    return this.currentLanguage.value;
  }

  getLanguages(): string[] {
    return ['en', 'fr', 'ar'];
  }

  instant(key: string): string {
    return this.translate.instant(key);
  }

  get(key: string): Observable<string> {
    return this.translate.get(key);
  }
}
