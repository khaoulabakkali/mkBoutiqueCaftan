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
import { TranslateModule } from '@ngx-translate/core';
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
    IonSpinner,
    CommonModule,
    TranslateModule
  ],
})
export class DetailSocietePage implements OnInit {
  societe: Societe | null = null;
  isLoading = false;

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
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      if (!environment.production) {
        console.error('ID société manquant dans les paramètres de route');
      }
      this.presentToast('ID société manquant', 'danger');
      this.router.navigate(['/tabs/tab1']);
      return;
    }
    
    const id = Number(idParam);
    if (isNaN(id)) {
      if (!environment.production) {
        console.error('ID société invalide:', idParam);
      }
      this.presentToast('ID société invalide', 'danger');
      this.router.navigate(['/tabs/tab1']);
      return;
    }
    
    this.loadSociete(id);
  }

  async loadSociete(id: number) {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.societeService.getSocieteById(id).subscribe({
      next: (data) => {
        this.societe = data || null;
        if (!this.societe) {
          if (!environment.production) {
            console.error('Aucune donnée reçue pour la société');
          }
          this.presentToast('Aucune donnée trouvée pour cette société', 'warning');
        }
        this.isLoading = false;
        loading.dismiss();
      },
      error: async (error) => {
        this.isLoading = false;
        loading.dismiss();
        if (!environment.production) {
          console.error('Erreur lors du chargement de la société:', error);
          console.error('ID utilisé:', id);
          console.error('Type de l\'ID:', typeof id);
          console.error('Erreur complète:', JSON.stringify(error, null, 2));
        }
        let errorMessage = 'Erreur lors du chargement de la société';
        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (typeof error?.error === 'string') {
          errorMessage = error.error;
        }
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

