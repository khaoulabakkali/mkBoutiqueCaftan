import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, delay } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Utilisateur, Role } from '../models/utilisateur.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = environment.apiUrl || 'http://localhost:5000/api';
  private readonly STORAGE_KEY = 'local_utilisateurs';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Initialiser le stockage local avec des données de démonstration si vide
    this.initializeLocalStorage();
  }

  /**
   * Initialise le stockage local avec des données de démonstration
   */
  private initializeLocalStorage(): void {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (!existing) {
      const defaultUsers: Utilisateur[] = [
        {
          id_utilisateur: 1,
          nom_complet: 'Admin Principal',
          login: 'admin@mkboutique.com',
          role: Role.ADMIN,
          telephone: '+212 6 12 34 56 78',
          actif: true,
          date_creation_compte: new Date().toISOString()
        },
        {
          id_utilisateur: 2,
          nom_complet: 'Manager Boutique',
          login: 'manager@mkboutique.com',
          role: Role.MANAGER,
          telephone: '+212 6 23 45 67 89',
          actif: true,
          date_creation_compte: new Date().toISOString()
        },
        {
          id_utilisateur: 3,
          nom_complet: 'Staff Vente',
          login: 'staff@mkboutique.com',
          role: Role.STAFF,
          telephone: '+212 6 34 56 78 90',
          actif: true,
          date_creation_compte: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultUsers));
    }
  }

  /**
   * Récupère tous les utilisateurs du stockage local
   */
  private getLocalUtilisateurs(): Utilisateur[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Sauvegarde les utilisateurs dans le stockage local
   */
  private saveLocalUtilisateurs(utilisateurs: Utilisateur[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(utilisateurs));
  }

  /**
   * Génère un nouvel ID pour un utilisateur
   */
  private getNextId(): number {
    const utilisateurs = this.getLocalUtilisateurs();
    if (utilisateurs.length === 0) return 1;
    return Math.max(...utilisateurs.map(u => u.id_utilisateur || 0)) + 1;
  }

  /**
   * Récupérer tous les utilisateurs (local)
   */
  getAllUtilisateurs(): Observable<Utilisateur[]> {
    const utilisateurs = this.getLocalUtilisateurs();
    // Simuler un délai réseau
    return of(utilisateurs).pipe(delay(300));
  }

  /**
   * Récupérer un utilisateur par ID (local)
   */
  getUtilisateurById(id: number): Observable<Utilisateur> {
    const utilisateurs = this.getLocalUtilisateurs();
    const utilisateur = utilisateurs.find(u => u.id_utilisateur === id);
    
    if (!utilisateur) {
      return throwError(() => new Error(`Utilisateur avec l'ID ${id} non trouvé`));
    }
    
    // Retourner une copie pour éviter les modifications directes
    return of({ ...utilisateur }).pipe(delay(200));
  }

  /**
   * Créer un nouvel utilisateur (local)
   */
  createUtilisateur(utilisateur: Utilisateur): Observable<Utilisateur> {
    const utilisateurs = this.getLocalUtilisateurs();
    
    // Vérifier si le login existe déjà
    if (utilisateurs.some(u => u.login === utilisateur.login)) {
      return throwError(() => new Error('Un utilisateur avec ce login existe déjà'));
    }
    
    // Créer le nouvel utilisateur
    const newUtilisateur: Utilisateur = {
      ...utilisateur,
      id_utilisateur: this.getNextId(),
      date_creation_compte: new Date().toISOString(),
      mot_de_passe: undefined, // Ne pas stocker le mot de passe en clair
      mot_de_passe_hash: undefined
    };
    
    utilisateurs.push(newUtilisateur);
    this.saveLocalUtilisateurs(utilisateurs);
    
    return of({ ...newUtilisateur }).pipe(delay(300));
  }

  /**
   * Mettre à jour un utilisateur (local)
   */
  updateUtilisateur(id: number, utilisateur: Utilisateur): Observable<Utilisateur> {
    const utilisateurs = this.getLocalUtilisateurs();
    const index = utilisateurs.findIndex(u => u.id_utilisateur === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Utilisateur avec l'ID ${id} non trouvé`));
    }
    
    // Vérifier si le login existe déjà pour un autre utilisateur
    const existingUser = utilisateurs.find(u => u.login === utilisateur.login && u.id_utilisateur !== id);
    if (existingUser) {
      return throwError(() => new Error('Un utilisateur avec ce login existe déjà'));
    }
    
    // Mettre à jour l'utilisateur
    const updatedUtilisateur: Utilisateur = {
      ...utilisateurs[index],
      ...utilisateur,
      id_utilisateur: id, // S'assurer que l'ID ne change pas
      mot_de_passe: undefined, // Ne pas stocker le mot de passe en clair
      mot_de_passe_hash: undefined
    };
    
    utilisateurs[index] = updatedUtilisateur;
    this.saveLocalUtilisateurs(utilisateurs);
    
    return of({ ...updatedUtilisateur }).pipe(delay(300));
  }

  /**
   * Supprimer un utilisateur (local)
   */
  deleteUtilisateur(id: number): Observable<boolean> {
    const utilisateurs = this.getLocalUtilisateurs();
    const index = utilisateurs.findIndex(u => u.id_utilisateur === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Utilisateur avec l'ID ${id} non trouvé`));
    }
    
    utilisateurs.splice(index, 1);
    this.saveLocalUtilisateurs(utilisateurs);
    
    return of(true).pipe(delay(300));
  }

  /**
   * Désactiver/Activer un utilisateur (local)
   */
  toggleActif(id: number, actif: boolean): Observable<boolean> {
    const utilisateurs = this.getLocalUtilisateurs();
    const utilisateur = utilisateurs.find(u => u.id_utilisateur === id);
    
    if (!utilisateur) {
      return throwError(() => new Error(`Utilisateur avec l'ID ${id} non trouvé`));
    }
    
    utilisateur.actif = actif;
    this.saveLocalUtilisateurs(utilisateurs);
    
    return of(true).pipe(delay(200));
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      let errorMessage = 'Une erreur est survenue';
      
      if (error.error instanceof ErrorEvent) {
        // Erreur côté client
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        // Erreur côté serveur
        if (error.status === 401) {
          errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
          // Optionnel: déconnecter l'utilisateur
          // this.authService.logout();
        } else if (error.status === 403) {
          errorMessage = 'Accès interdit.';
        } else if (error.status === 404) {
          errorMessage = 'Ressource non trouvée.';
        } else if (error.status === 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else if (error.error) {
          // Essayer d'extraire le message d'erreur de différentes façons
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.errors && Array.isArray(error.error.errors)) {
            // Gérer les erreurs de validation multiples
            errorMessage = error.error.errors.map((e: any) => e.message || e).join(', ');
          }
        }
      }

      // Retourner une erreur observable avec le message
      return throwError(() => new Error(errorMessage));
    };
  }
}

