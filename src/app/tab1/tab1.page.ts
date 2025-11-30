import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonMenuButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonSpinner,
  LoadingController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  people,
  person,
  cube,
  calendar,
  wallet,
  statsChart,
  trendingUp,
  checkmarkCircle,
  timeOutline,
  arrowUp,
  arrowDown,
  flag
} from 'ionicons/icons';
import { UtilisateurService } from '../services/utilisateur.service';
import { ClientService } from '../services/client.service';
import { ArticleService } from '../services/article.service';
import { ReservationService } from '../services/reservation.service';
import { PaiementService } from '../services/paiement.service';
import { DashboardService } from '../services/dashboard.service';
import { environment } from '../../environments/environment';

interface Statistiques {
  totalUtilisateurs: number;
  totalClients: number;
  totalArticles: number;
  totalReservations: number;
  totalPaiements: number;
  reservationsEnAttente: number;
  reservationsConfirmees: number;
  reservationsTerminees: number;
  articlesActifs: number;
  nombreArticlesEntrantsAujourdhui: number;
  nombreArticlesSortantsAujourdhui: number;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonMenuButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonSpinner,
    CommonModule
  ],
})
export class Tab1Page implements OnInit {
  statistiques: Statistiques = {
    totalUtilisateurs: 0,
    totalClients: 0,
    totalArticles: 0,
    totalReservations: 0,
    totalPaiements: 0,
    reservationsEnAttente: 0,
    reservationsConfirmees: 0,
    reservationsTerminees: 0,
    articlesActifs: 0,
    nombreArticlesEntrantsAujourdhui: 0,
    nombreArticlesSortantsAujourdhui: 0
  };
  isLoading = true;

  constructor(
    private utilisateurService: UtilisateurService,
    private clientService: ClientService,
    private articleService: ArticleService,
    private reservationService: ReservationService,
    private paiementService: PaiementService,
    private dashboardService: DashboardService,
    private loadingController: LoadingController
  ) {
    addIcons({
      people,
      person,
      cube,
      calendar,
      wallet,
      statsChart,
      trendingUp,
      checkmarkCircle,
      timeOutline,
      arrowUp,
      arrowDown,
      flag
    });
  }

  ngOnInit() {
    this.loadStatistiques();
  }

  ionViewWillEnter() {
    // Recharger les statistiques chaque fois que la page est affichée
    this.loadStatistiques();
  }

  async loadStatistiques() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Chargement des statistiques...',
      duration: 2000
    });
    await loading.present();

    try {
      // Charger toutes les statistiques en parallèle
      await Promise.all([
        this.loadUtilisateurs(),
        this.loadClients(),
        this.loadArticles(),
        this.loadReservations(),
        this.loadPaiements(),
        this.loadMouvementsAujourdhui()
      ]);
    } catch (error) {
      if (!environment.production) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    } finally {
      await loading.dismiss();
      this.isLoading = false;
    }
  }

  private async loadUtilisateurs() {
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (data) => {
        this.statistiques.totalUtilisateurs = Array.isArray(data) ? data.length : 0;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des utilisateurs:', error);
        }
      }
    });
  }

  private async loadClients() {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.statistiques.totalClients = Array.isArray(data) ? data.length : 0;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des clients:', error);
        }
      }
    });
  }

  private async loadArticles() {
    this.articleService.getAllArticles().subscribe({
      next: (data) => {
        const articles = Array.isArray(data) ? data : [];
        this.statistiques.totalArticles = articles.length;
        this.statistiques.articlesActifs = articles.filter(a => a.actif).length;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des articles:', error);
        }
      }
    });
  }

  private async loadReservations() {
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        const reservations = Array.isArray(data) ? data : [];
        this.statistiques.totalReservations = reservations.length;
        this.statistiques.reservationsEnAttente = reservations.filter(
          r => r.statutReservation === 'En attente'
        ).length;
        this.statistiques.reservationsConfirmees = reservations.filter(
          r => r.statutReservation === 'Confirmée'
        ).length;
        this.statistiques.reservationsTerminees = reservations.filter(
          r => r.statutReservation === 'Terminée'
        ).length;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des réservations:', error);
        }
      }
    });
  }

  private async loadPaiements() {
    this.paiementService.getAllPaiements().subscribe({
      next: (data) => {
        this.statistiques.totalPaiements = Array.isArray(data) ? data.length : 0;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des paiements:', error);
        }
      }
    });
  }

  private async loadMouvementsAujourdhui() {
    const aujourdhui = new Date();
    const debut = new Date(aujourdhui);
    debut.setHours(0, 0, 0, 0);
    const fin = new Date(aujourdhui);
    fin.setHours(23, 59, 59, 999);

    this.dashboardService.getMouvementsArticles(debut, fin).subscribe({
      next: (mouvements) => {
        // Compter le nombre total d'articles entrants (somme des quantités)
        this.statistiques.nombreArticlesEntrantsAujourdhui = mouvements.entrants.reduce(
          (sum, item) => sum + (item.quantite || 1), 0
        );
        
        // Compter le nombre total d'articles sortants (somme des quantités)
        this.statistiques.nombreArticlesSortantsAujourdhui = mouvements.sortants.reduce(
          (sum, item) => sum + (item.quantite || 1), 0
        );
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des mouvements d\'articles:', error);
        }
        this.statistiques.nombreArticlesEntrantsAujourdhui = 0;
        this.statistiques.nombreArticlesSortantsAujourdhui = 0;
      }
    });
  }
}
