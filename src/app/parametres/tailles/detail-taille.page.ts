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
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBack, create, resize } from 'ionicons/icons';
import { TailleService } from '../../services/taille.service';
import { Taille } from '../../models/taille.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-detail-taille',
  templateUrl: 'detail-taille.page.html',
  styleUrls: ['detail-taille.page.scss'],
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
    CommonModule
  ],
})
export class DetailTaillePage implements OnInit {
  taille: Taille | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tailleService: TailleService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ arrowBack, create, resize });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTaille(+id);
    } else {
      this.presentToast('ID taille manquant', 'danger');
      this.router.navigate(['/parametres/tailles']);
    }
  }

  async loadTaille(id: number) {
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.tailleService.getTailleById(id).subscribe({
      next: (data) => {
        this.taille = data || null;
        loading.dismiss();
      },
      error: async (error) => {
        loading.dismiss();
        const errorMessage = error?.message || 'Erreur lors du chargement de la taille';
        await this.presentToast(errorMessage, 'danger');
        this.router.navigate(['/parametres/tailles']);
      }
    });
  }

  editTaille() {
    if (this.taille?.idTaille) {
      this.router.navigate(['/parametres/tailles/edit', this.taille.idTaille]);
    }
  }

  goBack() {
    this.router.navigate(['/parametres/tailles']);
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

