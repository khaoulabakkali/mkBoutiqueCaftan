import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { PaiementService } from './paiement.service';
import { ReservationService } from './reservation.service';
import { ArticleService } from './article.service';
import { CategorieService } from './categorie.service';
import { Paiement } from '../models/paiement.model';
import { Reservation } from '../models/reservation.model';
import { Article } from '../models/article.model';
import { Categorie } from '../models/categorie.model';

export interface StatistiquesFinancieres {
  revenusJour: number;
  revenusMois: number;
  previsionsMois: number;
  meilleurJour: {
    jour: string;
    moyenne: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl || 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private paiementService: PaiementService,
    private reservationService: ReservationService,
    private articleService: ArticleService,
    private categorieService: CategorieService
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
   * Calcule les revenus du jour à partir des paiements
   */
  getRevenusJour(): Observable<number> {
    return this.paiementService.getAllPaiements().pipe(
      map(paiements => {
        const aujourdhui = new Date();
        aujourdhui.setHours(0, 0, 0, 0);
        
        const revenus = paiements
          .filter(p => {
            if (!p.datePaiement) return false;
            const datePaiement = new Date(p.datePaiement);
            datePaiement.setHours(0, 0, 0, 0);
            return datePaiement.getTime() === aujourdhui.getTime();
          })
          .reduce((sum, p) => sum + (p.montant || 0), 0);
        
        return revenus;
      }),
      catchError(this.handleError<number>('getRevenusJour', 0))
    );
  }

  /**
   * Calcule les revenus du mois en cours
   */
  getRevenusMois(): Observable<number> {
    return this.paiementService.getAllPaiements().pipe(
      map(paiements => {
        const maintenant = new Date();
        const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
        
        const revenus = paiements
          .filter(p => {
            if (!p.datePaiement) return false;
            const datePaiement = new Date(p.datePaiement);
            return datePaiement >= debutMois && datePaiement <= maintenant;
          })
          .reduce((sum, p) => sum + (p.montant || 0), 0);
        
        return revenus;
      }),
      catchError(this.handleError<number>('getRevenusMois', 0))
    );
  }

  /**
   * Calcule les prévisions de revenus pour la fin du mois
   */
  getPrevisionsMois(): Observable<number> {
    return this.paiementService.getAllPaiements().pipe(
      map(paiements => {
        const maintenant = new Date();
        const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
        const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0);
        
        // Revenus actuels du mois
        const revenusActuels = paiements
          .filter(p => {
            if (!p.datePaiement) return false;
            const datePaiement = new Date(p.datePaiement);
            return datePaiement >= debutMois && datePaiement <= maintenant;
          })
          .reduce((sum, p) => sum + (p.montant || 0), 0);
        
        // Nombre de jours écoulés
        const joursEcoules = maintenant.getDate();
        // Nombre total de jours dans le mois
        const joursTotal = finMois.getDate();
        
        // Moyenne quotidienne
        const moyenneQuotidienne = joursEcoules > 0 ? revenusActuels / joursEcoules : 0;
        
        // Prévision
        const previsions = revenusActuels + (moyenneQuotidienne * (joursTotal - joursEcoules));
        
        return Math.round(previsions);
      }),
      catchError(this.handleError<number>('getPrevisionsMois', 0))
    );
  }

  /**
   * Trouve le meilleur jour de la semaine
   */
  getMeilleurJourSemaine(): Observable<{ jour: string; moyenne: number }> {
    return this.paiementService.getAllPaiements().pipe(
      map(paiements => {
        const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const revenusParJour: { [key: number]: { total: number; count: number } } = {};
        
        // Initialiser les compteurs pour chaque jour
        joursSemaine.forEach((_, index) => {
          revenusParJour[index] = { total: 0, count: 0 };
        });
        
        // Calculer les revenus par jour de la semaine
        paiements.forEach(p => {
          if (p.datePaiement) {
            const datePaiement = new Date(p.datePaiement);
            const jourSemaine = datePaiement.getDay();
            if (revenusParJour[jourSemaine]) {
              revenusParJour[jourSemaine].total += p.montant || 0;
              revenusParJour[jourSemaine].count += 1;
            }
          }
        });
        
        // Trouver le jour avec la plus forte moyenne
        let meilleurJour = 0;
        let meilleureMoyenne = 0;
        
        Object.keys(revenusParJour).forEach(key => {
          const index = parseInt(key, 10);
          const moyenne = revenusParJour[index].count > 0 
            ? revenusParJour[index].total / revenusParJour[index].count 
            : 0;
          
          if (moyenne > meilleureMoyenne) {
            meilleureMoyenne = moyenne;
            meilleurJour = index;
          }
        });
        
        return {
          jour: joursSemaine[meilleurJour],
          moyenne: Math.round(meilleureMoyenne)
        };
      }),
      catchError(this.handleError<{ jour: string; moyenne: number }>('getMeilleurJourSemaine', { jour: 'N/A', moyenne: 0 }))
    );
  }

  /**
   * Calcule les revenus pour une date spécifique
   */
  getRevenusParDate(date: Date): Observable<number> {
    return this.paiementService.getAllPaiements().pipe(
      map(paiements => {
        const dateRecherche = new Date(date);
        dateRecherche.setHours(0, 0, 0, 0);
        
        const revenus = paiements
          .filter(p => {
            if (!p.datePaiement) return false;
            const datePaiement = new Date(p.datePaiement);
            datePaiement.setHours(0, 0, 0, 0);
            return datePaiement.getTime() === dateRecherche.getTime();
          })
          .reduce((sum, p) => sum + (p.montant || 0), 0);
        
        return revenus;
      }),
      catchError(this.handleError<number>('getRevenusParDate', 0))
    );
  }

  /**
   * Calcule les revenus pour une période (date début et date fin)
   */
  getRevenusParPeriode(dateDebut: Date, dateFin: Date): Observable<number> {
    return this.paiementService.getAllPaiements().pipe(
      map(paiements => {
        const debut = new Date(dateDebut);
        debut.setHours(0, 0, 0, 0);
        
        const fin = new Date(dateFin);
        fin.setHours(23, 59, 59, 999);
        
        const revenus = paiements
          .filter(p => {
            if (!p.datePaiement) return false;
            const datePaiement = new Date(p.datePaiement);
            return datePaiement >= debut && datePaiement <= fin;
          })
          .reduce((sum, p) => sum + (p.montant || 0), 0);
        
        return revenus;
      }),
      catchError(this.handleError<number>('getRevenusParPeriode', 0))
    );
  }

  /**
   * Récupère toutes les statistiques financières
   */
  getStatistiquesFinancieres(): Observable<StatistiquesFinancieres> {
    return this.paiementService.getAllPaiements().pipe(
      map(paiements => {
        const maintenant = new Date();
        const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
        const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0);
        const aujourdhui = new Date();
        aujourdhui.setHours(0, 0, 0, 0);
        
        // Revenus du jour
        const revenusJour = paiements
          .filter(p => {
            if (!p.datePaiement) return false;
            const datePaiement = new Date(p.datePaiement);
            datePaiement.setHours(0, 0, 0, 0);
            return datePaiement.getTime() === aujourdhui.getTime();
          })
          .reduce((sum, p) => sum + (p.montant || 0), 0);
        
        // Revenus du mois
        const revenusMois = paiements
          .filter(p => {
            if (!p.datePaiement) return false;
            const datePaiement = new Date(p.datePaiement);
            return datePaiement >= debutMois && datePaiement <= maintenant;
          })
          .reduce((sum, p) => sum + (p.montant || 0), 0);
        
        // Prévisions
        const joursEcoules = maintenant.getDate();
        const joursTotal = finMois.getDate();
        const moyenneQuotidienne = joursEcoules > 0 ? revenusMois / joursEcoules : 0;
        const previsionsMois = Math.round(revenusMois + (moyenneQuotidienne * (joursTotal - joursEcoules)));
        
        // Meilleur jour
        const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const revenusParJour: { [key: number]: { total: number; count: number } } = {};
        
        joursSemaine.forEach((_, index) => {
          revenusParJour[index] = { total: 0, count: 0 };
        });
        
        paiements.forEach(p => {
          if (p.datePaiement) {
            const datePaiement = new Date(p.datePaiement);
            const jourSemaine = datePaiement.getDay();
            if (revenusParJour[jourSemaine]) {
              revenusParJour[jourSemaine].total += p.montant || 0;
              revenusParJour[jourSemaine].count += 1;
            }
          }
        });
        
        let meilleurJour = 0;
        let meilleureMoyenne = 0;
        
        Object.keys(revenusParJour).forEach(key => {
          const index = parseInt(key, 10);
          const moyenne = revenusParJour[index].count > 0 
            ? revenusParJour[index].total / revenusParJour[index].count 
            : 0;
          
          if (moyenne > meilleureMoyenne) {
            meilleureMoyenne = moyenne;
            meilleurJour = index;
          }
        });
        
        return {
          revenusJour,
          revenusMois,
          previsionsMois,
          meilleurJour: {
            jour: joursSemaine[meilleurJour],
            moyenne: Math.round(meilleureMoyenne)
          }
        };
      }),
      catchError(this.handleError<StatistiquesFinancieres>('getStatistiquesFinancieres', {
        revenusJour: 0,
        revenusMois: 0,
        previsionsMois: 0,
        meilleurJour: { jour: 'N/A', moyenne: 0 }
      }))
    );
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      if (!environment.production) {
        console.error(`${operation} failed:`, error);
      }
      
      const errorMessage = this.extractErrorMessage(error);
      return throwError(() => new Error(errorMessage));
    };
  }

  private extractErrorMessage(error: any): string {
    if (error.error instanceof ErrorEvent) {
      return `Erreur: ${error.error.message}`;
    }

    if (error.status) {
      const statusMessages: { [key: number]: string } = {
        401: 'Non autorisé. Veuillez vous reconnecter.',
        403: 'Accès interdit.',
        404: 'Ressource non trouvée.',
        500: 'Erreur serveur. Veuillez réessayer plus tard.'
      };

      if (statusMessages[error.status]) {
        return statusMessages[error.status];
      }
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

    return 'Une erreur est survenue';
  }

  /**
   * Récupère les articles les plus loués
   */
  getArticlesPlusLoues(limit: number = 5): Observable<Array<{ article: Article; nombreLocations: number }>> {
    return forkJoin({
      reservations: this.reservationService.getAllReservations(),
      articles: this.articleService.getAllArticles()
    }).pipe(
      map(({ reservations, articles }) => {
        // Compter les locations par article
        const locationsParArticle: { [key: number]: number } = {};
        
        reservations.forEach(reservation => {
          if (reservation.articles && reservation.articles.length > 0) {
            reservation.articles.forEach(resArticle => {
              const articleId = resArticle.idArticle;
              const quantite = resArticle.quantite || 1;
              
              if (!locationsParArticle[articleId]) {
                locationsParArticle[articleId] = 0;
              }
              locationsParArticle[articleId] += quantite;
            });
          }
        });

        // Créer le tableau avec les articles et leurs nombres de locations
        const result = Object.keys(locationsParArticle).map(articleIdStr => {
          const articleId = parseInt(articleIdStr, 10);
          const article = articles.find(a => a.idArticle === articleId);
          return {
            article: article || { nomArticle: `Article #${articleId}`, prixLocationBase: 0, prixAvanceBase: 0, description: '', idCategorie: 0, actif: true } as Article,
            nombreLocations: locationsParArticle[articleId]
          };
        });

        // Trier par nombre de locations décroissant et prendre les premiers
        return result
          .sort((a, b) => b.nombreLocations - a.nombreLocations)
          .slice(0, limit);
      }),
      catchError(this.handleError<Array<{ article: Article; nombreLocations: number }>>('getArticlesPlusLoues', []))
    );
  }

  /**
   * Récupère l'article le plus rentable du mois
   */
  getArticlePlusRentable(): Observable<{ article: Article; revenus: number }> {
    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    
    return forkJoin({
      reservations: this.reservationService.getAllReservations(),
      articles: this.articleService.getAllArticles(),
      paiements: this.paiementService.getAllPaiements()
    }).pipe(
      map(({ reservations, articles, paiements }) => {
        // Filtrer les paiements du mois
        const paiementsMois = paiements.filter(p => {
          if (!p.datePaiement) return false;
          const datePaiement = new Date(p.datePaiement);
          return datePaiement >= debutMois && datePaiement <= maintenant;
        });

        // Créer un map des paiements par réservation
        const paiementsParReservation: { [key: number]: number } = {};
        paiementsMois.forEach(p => {
          if (p.idReservation) {
            paiementsParReservation[p.idReservation] = (paiementsParReservation[p.idReservation] || 0) + (p.montant || 0);
          }
        });

        // Calculer les revenus par article
        const revenusParArticle: { [key: number]: number } = {};
        
        reservations.forEach(reservation => {
          if (reservation.articles && reservation.articles.length > 0) {
            const montantReservation = paiementsParReservation[reservation.idReservation || 0] || reservation.montantTotal || 0;
            const totalQuantite = reservation.articles.reduce((sum, art) => sum + (art.quantite || 1), 0);
            const prixUnitaire = totalQuantite > 0 ? montantReservation / totalQuantite : 0;

            reservation.articles.forEach(resArticle => {
              const articleId = resArticle.idArticle;
              const quantite = resArticle.quantite || 1;
              const revenuArticle = prixUnitaire * quantite;
              
              if (!revenusParArticle[articleId]) {
                revenusParArticle[articleId] = 0;
              }
              revenusParArticle[articleId] += revenuArticle;
            });
          }
        });

        // Trouver l'article le plus rentable
        let articlePlusRentableId = 0;
        let revenusMax = 0;

        Object.keys(revenusParArticle).forEach(articleIdStr => {
          const articleId = parseInt(articleIdStr, 10);
          const revenus = revenusParArticle[articleId];
          if (revenus > revenusMax) {
            revenusMax = revenus;
            articlePlusRentableId = articleId;
          }
        });

        const article = articles.find(a => a.idArticle === articlePlusRentableId);
        
        return {
          article: article || { nomArticle: 'N/A', prixLocationBase: 0, prixAvanceBase: 0, description: '', idCategorie: 0, actif: true } as Article,
          revenus: Math.round(revenusMax)
        };
      }),
      catchError(this.handleError<{ article: Article; revenus: number }>('getArticlePlusRentable', {
        article: { nomArticle: 'N/A', prixLocationBase: 0, prixAvanceBase: 0, description: '', idCategorie: 0, actif: true } as Article,
        revenus: 0
      }))
    );
  }

  /**
   * Récupère la catégorie la plus demandée
   */
  getCategoriePlusDemandee(): Observable<{ nomCategorie: string; nombreReservations: number }> {
    return forkJoin({
      reservations: this.reservationService.getAllReservations(),
      articles: this.articleService.getAllArticles(),
      categories: this.categorieService.getAllCategories()
    }).pipe(
      map(({ reservations, articles, categories }) => {
        // Compter les réservations par catégorie
        const reservationsParCategorie: { [key: number]: number } = {};
        
        reservations.forEach(reservation => {
          if (reservation.articles && reservation.articles.length > 0) {
            reservation.articles.forEach(resArticle => {
              const article = articles.find(a => a.idArticle === resArticle.idArticle);
              if (article && article.idCategorie) {
                if (!reservationsParCategorie[article.idCategorie]) {
                  reservationsParCategorie[article.idCategorie] = 0;
                }
                reservationsParCategorie[article.idCategorie]++;
              }
            });
          }
        });

        // Trouver la catégorie la plus demandée
        let categorieIdMax = 0;
        let nombreMax = 0;

        Object.keys(reservationsParCategorie).forEach(categorieIdStr => {
          const categorieId = parseInt(categorieIdStr, 10);
          const nombre = reservationsParCategorie[categorieId];
          if (nombre > nombreMax) {
            nombreMax = nombre;
            categorieIdMax = categorieId;
          }
        });

        // Récupérer le nom de la catégorie
        const categorie = categories.find(c => c.idCategorie === categorieIdMax);
        const nomCategorie = categorie?.nomCategorie || `Catégorie #${categorieIdMax}`;

        return {
          nomCategorie,
          nombreReservations: nombreMax
        };
      }),
      catchError(this.handleError<{ nomCategorie: string; nombreReservations: number }>('getCategoriePlusDemandee', {
        nomCategorie: 'N/A',
        nombreReservations: 0
      }))
    );
  }

  /**
   * Récupère les articles entrants et sortants pour une période
   */
  getMouvementsArticles(dateDebut: Date, dateFin: Date): Observable<{
    sortants: Array<{ article: Article; quantite: number; dateSortie: string; reservationId?: number }>;
    entrants: Array<{ article: Article; quantite: number; dateRetour: string; reservationId?: number }>;
  }> {
    return forkJoin({
      reservations: this.reservationService.getAllReservations(),
      articles: this.articleService.getAllArticles()
    }).pipe(
      map(({ reservations, articles }) => {
        const debut = new Date(dateDebut);
        debut.setHours(0, 0, 0, 0);
        
        const fin = new Date(dateFin);
        fin.setHours(23, 59, 59, 999);

        const sortants: Array<{ article: Article; quantite: number; dateSortie: string; reservationId?: number }> = [];
        const entrants: Array<{ article: Article; quantite: number; dateRetour: string; reservationId?: number }> = [];

        reservations.forEach(reservation => {
          if (!reservation.articles || reservation.articles.length === 0) return;

          const dateDebutReservation = new Date(reservation.dateDebut);
          dateDebutReservation.setHours(0, 0, 0, 0);
          
          const dateFinReservation = new Date(reservation.dateFin);
          dateFinReservation.setHours(0, 0, 0, 0);

          // Articles sortants (dateDebut dans la période)
          if (dateDebutReservation >= debut && dateDebutReservation <= fin) {
            reservation.articles.forEach(resArticle => {
              const article = articles.find(a => a.idArticle === resArticle.idArticle);
              if (article) {
                sortants.push({
                  article,
                  quantite: resArticle.quantite || 1,
                  dateSortie: reservation.dateDebut,
                  reservationId: reservation.idReservation
                });
              }
            });
          }

          // Articles entrants (dateFin dans la période)
          if (dateFinReservation >= debut && dateFinReservation <= fin) {
            reservation.articles.forEach(resArticle => {
              const article = articles.find(a => a.idArticle === resArticle.idArticle);
              if (article) {
                entrants.push({
                  article,
                  quantite: resArticle.quantite || 1,
                  dateRetour: reservation.dateFin,
                  reservationId: reservation.idReservation
                });
              }
            });
          }
        });

        return { sortants, entrants };
      }),
      catchError(this.handleError<{
        sortants: Array<{ article: Article; quantite: number; dateSortie: string; reservationId?: number }>;
        entrants: Array<{ article: Article; quantite: number; dateRetour: string; reservationId?: number }>;
      }>('getMouvementsArticles', { sortants: [], entrants: [] }))
    );
  }
}

