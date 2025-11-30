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
  IonSpinner,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBack, create, wallet, cash, calendar, documentText, card, checkmarkCircle, person } from 'ionicons/icons';
import { PaiementService } from '../services/paiement.service';
import { Paiement } from '../models/paiement.model';
import { ReservationService } from '../services/reservation.service';
import { Reservation } from '../models/reservation.model';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-detail-paiement',
  templateUrl: 'detail-paiement.page.html',
  styleUrls: ['detail-paiement.page.scss'],
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
    IonSpinner,
    CommonModule,
    TranslateModule
  ],
})
export class DetailPaiementPage implements OnInit {
  paiement: Paiement | null = null;
  reservation: Reservation | null = null;
  client: Client | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paiementService: PaiementService,
    private reservationService: ReservationService,
    private clientService: ClientService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ arrowBack, create, wallet, cash, calendar, documentText, card, checkmarkCircle, person });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPaiement(+id);
    } else {
      this.presentToast('ID paiement manquant', 'danger');
      this.router.navigate(['/paiements']);
    }
  }

  async loadPaiement(id: number) {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.paiementService.getPaiementById(id).subscribe({
      next: async (data) => {
        this.paiement = data || null;
        if (this.paiement?.idReservation) {
          await this.loadReservation(this.paiement.idReservation);
        }
        this.isLoading = false;
        loading.dismiss();
      },
      error: async (error) => {
        this.isLoading = false;
        loading.dismiss();
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        const errorMessage = error?.message || 'Erreur lors du chargement du paiement';
        await this.presentToast(errorMessage, 'danger');
        this.router.navigate(['/paiements']);
      }
    });
  }

  async loadReservation(id: number) {
    this.reservationService.getReservationById(id).subscribe({
      next: async (data) => {
        this.reservation = data || null;
        if (this.reservation?.idClient) {
          await this.loadClient(this.reservation.idClient);
        }
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement de la réservation:', error);
        }
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

  // Méthode désactivée - Les paiements ne peuvent plus être modifiés manuellement
  // Les paiements sont créés automatiquement lors de la finalisation d'une réservation
  
  // editPaiement() {
  //   if (this.paiement?.idPaiement) {
  //     this.router.navigate(['/paiements/edit', this.paiement.idPaiement]);
  //   }
  // }

  goBack() {
    this.router.navigate(['/paiements']);
  }

  viewReservation() {
    if (this.reservation?.idReservation) {
      this.router.navigate(['/reservations/detail', this.reservation.idReservation]);
    }
  }

  viewClient() {
    if (this.client?.idClient) {
      this.router.navigate(['/clients/detail', this.client.idClient]);
    }
  }

  getMethodeIcon(methode?: string): string {
    if (!methode) return 'cash';
    const methodeLower = methode.toLowerCase();
    if (methodeLower.includes('carte') || methodeLower.includes('card')) {
      return 'card';
    }
    if (methodeLower.includes('chèque') || methodeLower.includes('cheque')) {
      return 'document-text';
    }
    return 'cash';
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

