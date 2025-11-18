import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    idUtilisateur: number;
    nomComplet: string;
    login: string;
    role: string;
    token?: string; // Le token peut être dans l'objet User ou dans un header
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkAuthStatus());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private readonly AUTH_TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private apiUrl = environment.apiUrl || 'http://localhost:5000/api';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  /**
   * Vérifie si l'utilisateur est authentifié en vérifiant le token dans le localStorage
   */
  private checkAuthStatus(): boolean {
    const token = localStorage.getItem(this.AUTH_TOKEN_KEY);
    return !!token;
  }

  /**
   * Vérifie si l'utilisateur est actuellement authentifié
   * Vérifie toujours le localStorage pour garantir la persistance après rafraîchissement
   */
  isAuthenticated(): boolean {
    const isAuth = this.checkAuthStatus();
    // Synchroniser le BehaviorSubject avec l'état réel du localStorage
    if (isAuth !== this.isAuthenticatedSubject.value) {
      this.isAuthenticatedSubject.next(isAuth);
    }
    return isAuth;
  }

  /**
   * Connecte l'utilisateur via l'API
   */
  login(login: string, password: string): Observable<LoginResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      { Login: login, Password: password },
      { ...httpOptions, observe: 'response' as const }
    ).pipe(
      map((httpResponse: HttpResponse<LoginResponse>) => {
        // Vérifier le statut HTTP d'abord
        if (httpResponse.status === 401) {
          const response = httpResponse.body;
          const message = response?.message || 'Identifiants invalides';
          throw { status: 401, error: response, message };
        }
        
        const response = httpResponse.body;
        
        // Vérifier si la connexion a réussi
        if (!response || !response.success || !response.user) {
          throw new Error(response?.message || 'Échec de la connexion');
        }

        const token = this.extractToken(response.user, httpResponse);
        
        if (!token) {
          throw new Error('Token non reçu du serveur');
        }

        // Stocker le token et les données utilisateur
        localStorage.setItem(this.AUTH_TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        this.isAuthenticatedSubject.next(true);
        
        return response;
      }),
      catchError((error: any) => {
        if (!environment.production) {
          console.error('Erreur de connexion API:', error);
        }
        
        const errorMessage = this.extractErrorMessage(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Méthode de compatibilité pour login avec token (si nécessaire)
   */
  loginWithToken(token: string, userData?: any): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
    if (userData) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    }
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Déconnecte l'utilisateur et supprime les informations d'authentification
   */
  logout(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Récupère le token d'authentification
   */
  getToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  /**
   * Récupère les données de l'utilisateur connecté
   */
  getUserData(): any {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Extrait le token depuis l'objet User ou les headers HTTP
   */
  private extractToken(user: any, httpResponse: HttpResponse<LoginResponse>): string | null {
    if (user?.token) {
      return user.token;
    }

    const authHeader = httpResponse.headers.get('Authorization');
    if (authHeader) {
      return authHeader.replace('Bearer ', '');
    }

    return null;
  }

  /**
   * Extrait le message d'erreur de la réponse HTTP
   */
  private extractErrorMessage(error: any): string {
    const defaultMessage = 'Erreur de connexion. Vérifiez vos identifiants.';

    if (error.status === 401) {
      if (error.error?.success === false && error.error?.message) {
        return error.error.message;
      }
      if (error.error?.message) {
        return error.error.message;
      }
      return 'Identifiants invalides. Veuillez réessayer.';
    }

    if (error.error) {
      if (error.error.message) {
        return error.error.message;
      }
      if (error.error.error) {
        return error.error.error;
      }
      if (typeof error.error === 'string') {
        return error.error;
      }
    }

    if (error.message) {
      return error.message;
    }

    return defaultMessage;
  }
}

