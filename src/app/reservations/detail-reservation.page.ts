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
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBack, create, calendar, person, wallet, checkmarkCircle, closeCircle, timeOutline, cash } from 'ionicons/icons';
import { ReservationService } from '../services/reservation.service';
import { Reservation, StatutReservation } from '../models/reservation.model';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';
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
    CommonModule
  ],
})
export class DetailReservationPage implements OnInit {
  reservation: Reservation | null = null;
  client: Client | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private clientService: ClientService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ arrowBack, create, calendar, person, wallet, checkmarkCircle, closeCircle, timeOutline, cash });
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
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.reservationService.getReservationById(id).subscribe({
      next: async (data) => {
        this.reservation = data || null;
        if (this.reservation?.id_client) {
          await this.loadClient(this.reservation.id_client);
        }
        loading.dismiss();
      },
      error: async (error) => {
        loading.dismiss();
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
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
    if (this.reservation?.id_reservation) {
      this.router.navigate(['/reservations/edit', this.reservation.id_reservation]);
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
}

