import { Injectable } from '@angular/core';
import { Observable, throwError, of, delay } from 'rxjs';
import { Article } from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private readonly STORAGE_KEY = 'local_articles';

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
      const defaultArticles: Article[] = [
        {
          id_article: 1,
          nom_article: 'Caftan Royal',
          description: 'Caftan traditionnel en soie avec broderies dorées, parfait pour les occasions spéciales',
          prix_location_base: 500.00,
          prix_avance_base: 200.00,
          idTaille: 'M',
          id_categorie: 1,
          actif: true
        },
        {
          id_article: 2,
          nom_article: 'Tekchita Moderne',
          description: 'Tekchita élégante avec motifs modernes, idéale pour les soirées',
          prix_location_base: 300.00,
          prix_avance_base: 150.00,
          idTaille: 'L',
          id_categorie: 2,
          actif: true
        },
        {
          id_article: 3,
          nom_article: 'Sac à Main Luxe',
          description: 'Sac à main en cuir véritable avec fermeture dorée',
          prix_location_base: 100.00,
          prix_avance_base: 50.00,
          id_categorie: 3,
          actif: true
        }
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultArticles));
    }
  }

  /**
   * Récupère tous les articles du stockage local
   */
  private getLocalArticles(): Article[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Sauvegarde les articles dans le stockage local
   */
  private saveLocalArticles(articles: Article[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));
  }

  /**
   * Génère un nouvel ID pour un article
   */
  private getNextId(): number {
    const articles = this.getLocalArticles();
    if (articles.length === 0) return 1;
    return Math.max(...articles.map(a => a.id_article || 0)) + 1;
  }

  /**
   * Récupérer tous les articles (local)
   */
  getAllArticles(): Observable<Article[]> {
    const articles = this.getLocalArticles();
    return of(articles).pipe(delay(300));
  }

  /**
   * Récupérer un article par ID (local)
   */
  getArticleById(id: number): Observable<Article> {
    const articles = this.getLocalArticles();
    const article = articles.find(a => a.id_article === id);
    
    if (!article) {
      return throwError(() => new Error(`Article avec l'ID ${id} non trouvé`));
    }
    
    return of({ ...article }).pipe(delay(200));
  }

  /**
   * Créer un nouvel article (local)
   */
  createArticle(article: Article): Observable<Article> {
    const articles = this.getLocalArticles();
    
    // Créer le nouvel article
    const newArticle: Article = {
      ...article,
      id_article: this.getNextId()
    };
    
    articles.push(newArticle);
    this.saveLocalArticles(articles);
    
    return of({ ...newArticle }).pipe(delay(300));
  }

  /**
   * Mettre à jour un article (local)
   */
  updateArticle(id: number, article: Article): Observable<Article> {
    const articles = this.getLocalArticles();
    const index = articles.findIndex(a => a.id_article === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Article avec l'ID ${id} non trouvé`));
    }
    
    // Mettre à jour l'article
    const updatedArticle: Article = {
      ...articles[index],
      ...article,
      id_article: id // S'assurer que l'ID ne change pas
    };
    
    articles[index] = updatedArticle;
    this.saveLocalArticles(articles);
    
    return of({ ...updatedArticle }).pipe(delay(300));
  }

  /**
   * Supprimer un article (local)
   */
  deleteArticle(id: number): Observable<boolean> {
    const articles = this.getLocalArticles();
    const index = articles.findIndex(a => a.id_article === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Article avec l'ID ${id} non trouvé`));
    }
    
    articles.splice(index, 1);
    this.saveLocalArticles(articles);
    
    return of(true).pipe(delay(300));
  }

  /**
   * Basculer le statut actif/inactif d'un article (local)
   */
  toggleActif(id: number): Observable<Article> {
    const articles = this.getLocalArticles();
    const index = articles.findIndex(a => a.id_article === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Article avec l'ID ${id} non trouvé`));
    }
    
    articles[index].actif = !articles[index].actif;
    this.saveLocalArticles(articles);
    
    return of({ ...articles[index] }).pipe(delay(300));
  }
}

