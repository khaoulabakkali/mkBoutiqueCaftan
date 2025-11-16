import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Utilisateur } from '../models/utilisateur.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api'; // À configurer selon votre backend

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Récupérer tous les utilisateurs
  getAllUtilisateurs(): Observable<Utilisateur[]> {
    // Pour l'instant, on simule avec des données mockées
    // Remplacez par un vrai appel API quand le backend sera prêt
    return of(this.getMockUtilisateurs()).pipe(
      catchError(this.handleError<Utilisateur[]>('getAllUtilisateurs', []))
    );
  }

  // Récupérer un utilisateur par ID
  getUtilisateurById(id: number): Observable<Utilisateur> {
    const mockUsers = this.getMockUtilisateurs();
    const user = mockUsers.find(u => u.id_utilisateur === id);
    return of(user || mockUsers[0]).pipe(
      catchError(this.handleError<Utilisateur>('getUtilisateurById'))
    );
  }

  // Créer un nouvel utilisateur
  createUtilisateur(utilisateur: Utilisateur): Observable<Utilisateur> {
    // Simulation - en production, utilisez this.http.post
    const newUser: Utilisateur = {
      ...utilisateur,
      id_utilisateur: Date.now(), // Simulation d'ID
      date_creation_compte: new Date().toISOString(),
      actif: utilisateur.actif !== undefined ? utilisateur.actif : true
    };
    return of(newUser).pipe(
      catchError(this.handleError<Utilisateur>('createUtilisateur'))
    );
  }

  // Mettre à jour un utilisateur
  updateUtilisateur(id: number, utilisateur: Utilisateur): Observable<Utilisateur> {
    // Simulation - en production, utilisez this.http.put
    const updatedUser: Utilisateur = {
      ...utilisateur,
      id_utilisateur: id
    };
    return of(updatedUser).pipe(
      catchError(this.handleError<Utilisateur>('updateUtilisateur'))
    );
  }

  // Supprimer un utilisateur
  deleteUtilisateur(id: number): Observable<boolean> {
    // Simulation - en production, utilisez this.http.delete
    return of(true).pipe(
      catchError(this.handleError<boolean>('deleteUtilisateur', false))
    );
  }

  // Désactiver/Activer un utilisateur
  toggleActif(id: number, actif: boolean): Observable<boolean> {
    // Simulation - en production, utilisez this.http.patch
    return of(true).pipe(
      catchError(this.handleError<boolean>('toggleActif', false))
    );
  }

  // Données mockées pour le développement
  private getMockUtilisateurs(): Utilisateur[] {
    return [
      {
        id_utilisateur: 1,
        nom_complet: 'Admin Principal',
        login: 'admin@mkboutique.com',
        role: 'ADMIN' as any,
        telephone: '+212 6 12 34 56 78',
        actif: true,
        date_creation_compte: '2024-01-15T10:00:00Z'
      },
      {
        id_utilisateur: 2,
        nom_complet: 'Manager Boutique',
        login: 'manager@mkboutique.com',
        role: 'MANAGER' as any,
        telephone: '+212 6 23 45 67 89',
        actif: true,
        date_creation_compte: '2024-02-01T10:00:00Z'
      },
      {
        id_utilisateur: 3,
        nom_complet: 'Staff Vente',
        login: 'staff@mkboutique.com',
        role: 'STAFF' as any,
        telephone: '+212 6 34 56 78 90',
        actif: true,
        date_creation_compte: '2024-02-15T10:00:00Z'
      }
    ];
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}

