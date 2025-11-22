import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonMenuButton,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonItem,
  IonInput,
  IonList,
  IonBadge,
  LoadingController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  calendar,
  barChart,
  wallet,
  search,
  star,
  cube,
  trendingUp,
  grid,
  arrowDown,
  arrowUp,
  imageOutline,
  checkmarkCircle,
  closeCircle
} from 'ionicons/icons';
import { DashboardService } from '../services/dashboard.service';
import { PaiementService } from '../services/paiement.service';
import { CategorieService } from '../services/categorie.service';
import { TailleService } from '../services/taille.service';
import { Article } from '../models/article.model';
import { Categorie } from '../models/categorie.model';
import { Taille } from '../models/taille.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonMenuButton,
    IonSegment,
    IonSegmentButton,
    IonIcon,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  IonSpinner,
  IonItem,
  IonInput,
  IonList,
  IonBadge,
  CommonModule,
  FormsModule
  ],
})
export class DashboardPage implements OnInit {
  isLoading = true;
  selectedTab: 'revenus' | 'articles' | 'entrants' | 'sortants' = 'revenus';
  
  // Filtres pour les revenus
  filterType: 'jour' | 'periode' = 'jour';
  
  // Filtre par jour unique
  selectedDate: string = new Date().toISOString().slice(0, 10);
  
  // Filtre par période
  dateDebut: string = new Date().toISOString().slice(0, 10);
  dateFin: string = new Date().toISOString().slice(0, 10);
  
  // Résultats revenus
  revenus: number = 0;
  nombrePaiements: number = 0;
  
  // Meilleur jour de la semaine
  meilleurJour: { jour: string; moyenne: number } = {
    jour: 'N/A',
    moyenne: 0
  };
  
  // Articles les plus loués
  articlesPlusLoues: Array<{ article: Article; nombreLocations: number }> = [];
  
  // Article le plus rentable
  articlePlusRentable: { article: Article; revenus: number } = {
    article: { nomArticle: 'N/A', prixLocationBase: 0, prixAvanceBase: 0, description: '', idCategorie: 0, actif: true } as Article,
    revenus: 0
  };
  
  // Catégories et tailles pour l'affichage
  categories: Categorie[] = [];
  tailles: Taille[] = [];
  
  // Catégorie la plus demandée
  categoriePlusDemandee: { nomCategorie: string; nombreReservations: number } = {
    nomCategorie: 'N/A',
    nombreReservations: 0
  };

  // Filtres pour les articles entrants
  filterTypeEntrants: 'jour' | 'periode' = 'jour';
  selectedDateEntrants: string = new Date().toISOString().slice(0, 10);
  dateDebutEntrants: string = new Date().toISOString().slice(0, 10);
  dateFinEntrants: string = new Date().toISOString().slice(0, 10);
  
  // Filtres pour les articles sortants
  filterTypeSortants: 'jour' | 'periode' = 'jour';
  selectedDateSortants: string = new Date().toISOString().slice(0, 10);
  dateDebutSortants: string = new Date().toISOString().slice(0, 10);
  dateFinSortants: string = new Date().toISOString().slice(0, 10);
  
  // Mouvements d'articles
  articlesSortants: Array<{ article: { nomArticle: string; couleur?: string }; quantite: number; dateSortie: string }> = [];
  articlesEntrants: Array<{ article: { nomArticle: string; couleur?: string }; quantite: number; dateRetour: string }> = [];
  
  constructor(
    private dashboardService: DashboardService,
    private paiementService: PaiementService,
    private categorieService: CategorieService,
    private tailleService: TailleService,
    private loadingController: LoadingController
  ) {
    addIcons({
      calendar,
      barChart,
      wallet,
      search,
      star,
      cube,
      trendingUp,
      grid,
      arrowDown,
      arrowUp,
      imageOutline,
      checkmarkCircle,
      closeCircle
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadTailles();
    this.loadRevenus();
    this.loadMeilleurJour();
    this.loadArticlesPlusLoues();
    this.loadArticlePlusRentable();
    this.loadCategoriePlusDemandee();
  }
  
  loadCategories() {
    this.categorieService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des catégories:', error);
        }
      }
    });
  }
  
  loadTailles() {
    this.tailleService.getAllTailles().subscribe({
      next: (data) => {
        this.tailles = data;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des tailles:', error);
        }
      }
    });
  }
  
  getCategorieName(idCategorie?: number): string {
    if (!idCategorie) return 'N/A';
    const categorie = this.categories.find(c => c.idCategorie === idCategorie);
    return categorie ? categorie.nomCategorie : 'N/A';
  }
  
  getTailleLabel(idTaille?: number): string {
    if (!idTaille) return 'N/A';
    const taille = this.tailles.find(t => t.idTaille === idTaille);
    return taille ? taille.taille : 'N/A';
  }

  ionViewWillEnter() {
    this.loadRevenus();
    this.loadMeilleurJour();
    this.loadArticlesPlusLoues();
    this.loadArticlePlusRentable();
    this.loadCategoriePlusDemandee();
    if (this.selectedTab === 'entrants') {
      this.loadArticlesEntrants();
    } else if (this.selectedTab === 'sortants') {
      this.loadArticlesSortants();
    }
  }

  onTabChange(event: any) {
    const value = event.detail?.value;
    if (value === 'revenus' || value === 'articles' || value === 'entrants' || value === 'sortants') {
      this.selectedTab = value;
      if (value === 'entrants') {
        this.loadArticlesEntrants();
      } else if (value === 'sortants') {
        this.loadArticlesSortants();
      }
    }
  }

  onFilterTypeChange(event: any) {
    const value = event.detail?.value;
    if (value === 'jour' || value === 'periode') {
      this.filterType = value;
      this.loadRevenus();
    }
  }

  async loadRevenus() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Chargement des revenus...',
      duration: 1000
    });
    await loading.present();

    try {
      if (this.filterType === 'jour') {
        const date = new Date(this.selectedDate);
        this.dashboardService.getRevenusParDate(date).subscribe({
          next: (revenus) => {
            this.revenus = revenus;
            this.loadNombrePaiements();
          },
          error: (error) => {
            if (!environment.production) {
              console.error('Erreur lors du chargement des revenus:', error);
            }
            this.revenus = 0;
          },
          complete: () => {
            loading.dismiss();
            this.isLoading = false;
          }
        });
      } else {
        const debut = new Date(this.dateDebut);
        const fin = new Date(this.dateFin);
        this.dashboardService.getRevenusParPeriode(debut, fin).subscribe({
          next: (revenus) => {
            this.revenus = revenus;
            this.loadNombrePaiements();
          },
          error: (error) => {
            if (!environment.production) {
              console.error('Erreur lors du chargement des revenus:', error);
            }
            this.revenus = 0;
          },
          complete: () => {
            loading.dismiss();
            this.isLoading = false;
          }
        });
      }
    } catch (error) {
      await loading.dismiss();
      this.isLoading = false;
      if (!environment.production) {
        console.error('Erreur lors du chargement des revenus:', error);
      }
    }
  }

  private loadNombrePaiements() {
    this.paiementService.getAllPaiements().subscribe({
      next: (paiements) => {
        if (this.filterType === 'jour') {
          const dateRecherche = new Date(this.selectedDate);
          dateRecherche.setHours(0, 0, 0, 0);
          this.nombrePaiements = paiements.filter(p => {
            if (!p.datePaiement) return false;
            const datePaiement = new Date(p.datePaiement);
            datePaiement.setHours(0, 0, 0, 0);
            return datePaiement.getTime() === dateRecherche.getTime();
          }).length;
        } else {
          const dateDebut = new Date(this.dateDebut);
          dateDebut.setHours(0, 0, 0, 0);
          const dateFin = new Date(this.dateFin);
          dateFin.setHours(23, 59, 59, 999);
          this.nombrePaiements = paiements.filter(p => {
            if (!p.datePaiement) return false;
            const datePaiement = new Date(p.datePaiement);
            return datePaiement >= dateDebut && datePaiement <= dateFin;
          }).length;
        }
      }
    });
  }

  onDateChange() {
    this.loadRevenus();
  }

  onPeriodeChange() {
    if (this.dateDebut && this.dateFin) {
      const debut = new Date(this.dateDebut);
      const fin = new Date(this.dateFin);
      
      // Vérifier que la date de début est avant la date de fin
      if (debut > fin) {
        // Échanger les dates si nécessaire
        const temp = this.dateDebut;
        this.dateDebut = this.dateFin;
        this.dateFin = temp;
      }
      
      this.loadRevenus();
    }
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatDateShort(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  loadMeilleurJour() {
    this.dashboardService.getMeilleurJourSemaine().subscribe({
      next: (meilleurJour) => {
        this.meilleurJour = meilleurJour;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement du meilleur jour:', error);
        }
        this.meilleurJour = { jour: 'N/A', moyenne: 0 };
      }
    });
  }

  loadArticlesPlusLoues() {
    this.dashboardService.getArticlesPlusLoues(5).subscribe({
      next: (articles) => {
        this.articlesPlusLoues = articles;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des articles les plus loués:', error);
        }
        this.articlesPlusLoues = [];
      }
    });
  }

  loadArticlePlusRentable() {
    this.dashboardService.getArticlePlusRentable().subscribe({
      next: (article) => {
        this.articlePlusRentable = article;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement de l\'article le plus rentable:', error);
        }
        this.articlePlusRentable = { 
          article: { nomArticle: 'N/A', prixLocationBase: 0, prixAvanceBase: 0, description: '', idCategorie: 0, actif: true } as Article, 
          revenus: 0 
        };
      }
    });
  }

  loadCategoriePlusDemandee() {
    this.dashboardService.getCategoriePlusDemandee().subscribe({
      next: (categorie) => {
        this.categoriePlusDemandee = categorie;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement de la catégorie la plus demandée:', error);
        }
        this.categoriePlusDemandee = { nomCategorie: 'N/A', nombreReservations: 0 };
      }
    });
  }

  onFilterTypeEntrantsChange(event: any) {
    const value = event.detail?.value;
    if (value === 'jour' || value === 'periode') {
      this.filterTypeEntrants = value;
      this.loadArticlesEntrants();
    }
  }

  onFilterTypeSortantsChange(event: any) {
    const value = event.detail?.value;
    if (value === 'jour' || value === 'periode') {
      this.filterTypeSortants = value;
      this.loadArticlesSortants();
    }
  }

  loadArticlesEntrants() {
    let debut: Date;
    let fin: Date;

    if (this.filterTypeEntrants === 'jour') {
      if (!this.selectedDateEntrants) return;
      debut = new Date(this.selectedDateEntrants);
      debut.setHours(0, 0, 0, 0);
      fin = new Date(this.selectedDateEntrants);
      fin.setHours(23, 59, 59, 999);
    } else {
      if (!this.dateDebutEntrants || !this.dateFinEntrants) return;
      debut = new Date(this.dateDebutEntrants);
      debut.setHours(0, 0, 0, 0);
      fin = new Date(this.dateFinEntrants);
      fin.setHours(23, 59, 59, 999);
      
      // Vérifier que la date de début est avant la date de fin
      if (debut > fin) {
        const temp = this.dateDebutEntrants;
        this.dateDebutEntrants = this.dateFinEntrants;
        this.dateFinEntrants = temp;
        return;
      }
    }

    this.dashboardService.getMouvementsArticles(debut, fin).subscribe({
      next: (mouvements) => {
        this.articlesEntrants = mouvements.entrants.map(m => ({
          article: {
            nomArticle: m.article.nomArticle,
            couleur: m.article.couleur
          },
          quantite: m.quantite,
          dateRetour: m.dateRetour
        }));
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des articles entrants:', error);
        }
        this.articlesEntrants = [];
      }
    });
  }

  loadArticlesSortants() {
    let debut: Date;
    let fin: Date;

    if (this.filterTypeSortants === 'jour') {
      if (!this.selectedDateSortants) return;
      debut = new Date(this.selectedDateSortants);
      debut.setHours(0, 0, 0, 0);
      fin = new Date(this.selectedDateSortants);
      fin.setHours(23, 59, 59, 999);
    } else {
      if (!this.dateDebutSortants || !this.dateFinSortants) return;
      debut = new Date(this.dateDebutSortants);
      debut.setHours(0, 0, 0, 0);
      fin = new Date(this.dateFinSortants);
      fin.setHours(23, 59, 59, 999);
      
      // Vérifier que la date de début est avant la date de fin
      if (debut > fin) {
        const temp = this.dateDebutSortants;
        this.dateDebutSortants = this.dateFinSortants;
        this.dateFinSortants = temp;
        return;
      }
    }

    this.dashboardService.getMouvementsArticles(debut, fin).subscribe({
      next: (mouvements) => {
        this.articlesSortants = mouvements.sortants.map(m => ({
          article: {
            nomArticle: m.article.nomArticle,
            couleur: m.article.couleur
          },
          quantite: m.quantite,
          dateSortie: m.dateSortie
        }));
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des articles sortants:', error);
        }
        this.articlesSortants = [];
      }
    });
  }

  onEntrantsDateChange() {
    this.loadArticlesEntrants();
  }

  onEntrantsPeriodeChange() {
    this.loadArticlesEntrants();
  }

  onSortantsDateChange() {
    this.loadArticlesSortants();
  }

  onSortantsPeriodeChange() {
    this.loadArticlesSortants();
  }
}

