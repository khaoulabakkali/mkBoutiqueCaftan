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
  LoadingController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBack, create, person, mail, call, location, calendar, bag } from 'ionicons/icons';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-detail-client',
  templateUrl: 'detail-client.page.html',
  styleUrls: ['detail-client.page.scss'],
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
    CommonModule
  ],
})
export class DetailClientPage implements OnInit {
  client: Client | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ arrowBack, create, person, mail, call, location, calendar, bag });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClient(+id);
    } else {
      this.presentToast('ID client manquant', 'danger');
      this.router.navigate(['/clients']);
    }
  }

  async loadClient(id: number) {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.clientService.getClientById(id).subscribe({
      next: (data) => {
        this.client = data || null;
        this.isLoading = false;
        loading.dismiss();
      },
      error: async (error) => {
        this.isLoading = false;
        loading.dismiss();
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        const errorMessage = error?.message || 'Erreur lors du chargement du client';
        await this.presentToast(errorMessage, 'danger');
        this.router.navigate(['/clients']);
      }
    });
  }

  editClient() {
    if (this.client?.idClient) {
      this.router.navigate(['/clients/edit', this.client.idClient]);
    }
  }

  goBack() {
    this.router.navigate(['/clients']);
  }

  getFullName(): string {
    if (!this.client) return '';
    return `${this.client.prenomClient} ${this.client.nomClient}`;
  }

  formatDate(dateString: string | undefined): string {
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

