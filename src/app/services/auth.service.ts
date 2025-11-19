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
  private readonly SOCIETE_ID_KEY = 'societe_id';
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
        
        // Extraire et stocker le societeId depuis le token
        const societeId = this.extractSocieteIdFromToken(token);
        if (societeId !== null) {
          localStorage.setItem(this.SOCIETE_ID_KEY, societeId.toString());
        }
        
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
    
    // Extraire et stocker le societeId depuis le token
    const societeId = this.extractSocieteIdFromToken(token);
    if (societeId !== null) {
      localStorage.setItem(this.SOCIETE_ID_KEY, societeId.toString());
    }
    
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Déconnecte l'utilisateur et supprime les informations d'authentification
   */
  logout(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.SOCIETE_ID_KEY);
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
   * Décode le token JWT et retourne le payload
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        return null;
      }
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      if (!environment.production) {
        console.error('Erreur lors du décodage du token:', error);
      }
      return null;
    }
  }

  /**
   * Extrait le societeId depuis un token JWT
   */
  private extractSocieteIdFromToken(token: string): number | null {
    const decodedToken = this.decodeToken(token);
    if (!decodedToken) {
      return null;
    }

    // Essayer différentes variantes possibles du nom de la propriété
    const societeId = decodedToken.societeId || 
                      decodedToken.SocieteId || 
                      decodedToken.idSociete || 
                      decodedToken.IdSociete ||
                      decodedToken.societe_id ||
                      decodedToken.societe_Id ||
                      null;

    return societeId !== null ? Number(societeId) : null;
  }

  /**
   * Récupère le societeId depuis le token JWT ou le localStorage
   */
  getSocieteId(): number | null {
    // D'abord essayer de récupérer depuis le localStorage (plus rapide)
    const storedSocieteId = localStorage.getItem(this.SOCIETE_ID_KEY);
    if (storedSocieteId) {
      const id = Number(storedSocieteId);
      if (!isNaN(id)) {
        return id;
      }
    }

    // Sinon, extraire depuis le token
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const societeId = this.extractSocieteIdFromToken(token);
    if (societeId !== null) {
      // Mettre en cache dans le localStorage pour les prochaines fois
      localStorage.setItem(this.SOCIETE_ID_KEY, societeId.toString());
    }

    return societeId;
  }

  /**
   * Récupère le nom de l'utilisateur connecté depuis le token JWT ou les données utilisateur
   */
  getUserName(): string | null {
    // D'abord essayer de récupérer depuis les données utilisateur stockées
    const userData = this.getUserData();
    if (userData?.nomComplet) {
      return userData.nomComplet;
    }
    if (userData?.nom_complet) {
      return userData.nom_complet;
    }
    if (userData?.name) {
      return userData.name;
    }

    // Sinon, extraire depuis le token
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const decodedToken = this.decodeToken(token);
    if (!decodedToken) {
      return null;
    }

    // Essayer différentes variantes possibles du nom de la propriété
    return decodedToken.nomComplet || 
           decodedToken.NomComplet || 
           decodedToken.nom_complet ||
           decodedToken.name ||
           decodedToken.Name ||
           decodedToken.username ||
           decodedToken.Username ||
           decodedToken.login ||
           decodedToken.Login ||
           null;
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

