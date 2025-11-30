import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonMenuButton,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonBadge,
  IonButtons,
  IonSpinner,
  IonAlert,
  AlertController,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  add, 
  create, 
  trash, 
  search, 
  calendarOutline,
  checkmarkCircle,
  closeCircle,
  timeOutline,
  informationCircle,
  checkmark
} from 'ionicons/icons';
import { ReservationService } from '../services/reservation.service';
import { Reservation, StatutReservation } from '../models/reservation.model';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';
import { PaiementService } from '../services/paiement.service';
import { Paiement } from '../models/paiement.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-liste-reservations',
  templateUrl: 'liste-reservations.page.html',
  styleUrls: ['liste-reservations.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonMenuButton,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonBadge,
    IonButtons,
    IonSpinner,
    CommonModule,
    FormsModule
  ],
})
export class ListeReservationsPage implements OnInit {
  reservations: Reservation[] = [];
  reservationsFiltres: Reservation[] = [];
  clients: Client[] = [];
  searchTerm: string = '';
  isLoading = false;
  private isLoadingData = false;

  constructor(
    private reservationService: ReservationService,
    private clientService: ClientService,
    private paiementService: PaiementService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ 
      add, 
      create, 
      trash, 
      search, 
      calendarOutline,
      checkmarkCircle,
      closeCircle,
      timeOutline,
      informationCircle,
      checkmark
    });
  }

  ngOnInit() {
    this.loadClients();
    this.loadReservations();
  }

  ionViewWillEnter() {
    // Recharger les données chaque fois que la page est sur le point d'être affichée
    // Cela garantit que les modifications effectuées ailleurs sont reflétées
    // Ne pas afficher le loading si on revient juste de la modification
    this.loadReservations(false);
  }

  async loadClients() {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des clients:', error);
        }
      }
    });
  }

  async loadReservations(showLoading = true) {
    if (this.isLoadingData) return;
    
    this.isLoadingData = true;
    this.isLoading = true;
    const loading = showLoading ? await this.loadingController.create({
      message: 'Chargement...'
    }) : null;
    
    if (loading) {
      await loading.present();
    }

    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations = data || [];
        this.reservationsFiltres = data || [];
        if (loading) {
          loading.dismiss();
        }
        this.isLoadingData = false;
        this.isLoading = false;
      },
      error: (error) => {
        if (loading) {
          loading.dismiss();
        }
        this.reservations = [];
        this.reservationsFiltres = [];
        this.isLoadingData = false;
        this.isLoading = false;
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        const errorMessage = error?.message || 'Erreur lors du chargement des réservations';
        this.presentToast(errorMessage, 'danger');
      }
    });
  }

  /**
   * Recharge la liste des réservations après une mise à jour (sans afficher le loading)
   */
  private async loadReservationsAfterUpdate(): Promise<void> {
    return new Promise((resolve) => {
      // Réinitialiser le flag pour permettre le rechargement
      this.isLoadingData = false;
      
      // Forcer le rechargement en ajoutant un petit délai pour s'assurer que l'API a bien mis à jour
      setTimeout(() => {
        this.reservationService.getAllReservations().subscribe({
          next: (data) => {
            // Mettre à jour les tableaux avec les nouvelles données
            this.reservations = data || [];
            // Appliquer le filtre de recherche si actif
            if (this.searchTerm.trim()) {
              this.filterReservations();
            } else {
              this.reservationsFiltres = [...this.reservations]; // Créer une nouvelle référence pour forcer la détection de changement
            }
            resolve();
          },
          error: (error) => {
            if (!environment.production) {
              console.error('Erreur lors du rechargement:', error);
            }
            // Même en cas d'erreur, résoudre pour ne pas bloquer l'interface
            resolve();
          }
        });
      }, 100); // Petit délai pour s'assurer que l'API a bien mis à jour
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterReservations();
  }

  filterReservations() {
    if (!this.searchTerm.trim()) {
      this.reservationsFiltres = this.reservations;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.reservationsFiltres = this.reservations.filter(
      (reservation) => {
        const client = this.getClient(reservation.idClient);
        return (
          client?.nomClient.toLowerCase().includes(term) ||
          (client?.prenomClient && client.prenomClient.toLowerCase().includes(term)) ||
          reservation.statutReservation.toLowerCase().includes(term)
        );
      }
    );
  }

  getClient(idClient: number): Client | undefined {
    return this.clients.find(c => c.idClient === idClient);
  }

  getClientName(idClient: number): string {
    const client = this.getClient(idClient);
    return client ? `${client.prenomClient} ${client.nomClient}` : 'N/A';
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

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  async editReservation(reservation: Reservation) {
    if (reservation.idReservation) {
      this.router.navigate(['/reservations/edit', reservation.idReservation]);
    }
  }

  async deleteReservation(reservation: Reservation) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer la réservation #${reservation.idReservation} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Suppression...'
            });
            await loading.present();

            if (reservation.idReservation) {
              this.reservationService.deleteReservation(reservation.idReservation).subscribe({
                next: () => {
                  loading.dismiss();
                  this.presentToast('Réservation supprimée avec succès', 'success');
                  // Recharger la liste depuis l'API
                  this.loadReservations(false);
                },
                error: (error) => {
                  loading.dismiss();
                  const errorMessage = error?.message || 'Erreur lors de la suppression';
                  this.presentToast(errorMessage, 'danger');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  addNewReservation() {
    this.router.navigate(['/reservations/new']);
  }

  viewReservation(reservation: Reservation) {
    if (reservation.idReservation) {
      this.router.navigate(['/reservations/detail', reservation.idReservation]);
    }
  }

  /**
   * Vérifie si une réservation peut être terminée
   */
  canTerminateReservation(reservation: Reservation): boolean {
    return reservation.statutReservation !== 'Terminée' && 
           reservation.statutReservation !== 'Annulée';
  }

  /**
   * Termine une réservation et crée automatiquement un paiement
   */
  async terminerReservation(reservation: Reservation, slidingItem?: any) {
    if (!reservation.idReservation) {
      return;
    }

    // Vérifier si la réservation peut être terminée
    if (!this.canTerminateReservation(reservation)) {
      if (slidingItem) {
        slidingItem.close();
      }
      await this.presentToast('Cette réservation est déjà terminée ou annulée', 'warning');
      return;
    }

    if (slidingItem) {
      slidingItem.close();
    }

    const alert = await this.alertController.create({
      header: 'Terminer la réservation',
      message: `Êtes-vous sûr de vouloir terminer la réservation #${reservation.idReservation} ? Un paiement sera automatiquement créé.`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Terminer',
          handler: async () => {
            await this.executeTerminerReservation(reservation);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Exécute la logique de terminaison de réservation
   */
  private async executeTerminerReservation(reservation: Reservation) {
    if (!reservation.idReservation) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Terminaison de la réservation...'
    });
    await loading.present();

    // Mettre à jour le statut de la réservation
    const reservationData: Reservation = {
      idClient: reservation.idClient,
      dateReservation: reservation.dateReservation,
      dateDebut: reservation.dateDebut,
      dateFin: reservation.dateFin,
      montantTotal: reservation.montantTotal,
      statutReservation: 'Terminée',
      idPaiement: reservation.idPaiement || undefined,
      remiseAppliquee: reservation.remiseAppliquee || 0,
      photoCarteIdentite: reservation.photoCarteIdentite,
      articles: reservation.articles
    };

    this.reservationService.updateReservation(reservation.idReservation, reservationData).subscribe({
      next: async (updatedReservation) => {
        // Mettre à jour immédiatement la réservation dans le tableau local
        const index = this.reservations.findIndex(r => r.idReservation === reservation.idReservation);
        if (index !== -1) {
          this.reservations[index] = { ...this.reservations[index], statutReservation: 'Terminée' };
          // Mettre à jour aussi dans la liste filtrée
          const indexFiltre = this.reservationsFiltres.findIndex(r => r.idReservation === reservation.idReservation);
          if (indexFiltre !== -1) {
            this.reservationsFiltres[indexFiltre] = { ...this.reservationsFiltres[indexFiltre], statutReservation: 'Terminée' };
          }
        }

        // Si aucun paiement n'existe, créer un paiement automatiquement
        if (!updatedReservation.idPaiement) {
          try {
            await this.createPaymentForReservation(
              reservation.idReservation!,
              reservation.montantTotal,
              reservation.idClient
            );
            // Recharger la liste des réservations depuis l'API pour avoir les données complètes
            await this.loadReservationsAfterUpdate();
            loading.dismiss();
            await this.presentToast('Réservation terminée et paiement créé avec succès', 'success');
          } catch (error) {
            // Même en cas d'erreur de paiement, recharger la liste car la réservation est terminée
            await this.loadReservationsAfterUpdate();
            loading.dismiss();
            await this.presentToast('Réservation terminée mais erreur lors de la création du paiement', 'warning');
          }
        } else {
          // Recharger la liste des réservations depuis l'API pour avoir les données complètes
          await this.loadReservationsAfterUpdate();
          loading.dismiss();
          await this.presentToast('Réservation terminée avec succès', 'success');
        }
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
}

