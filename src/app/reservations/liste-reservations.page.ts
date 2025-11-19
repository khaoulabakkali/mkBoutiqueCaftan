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
  IonLabel,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonBadge,
  IonButtons,
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
  timeOutline
} from 'ionicons/icons';
import { ReservationService } from '../services/reservation.service';
import { Reservation, StatutReservation } from '../models/reservation.model';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';
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
    IonLabel,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonBadge,
    IonButtons,
    CommonModule,
    FormsModule
  ],
})
export class ListeReservationsPage implements OnInit {
  reservations: Reservation[] = [];
  reservationsFiltres: Reservation[] = [];
  clients: Client[] = [];
  searchTerm: string = '';
  private isLoadingData = false;

  constructor(
    private reservationService: ReservationService,
    private clientService: ClientService,
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
      timeOutline
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
      },
      error: (error) => {
        if (loading) {
          loading.dismiss();
        }
        this.reservations = [];
        this.reservationsFiltres = [];
        this.isLoadingData = false;
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        const errorMessage = error?.message || 'Erreur lors du chargement des réservations';
        this.presentToast(errorMessage, 'danger');
      }
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
        const client = this.getClient(reservation.id_client);
        return (
          client?.nom_client.toLowerCase().includes(term) ||
          client?.prenom_client.toLowerCase().includes(term) ||
          reservation.statut_reservation.toLowerCase().includes(term)
        );
      }
    );
  }

  getClient(idClient: number): Client | undefined {
    return this.clients.find(c => c.id_client === idClient);
  }

  getClientName(idClient: number): string {
    const client = this.getClient(idClient);
    return client ? `${client.prenom_client} ${client.nom_client}` : 'N/A';
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
    if (reservation.id_reservation) {
      this.router.navigate(['/reservations/edit', reservation.id_reservation]);
    }
  }

  async deleteReservation(reservation: Reservation) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer la réservation #${reservation.id_reservation} ?`,
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

            if (reservation.id_reservation) {
              this.reservationService.deleteReservation(reservation.id_reservation).subscribe({
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
}

