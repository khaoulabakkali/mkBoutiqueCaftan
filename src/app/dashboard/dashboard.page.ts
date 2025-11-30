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
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { TranslateModule } from '@ngx-translate/core';
Chart.register(...registerables, annotationPlugin);

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
  FormsModule,
  TranslateModule
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

  // Graphique de progression
  chartType: 'jour' | 'semaine' | 'mois' | 'annee' = 'mois';
  chartData: ChartData<'line'> | null = null;
  chartOptions: ChartConfiguration<'line'>['options'] | null = null;
  chart: Chart | null = null;
  
  // Filtre unique pour le graphique (utilisé pour tous les types)
  selectedDateChart: string = new Date().toISOString().slice(0, 10); // Format: "YYYY-MM-DD"
  
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
  articlesSortants: Array<{ article: { nomArticle: string; couleur?: string; photo?: string }; quantite: number; dateSortie: string }> = [];
  articlesEntrants: Array<{ article: { nomArticle: string; couleur?: string; photo?: string }; quantite: number; dateRetour: string }> = [];
  
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
    // Initialiser le graphique après un court délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
      this.loadChartData();
    }, 500);
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
    } else if (this.selectedTab === 'revenus') {
      // Recharger le graphique quand on revient sur l'onglet revenus
      setTimeout(() => {
        this.loadChartData();
      }, 300);
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
      } else if (value === 'revenus') {
        // Charger le graphique quand on sélectionne l'onglet revenus
        setTimeout(() => {
          this.loadChartData();
        }, 300);
      }
    }
  }

  onFilterTypeChange(event: any) {
    const value = event.detail?.value;
a    if (value === 'jour' || value === 'periode') {
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
            couleur: m.article.couleur,
            photo: m.article.photo
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
            couleur: m.article.couleur,
            photo: m.article.photo
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

  /**
   * Change le type de graphique (jour, semaine, mois, année)
   */
  onChartTypeChange(event: any) {
    const value = event.detail?.value;
    if (value === 'jour' || value === 'semaine' || value === 'mois' || value === 'annee') {
      this.chartType = value;
      this.loadChartData();
    }
  }

  /**
   * Charge les données pour le graphique de progression
   */
  loadChartData() {
    this.paiementService.getAllPaiements().subscribe({
      next: (paiements) => {
        let labels: string[] = [];
        let data: number[] = [];

        if (!environment.production) {
          console.log('Type de graphique sélectionné:', this.chartType);
        }

        if (this.chartType === 'jour') {
          const result = this.calculateDailyData(paiements);
          labels = result.labels;
          data = result.data;
          if (!environment.production) {
            console.log('Données par jour calculées:', { labels, data });
          }
        } else if (this.chartType === 'semaine') {
          const result = this.calculateWeeklyData(paiements);
          labels = result.labels;
          data = result.data;
        } else if (this.chartType === 'mois') {
          const result = this.calculateMonthlyData(paiements);
          labels = result.labels;
          data = result.data;
        } else if (this.chartType === 'annee') {
          const result = this.calculateYearlyData(paiements);
          labels = result.labels;
          data = result.data;
        }

        if (labels.length > 0 && data.length > 0) {
          this.createChart(labels, data);
        } else {
          if (!environment.production) {
            console.warn('Aucune donnée à afficher pour le graphique');
          }
        }
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des données du graphique:', error);
        }
      }
    });
  }

  /**
   * Gère le changement de date sélectionnée pour le graphique (utilisé pour tous les types)
   */
  onChartDateChange(event: any) {
    const value = event.detail?.value;
    if (value) {
      this.selectedDateChart = value;
      this.loadChartData();
    }
  }

  /**
   * Calcule les données par jour
   */
  private calculateDailyData(paiements: any[]): { labels: string[]; data: number[] } {
    const jours: { [key: string]: number } = {};
    const labels: string[] = [];
    let dateReference: Date;
    
    // Utiliser la date sélectionnée comme référence
    if (this.selectedDateChart) {
      dateReference = new Date(this.selectedDateChart);
    } else {
      dateReference = new Date();
    }
    
    // S'assurer que la date de référence est valide
    if (isNaN(dateReference.getTime())) {
      dateReference = new Date();
    }
    
    // Calculer les 30 derniers jours à partir de la date de référence
    for (let i = 29; i >= 0; i--) {
      const date = new Date(dateReference);
      date.setDate(date.getDate() - i);
      const jourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      jours[jourKey] = 0;
      labels.push(`${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`);
    }

    // Agréger les paiements par jour
    paiements.forEach(paiement => {
      if (!paiement.datePaiement) return;
      const datePaiement = new Date(paiement.datePaiement);
      
      // Vérifier que la date est valide
      if (isNaN(datePaiement.getTime())) return;
      
      const jourKey = `${datePaiement.getFullYear()}-${String(datePaiement.getMonth() + 1).padStart(2, '0')}-${String(datePaiement.getDate()).padStart(2, '0')}`;
      
      if (jours[jourKey] !== undefined) {
        jours[jourKey] += paiement.montant || 0;
      }
    });

    const data = Object.values(jours);
    
    if (!environment.production) {
      console.log('Résultat calculateDailyData:', { labels, data, jours });
    }
    
    return { labels, data };
  }

  /**
   * Calcule les données par semaine
   */
  private calculateWeeklyData(paiements: any[]): { labels: string[]; data: number[] } {
    const semaines: { [key: string]: number } = {};
    const labels: string[] = [];
    let dateReference: Date;
    
    // Utiliser la date sélectionnée comme référence
    if (this.selectedDateChart) {
      dateReference = new Date(this.selectedDateChart);
    } else {
      dateReference = new Date();
    }
    
    // S'assurer que la date de référence est valide
    if (isNaN(dateReference.getTime())) {
      dateReference = new Date();
    }
    
    // Trouver le début de la semaine de la date sélectionnée (dimanche)
    const semaineDebutReference = new Date(dateReference);
    semaineDebutReference.setDate(semaineDebutReference.getDate() - semaineDebutReference.getDay());
    
    // Calculer les 12 dernières semaines à partir de la semaine de la date de référence
    for (let i = 11; i >= 0; i--) {
      const date = new Date(semaineDebutReference);
      date.setDate(date.getDate() - (i * 7));
      const semaineDebut = new Date(date);
      semaineDebut.setDate(semaineDebut.getDate() - semaineDebut.getDay()); // Début de semaine (dimanche)
      
      const semaineKey = this.getWeekKey(semaineDebut);
      semaines[semaineKey] = 0;
      const semaineNum = this.getWeekNumber(semaineDebut);
      labels.push(`S${semaineNum} ${semaineDebut.getFullYear()}`);
    }

    // Agréger les paiements par semaine
    paiements.forEach(paiement => {
      if (!paiement.datePaiement) return;
      const datePaiement = new Date(paiement.datePaiement);
      const semaineDebut = new Date(datePaiement);
      semaineDebut.setDate(semaineDebut.getDate() - semaineDebut.getDay());
      const semaineKey = this.getWeekKey(semaineDebut);
      
      if (semaines[semaineKey] !== undefined) {
        semaines[semaineKey] += paiement.montant || 0;
      }
    });

    const data = Object.values(semaines);
    return { labels, data };
  }

  /**
   * Calcule les données par mois
   */
  private calculateMonthlyData(paiements: any[]): { labels: string[]; data: number[] } {
    const mois: { [key: string]: number } = {};
    const labels: string[] = [];
    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    let dateReference: Date;
    // Utiliser la date sélectionnée comme référence
    if (this.selectedDateChart) {
      dateReference = new Date(this.selectedDateChart);
    } else {
      dateReference = new Date();
    }
    
    // S'assurer que la date de référence est valide
    if (isNaN(dateReference.getTime())) {
      dateReference = new Date();
    }
    
    // Utiliser le mois de la date sélectionnée comme référence
    const moisReference = new Date(dateReference.getFullYear(), dateReference.getMonth(), 1);
    
    // Calculer les 12 derniers mois à partir du mois de la date de référence
    for (let i = 11; i >= 0; i--) {
      const date = new Date(moisReference.getFullYear(), moisReference.getMonth() - i, 1);
      const moisKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      mois[moisKey] = 0;
      labels.push(`${moisNoms[date.getMonth()]} ${date.getFullYear()}`);
    }

    // Agréger les paiements par mois
    paiements.forEach(paiement => {
      if (!paiement.datePaiement) return;
      const datePaiement = new Date(paiement.datePaiement);
      const moisKey = `${datePaiement.getFullYear()}-${String(datePaiement.getMonth() + 1).padStart(2, '0')}`;
      
      if (mois[moisKey] !== undefined) {
        mois[moisKey] += paiement.montant || 0;
      }
    });

    const data = Object.values(mois);
    return { labels, data };
  }

  /**
   * Calcule les données par année
   */
  private calculateYearlyData(paiements: any[]): { labels: string[]; data: number[] } {
    const annees: { [key: number]: number } = {};
    const labels: string[] = [];
    
    let anneeReference: number;
    // Utiliser l'année de la date sélectionnée comme référence
    if (this.selectedDateChart) {
      const dateReference = new Date(this.selectedDateChart);
      if (!isNaN(dateReference.getTime())) {
        anneeReference = dateReference.getFullYear();
      } else {
        anneeReference = new Date().getFullYear();
      }
    } else {
      anneeReference = new Date().getFullYear();
    }
    
    // Calculer les 5 dernières années à partir de l'année de référence
    for (let i = 4; i >= 0; i--) {
      const annee = anneeReference - i;
      annees[annee] = 0;
      labels.push(annee.toString());
    }

    // Agréger les paiements par année
    paiements.forEach(paiement => {
      if (!paiement.datePaiement) return;
      const datePaiement = new Date(paiement.datePaiement);
      const annee = datePaiement.getFullYear();
      
      if (annees[annee] !== undefined) {
        annees[annee] += paiement.montant || 0;
      }
    });

    const data = Object.values(annees);
    return { labels, data };
  }

  /**
   * Crée le graphique Chart.js
   */
  private createChart(labels: string[], data: number[]) {
    // Détruire le graphique existant s'il existe
    if (this.chart) {
      this.chart.destroy();
    }

    const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!canvas) {
      // Réessayer après un court délai si le canvas n'est pas encore disponible
      setTimeout(() => this.createChart(labels, data), 100);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculer la variation pour l'annotation
    const dernierValeur = data[data.length - 1];
    const avantDernierValeur = data.length > 1 ? data[data.length - 2] : dernierValeur;
    const variation = avantDernierValeur > 0 
      ? ((dernierValeur - avantDernierValeur) / avantDernierValeur) * 100 
      : 0;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Chiffre d\'affaires (MAD)',
          data: data,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: (context) => {
            // Mettre en évidence le dernier point
            return context.dataIndex === data.length - 1 ? 7 : 5;
          },
          pointHoverRadius: 8,
          pointBackgroundColor: (context) => {
            // Mettre en évidence le dernier point en rouge
            return context.dataIndex === data.length - 1 ? 'rgb(239, 68, 68)' : 'rgb(99, 102, 241)';
          },
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `${context.dataset.label}: ${this.formatMontant(value !== null && value !== undefined ? value : 0)}`;
              }
            }
          },
          annotation: {
            annotations: {
              point1: {
                type: 'point',
                xValue: labels[labels.length - 1],
                yValue: dernierValeur,
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 2,
                radius: 6
              },
              label1: {
                type: 'label',
                xValue: labels[labels.length - 1],
                yValue: dernierValeur,
                content: `↑ ${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%`,
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                color: '#fff',
                font: {
                  size: 12,
                  weight: 'bold'
                },
                padding: 8,
                textAlign: 'center',
                adjustScaleRange: true,
                position: 'end'
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
                return this.formatMontant(numValue);
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }

  /**
   * Utilitaires pour les calculs de semaines
   */
  private getWeekKey(date: Date): string {
    const annee = date.getFullYear();
    const semaine = this.getWeekNumber(date);
    return `${annee}-W${semaine}`;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + (4 - dayNum));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}

