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
import { arrowBack, create, business, mail, call, location, globe, checkmarkCircle, closeCircle, calendar, informationCircle } from 'ionicons/icons';
import { SocieteService } from '../../services/societe.service';
import { Societe } from '../../models/societe.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-detail-societe',
  templateUrl: 'detail-societe.page.html',
  styleUrls: ['detail-societe.page.scss'],
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
export class DetailSocietePage implements OnInit {
  societe: Societe | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private societeService: SocieteService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ arrowBack, create, business, mail, call, location, globe, checkmarkCircle, closeCircle, calendar, informationCircle });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSociete(+id);
    } else {
      this.presentToast('ID société manquant', 'danger');
      this.router.navigate(['/tabs/tab1']);
    }
  }

  async loadSociete(id: number) {
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.societeService.getSocieteById(id).subscribe({
      next: (data) => {
        this.societe = data || null;
        loading.dismiss();
      },
      error: async (error) => {
        loading.dismiss();
        if (!environment.production) {
          console.error('Erreur lors du chargement de la société:', error);
          console.error('ID utilisé:', id);
          console.error('Erreur complète:', JSON.stringify(error, null, 2));
        }
        const errorMessage = error?.message || 'Erreur lors du chargement de la société';
        await this.presentToast(errorMessage, 'danger');
        this.router.navigate(['/tabs/tab1']);
      }
    });
  }

  editSociete() {
    if (this.societe?.idSociete) {
      this.router.navigate(['/parametres/societes/edit', this.societe.idSociete]);
    }
  }

  goBack() {
    this.router.navigate(['/tabs/tab1']);
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

