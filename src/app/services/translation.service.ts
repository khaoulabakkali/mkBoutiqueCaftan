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
    try {
      const translation = this.translate.instant(key);
      // Si la traduction retourne la clé elle-même, cela signifie qu'elle n'existe pas
      if (translation === key) {
        return key; // Retourner la clé plutôt que de générer une erreur
      }
      return translation;
    } catch (e) {
      // En cas d'erreur, retourner la clé
      return key;
    }
  }

  get(key: string): Observable<string> {
    return this.translate.get(key);
  }
}
