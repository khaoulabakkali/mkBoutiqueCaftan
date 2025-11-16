import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkAuthStatus());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private readonly AUTH_TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  constructor(private router: Router) {}

  /**
   * Vérifie si l'utilisateur est authentifié en vérifiant le token dans le localStorage
   */
  private checkAuthStatus(): boolean {
    const token = localStorage.getItem(this.AUTH_TOKEN_KEY);
    return !!token;
  }

  /**
   * Vérifie si l'utilisateur est actuellement authentifié
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Connecte l'utilisateur et stocke les informations d'authentification
   */
  login(token: string, userData?: any): void {
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
}

