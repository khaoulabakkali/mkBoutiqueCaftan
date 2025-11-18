import { Injectable } from '@angular/core';
import { Observable, throwError, of, delay } from 'rxjs';
import { Role } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly STORAGE_KEY = 'local_roles';

  constructor() {
    // Initialiser le stockage local avec des données de démonstration si vide
    this.initializeLocalStorage();
  }

  /**
   * Initialise le stockage local avec des données de démonstration
   */
  private initializeLocalStorage(): void {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (!existing) {
      const defaultRoles: Role[] = [
        {
          idRole: 1,
          nomRole: 'ADMIN',
          description: 'Accès complet à toutes les fonctionnalités',
          actif: true
        },
        {
          idRole: 2,
          nomRole: 'MANAGER',
          description: 'Gestion des opérations et du personnel',
          actif: true
        },
        {
          idRole: 3,
          nomRole: 'STAFF',
          description: 'Accès aux fonctionnalités de base',
          actif: true,
        }
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultRoles));
    }
  }

  /**
   * Récupère tous les rôles du stockage local
   */
  private getLocalRoles(): Role[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Sauvegarde les rôles dans le stockage local
   */
  private saveLocalRoles(roles: Role[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(roles));
  }

  /**
   * Génère un nouvel ID pour un rôle
   */
  private getNextId(): number {
    const roles = this.getLocalRoles();
    if (roles.length === 0) return 1;
    return Math.max(...roles.map(r => r.idRole || 0)) + 1;
  }

  /**
   * Récupérer tous les rôles (local)
   */
  getAllRoles(): Observable<Role[]> {
    const roles = this.getLocalRoles();
    return of(roles).pipe(delay(300));
  }

  /**
   * Récupérer tous les rôles actifs (local)
   */
  getActiveRoles(): Observable<Role[]> {
    const roles = this.getLocalRoles();
    const activeRoles = roles.filter(r => r.actif);
    return of(activeRoles).pipe(delay(200));
  }

  /**
   * Récupérer un rôle par ID (local)
   */
  getRoleById(id: number): Observable<Role> {
    const roles = this.getLocalRoles();
    const role = roles.find(r => r.idRole === id);
    
    if (!role) {
      return throwError(() => new Error(`Rôle avec l'ID ${id} non trouvé`));
    }
    
    return of({ ...role }).pipe(delay(200));
  }

  /**
   * Créer un nouveau rôle (local)
   */
  createRole(role: Role): Observable<Role> {
    const roles = this.getLocalRoles();
    
    // Vérifier si le code existe déjà
    if (roles.some(r => r.nomRole.toUpperCase() === role.nomRole.toUpperCase())) {
      return throwError(() => new Error('Un rôle avec ce code existe déjà'));
    }
    
    // Créer le nouveau rôle
    const newRole: Role = {
      ...role,
      idRole: this.getNextId(),
      nomRole: role.nomRole.toUpperCase()
    };
    
    roles.push(newRole);
    this.saveLocalRoles(roles);
    
    return of({ ...newRole }).pipe(delay(300));
  }

  /**
   * Mettre à jour un rôle (local)
   */
  updateRole(id: number, role: Role): Observable<Role> {
    const roles = this.getLocalRoles();
    const index = roles.findIndex(r => r.idRole === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Rôle avec l'ID ${id} non trouvé`));
    }
    
    // Vérifier si le code existe déjà pour un autre rôle
    const existingRole = roles.find(r => r.nomRole.toUpperCase() === role.nomRole.toUpperCase() && r.idRole !== id);
    if (existingRole) {
      return throwError(() => new Error('Un rôle avec ce code existe déjà'));
    }
    
    // Mettre à jour le rôle
    const updatedRole: Role = {
      ...roles[index],
      ...role,
      idRole: id, // S'assurer que l'ID ne change pas
      nomRole: role.nomRole.toUpperCase() // Toujours en majuscules
    };
    
    roles[index] = updatedRole;
    this.saveLocalRoles(roles);
    
    return of({ ...updatedRole }).pipe(delay(300));
  }

  /**
   * Supprimer un rôle (local)
   */
  deleteRole(id: number): Observable<boolean> {
    const roles = this.getLocalRoles();
    const index = roles.findIndex(r => r.idRole === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Rôle avec l'ID ${id} non trouvé`));
    }
    
    roles.splice(index, 1);
    this.saveLocalRoles(roles);
    
    return of(true).pipe(delay(300));
  }

  /**
   * Désactiver/Activer un rôle (local)
   */
  toggleActif(id: number, actif: boolean): Observable<boolean> {
    const roles = this.getLocalRoles();
    const role = roles.find(r => r.idRole === id);
    
    if (!role) {
      return throwError(() => new Error(`Rôle avec l'ID ${id} non trouvé`));
    }
    
    role.actif = actif;
    this.saveLocalRoles(roles);
    
    return of(true).pipe(delay(200));
  }
}

