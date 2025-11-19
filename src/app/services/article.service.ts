import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Article } from '../models/article.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = environment.apiUrl || 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Récupère les options HTTP avec le token d'authentification
   */
  private getHttpOptions(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return { headers };
  }

  /**
   * Récupérer tous les articles
   */
  getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(
      `${this.apiUrl}/articles`,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Article[]>('getAllArticles', []))
    );
  }

  /**
   * Récupérer un article par ID
   */
  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(
      `${this.apiUrl}/articles/${id}`,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Article>('getArticleById'))
    );
  }

  /**
   * Créer un nouvel article
   */
  createArticle(article: Article): Observable<Article> {
    const payload = {
      NomArticle: article.nomArticle.trim(),
      Description: article.description.trim(),
      PrixLocationBase: article.prixLocationBase,
      PrixAvanceBase: article.prixAvanceBase,
      IdTaille: article.idTaille || undefined,
      Couleur: article.couleur || undefined,
      Photo: article.photo || undefined,
      IdCategorie: article.idCategorie,
      Actif: article.actif
    };

    return this.http.post<Article>(
      `${this.apiUrl}/articles`,
      payload,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Article>('createArticle'))
    );
  }

  /**
   * Mettre à jour un article
   */
  updateArticle(id: number, article: Article): Observable<Article> {
    const payload = {
      NomArticle: article.nomArticle.trim(),
      Description: article.description.trim(),
      PrixLocationBase: article.prixLocationBase,
      PrixAvanceBase: article.prixAvanceBase,
      IdTaille: article.idTaille || undefined,
      Couleur: article.couleur || undefined,
      Photo: article.photo || undefined,
      IdCategorie: article.idCategorie,
      Actif: article.actif
    };

    return this.http.put<Article>(
      `${this.apiUrl}/articles/${id}`,
      payload,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Article>('updateArticle'))
    );
  }

  /**
   * Supprimer un article
   */
  deleteArticle(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/articles/${id}`,
      this.getHttpOptions()
    ).pipe(
      map(() => true),
      catchError(this.handleError<boolean>('deleteArticle', false))
    );
  }

  /**
   * Basculer le statut actif/inactif d'un article
   */
  toggleActif(id: number, actif: boolean): Observable<boolean> {
    return this.http.patch<{ success: boolean }>(
      `${this.apiUrl}/articles/${id}/actif`,
      { actif },
      this.getHttpOptions()
    ).pipe(
      map(() => true),
      catchError(this.handleError<boolean>('toggleActif', false))
    );
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      if (!environment.production) {
        console.error(`${operation} failed:`, error);
      }
      
      const errorMessage = this.extractErrorMessage(error);
      return throwError(() => new Error(errorMessage));
    };
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return `Erreur: ${error.error.message}`;
    }

    const statusMessages: { [key: number]: string } = {
      401: 'Non autorisé. Veuillez vous reconnecter.',
      403: 'Accès interdit.',
      404: 'Ressource non trouvée.',
      500: 'Erreur serveur. Veuillez réessayer plus tard.'
    };

    if (error.status && statusMessages[error.status]) {
      return statusMessages[error.status];
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
      if (Array.isArray(error.error.errors)) {
        return error.error.errors.map((e: any) => e.message || e).join(', ');
      }
    }

    return 'Une erreur est survenue';
  }
}
