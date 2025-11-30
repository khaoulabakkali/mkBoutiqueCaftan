import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonMenuButton,
  IonItem,
  IonLabel,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonSpinner,
  ToastController,
  LoadingController,
  AlertController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBack, create, calendar, person, wallet, checkmarkCircle, closeCircle, timeOutline, cash, cube, checkmark, idCard } from 'ionicons/icons';
import { ReservationService } from '../services/reservation.service';
import { Reservation, StatutReservation, ReservationArticle } from '../models/reservation.model';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';
import { ArticleService } from '../services/article.service';
import { Article } from '../models/article.model';
import { PaiementService } from '../services/paiement.service';
import { Paiement } from '../models/paiement.model';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-detail-reservation',
  templateUrl: 'detail-reservation.page.html',
  styleUrls: ['detail-reservation.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonMenuButton,
    IonItem,
    IonLabel,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonSpinner,
    CommonModule,
    TranslateModule
  ],
})
export class DetailReservationPage implements OnInit {
  reservation: Reservation | null = null;
  client: Client | null = null;
  articles: Array<{ article: Article; quantite: number }> = [];
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private clientService: ClientService,
    private articleService: ArticleService,
    private paiementService: PaiementService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    addIcons({ arrowBack, create, calendar, person, wallet, checkmarkCircle, closeCircle, timeOutline, cash, cube, checkmark, idCard });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReservation(+id);
    } else {
      this.presentToast('ID réservation manquant', 'danger');
      this.router.navigate(['/reservations']);
    }
  }

  async loadReservation(id: number) {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.reservationService.getReservationById(id).subscribe({
      next: async (data) => {
        this.reservation = data || null;

        console.log(this.reservation);
        if (this.reservation?.idClient) {
          await this.loadClient(this.reservation.idClient);
        }

        if (this.reservation?.articles && this.reservation.articles.length > 0) {
          this.articles = this.reservation.articles as any;
          console.log(this.articles);
        }
        this.isLoading = false;
        loading.dismiss();
      },
      error: async (error) => {
        this.isLoading = false;
        loading.dismiss();
        const errorMessage = error?.message || 'Erreur lors du chargement de la réservation';
        await this.presentToast(errorMessage, 'danger');
        this.router.navigate(['/reservations']);
      }
    });
  }

  async loadClient(id: number) {
    this.clientService.getClientById(id).subscribe({
      next: (data) => {
        this.client = data || null;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement du client:', error);
        }
      }
    });
  }

  editReservation() {
    if (this.reservation?.idReservation) {
      this.router.navigate(['/reservations/edit', this.reservation.idReservation]);
    }
  }

  goBack() {
    this.router.navigate(['/reservations']);
  }

  viewClient() {
    if (this.client?.idClient) {
      this.router.navigate(['/clients/detail', this.client.idClient]);
    }
  }

  viewArticle(article: Article | null | undefined) {
    if (article?.idArticle) {
      this.router.navigate(['/articles/detail', article.idArticle]);
    }
  }

  getStatutColor(statut: StatutReservation): string {
    switch (statut) {
      case 'Confirmée':
        return 'success';
      case 'En cours':
        return 'primary';
      case 'Terminée':
        return 'medium';
      case 'Annulée':
        return 'danger';
      case 'En attente':
      default:
        return 'warning';
    }
  }

  getStatutIcon(statut: StatutReservation): string {
    switch (statut) {
      case 'Confirmée':
        return 'checkmark-circle';
      case 'En cours':
        return 'time-outline';
      case 'Terminée':
        return 'checkmark-circle';
      case 'Annulée':
        return 'close-circle';
      case 'En attente':
      default:
        return 'time-outline';
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Non défini';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'Non défini';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatMontant(montant: number | undefined): string {
    if (montant === undefined || montant === null) return '0,00 MAD';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(montant);
  }

  getClientName(): string {
    if (!this.client) return 'Client non trouvé';
    return `${this.client.prenomClient} ${this.client.nomClient}`;
  }

  private async presentToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  /**
   * Vérifie si la réservation peut être terminée
   */
  canTerminateReservation(): boolean {
    return this.reservation !== null && 
           this.reservation.statutReservation !== 'Terminée' && 
           this.reservation.statutReservation !== 'Annulée';
  }

  /**
   * Termine une réservation et crée automatiquement un paiement
   */
  async terminerReservation() {
    if (!this.reservation || !this.reservation.idReservation) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Terminer la réservation',
      message: `Êtes-vous sûr de vouloir terminer la réservation #${this.reservation.idReservation} ? Un paiement sera automatiquement créé.`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Terminer',
          handler: async () => {
            await this.executeTerminerReservation();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Exécute la logique de terminaison de réservation
   */
  private async executeTerminerReservation() {
    if (!this.reservation || !this.reservation.idReservation) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Terminaison de la réservation...'
    });
    await loading.present();

    // Mettre à jour le statut de la réservation
    const reservationData: Reservation = {
      idClient: this.reservation.idClient,
      dateReservation: this.reservation.dateReservation,
      dateDebut: this.reservation.dateDebut,
      dateFin: this.reservation.dateFin,
      montantTotal: this.reservation.montantTotal,
      statutReservation: 'Terminée',
      idPaiement: this.reservation.idPaiement || undefined,
      remiseAppliquee: this.reservation.remiseAppliquee || 0,
      photoCarteIdentite: this.reservation.photoCarteIdentite,
      articles: this.reservation.articles
    };

    this.reservationService.updateReservation(this.reservation.idReservation, reservationData).subscribe({
      next: async (updatedReservation) => {
        // Si aucun paiement n'existe, créer un paiement automatiquement
        if (!updatedReservation.idPaiement) {
          try {
            await this.createPaymentForReservation(
              this.reservation!.idReservation!,
              this.reservation!.montantTotal,
              this.reservation!.idClient
            );
            loading.dismiss();
            await this.presentToast('Réservation terminée et paiement créé avec succès', 'success');
          } catch (error) {
            loading.dismiss();
            await this.presentToast('Réservation terminée mais erreur lors de la création du paiement', 'warning');
          }
        } else {
          loading.dismiss();
          await this.presentToast('Réservation terminée avec succès', 'success');
        }
        
        // Recharger la réservation pour afficher les nouvelles données
        await this.loadReservation(this.reservation!.idReservation!);
      },
      error: async (error) => {
        loading.dismiss();
        const errorMessage = error?.message || 'Erreur lors de la terminaison de la réservation';
        await this.presentToast(errorMessage, 'danger');
      }
    });
  }

  /**
   * Crée automatiquement un paiement pour une réservation terminée
   */
  private async createPaymentForReservation(reservationId: number, montant: number, idClient: number): Promise<void> {
    return new Promise((resolve, reject) => {
      // Vérifier d'abord si un paiement existe déjà pour cette réservation
      this.paiementService.getAllPaiements().subscribe({
        next: (paiements) => {
          const existingPaiement = paiements.find(p => p.idReservation === reservationId);
          
          if (existingPaiement) {
            // Un paiement existe déjà, mettre à jour la réservation avec cet ID
            this.updateReservationWithPayment(reservationId, existingPaiement.idPaiement!);
            resolve();
            return;
          }

          // Créer un nouveau paiement
          const nouveauPaiement: Paiement = {
            idReservation: reservationId,
            montant: montant,
            datePaiement: new Date().toISOString(),
            methodePaiement: 'Automatique',
            reference: `AUTO-${reservationId}-${Date.now()}`
          };

          this.paiementService.createPaiement(nouveauPaiement).subscribe({
            next: (paiementCree) => {
              // Mettre à jour la réservation avec l'ID du paiement créé
              if (paiementCree.idPaiement) {
                this.updateReservationWithPayment(reservationId, paiementCree.idPaiement);
              }
              resolve();
            },
            error: (error) => {
              if (!environment.production) {
                console.error('Erreur lors de la création du paiement:', error);
              }
              reject(error);
            }
          });
        },
        error: (error) => {
          if (!environment.production) {
            console.error('Erreur lors de la vérification des paiements:', error);
          }
          reject(error);
        }
      });
    });
  }

  /**
   * Met à jour une réservation avec l'ID du paiement
   */
  private updateReservationWithPayment(reservationId: number, paiementId: number): void {
    this.reservationService.getReservationById(reservationId).subscribe({
      next: (reservation) => {
        const reservationData: Reservation = {
          idClient: reservation.idClient,
          dateReservation: reservation.dateReservation,
          dateDebut: reservation.dateDebut,
          dateFin: reservation.dateFin,
          montantTotal: reservation.montantTotal,
          statutReservation: reservation.statutReservation,
          idPaiement: paiementId,
          remiseAppliquee: reservation.remiseAppliquee || 0,
          photoCarteIdentite: reservation.photoCarteIdentite,
          articles: reservation.articles
        };

        this.reservationService.updateReservation(reservationId, reservationData).subscribe({
          next: () => {
            if (!environment.production) {
              console.log('Paiement associé à la réservation avec succès');
            }
          },
          error: (error) => {
            if (!environment.production) {
              console.error('Erreur lors de la mise à jour de la réservation avec le paiement:', error);
            }
          }
        });
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors de la récupération de la réservation:', error);
        }
      }
    });
  }

  /**
   * Gère les erreurs de chargement d'image
   */
  handleImageError(event: any) {
    if (!environment.production) {
      console.error('Erreur lors du chargement de l\'image CIN:', event);
    }
    // Optionnel : masquer l'image ou afficher un placeholder
    const img = event.target;
    if (img) {
      img.style.display = 'none';
    }
  }

  /**
   * Gère le chargement réussi de l'image
   */
  handleImageLoad(event: any) {
    if (!environment.production) {
      console.log('Image CIN chargée avec succès');
    }
  }
}

