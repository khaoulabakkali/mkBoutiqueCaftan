import { Injectable } from '@angular/core';
import { Observable, throwError, of, delay } from 'rxjs';
import { Categorie } from '../models/categorie.model';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private readonly STORAGE_KEY = 'local_categories';

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
      const defaultCategories: Categorie[] = [
        {
          id_categorie: 1,
          nom_categorie: 'Caftans',
          description: 'Collection de caftans traditionnels et modernes',
          ordre_affichage: 1
        },
        {
          id_categorie: 2,
          nom_categorie: 'Tekchitas',
          description: 'Tekchitas élégantes pour toutes les occasions',
          ordre_affichage: 2
        },
        {
          id_categorie: 3,
          nom_categorie: 'Sacs',
          description: 'Sacs à main et accessoires de mode',
          ordre_affichage: 3
        },
        {
          id_categorie: 4,
          nom_categorie: 'Talons',
          description: 'Chaussures à talons pour femmes',
          ordre_affichage: 4
        },
        {
          id_categorie: 5,
          nom_categorie: 'Accessoires',
          description: 'Accessoires de mode et bijoux',
          ordre_affichage: 5
        }
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultCategories));
    }
  }

  /**
   * Récupère toutes les catégories du stockage local
   */
  private getLocalCategories(): Categorie[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Sauvegarde les catégories dans le stockage local
   */
  private saveLocalCategories(categories: Categorie[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
  }

  /**
   * Génère un nouvel ID pour une catégorie
   */
  private getNextId(): number {
    const categories = this.getLocalCategories();
    if (categories.length === 0) return 1;
    return Math.max(...categories.map(c => c.id_categorie || 0)) + 1;
  }

  /**
   * Récupérer toutes les catégories (local)
   */
  getAllCategories(): Observable<Categorie[]> {
    const categories = this.getLocalCategories();
    // Trier par ordre_affichage si défini
    const sorted = [...categories].sort((a, b) => {
      const ordreA = a.ordre_affichage ?? 999;
      const ordreB = b.ordre_affichage ?? 999;
      return ordreA - ordreB;
    });
    return of(sorted).pipe(delay(300));
  }

  /**
   * Récupérer une catégorie par ID (local)
   */
  getCategorieById(id: number): Observable<Categorie> {
    const categories = this.getLocalCategories();
    const categorie = categories.find(c => c.id_categorie === id);
    
    if (!categorie) {
      return throwError(() => new Error(`Catégorie avec l'ID ${id} non trouvée`));
    }
    
    return of({ ...categorie }).pipe(delay(200));
  }

  /**
   * Créer une nouvelle catégorie (local)
   */
  createCategorie(categorie: Categorie): Observable<Categorie> {
    const categories = this.getLocalCategories();
    
    // Vérifier si le nom existe déjà (insensible à la casse)
    if (categories.some(c => c.nom_categorie.toUpperCase() === categorie.nom_categorie.toUpperCase())) {
      return throwError(() => new Error('Une catégorie avec ce nom existe déjà'));
    }
    
    // Créer la nouvelle catégorie
    const newCategorie: Categorie = {
      ...categorie,
      id_categorie: this.getNextId(),
      nom_categorie: categorie.nom_categorie.trim()
    };
    
    categories.push(newCategorie);
    this.saveLocalCategories(categories);
    
    return of({ ...newCategorie }).pipe(delay(300));
  }

  /**
   * Mettre à jour une catégorie (local)
   */
  updateCategorie(id: number, categorie: Categorie): Observable<Categorie> {
    const categories = this.getLocalCategories();
    const index = categories.findIndex(c => c.id_categorie === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Catégorie avec l'ID ${id} non trouvée`));
    }
    
    // Vérifier si le nom existe déjà pour une autre catégorie
    const existingCategorie = categories.find(c => c.nom_categorie.toUpperCase() === categorie.nom_categorie.toUpperCase() && c.id_categorie !== id);
    if (existingCategorie) {
      return throwError(() => new Error('Une catégorie avec ce nom existe déjà'));
    }
    
    // Mettre à jour la catégorie
    const updatedCategorie: Categorie = {
      ...categories[index],
      ...categorie,
      id_categorie: id, // S'assurer que l'ID ne change pas
      nom_categorie: categorie.nom_categorie.trim()
    };
    
    categories[index] = updatedCategorie;
    this.saveLocalCategories(categories);
    
    return of({ ...updatedCategorie }).pipe(delay(300));
  }

  /**
   * Supprimer une catégorie (local)
   */
  deleteCategorie(id: number): Observable<boolean> {
    const categories = this.getLocalCategories();
    const index = categories.findIndex(c => c.id_categorie === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Catégorie avec l'ID ${id} non trouvée`));
    }
    
    categories.splice(index, 1);
    this.saveLocalCategories(categories);
    
    return of(true).pipe(delay(300));
  }
}

