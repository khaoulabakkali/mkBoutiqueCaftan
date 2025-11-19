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
import { arrowBack, create, grid, informationCircle, list } from 'ionicons/icons';
import { CategorieService } from '../../services/categorie.service';
import { Categorie } from '../../models/categorie.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-detail-categorie',
  templateUrl: 'detail-categorie.page.html',
  styleUrls: ['detail-categorie.page.scss'],
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
export class DetailCategoriePage implements OnInit {
  categorie: Categorie | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categorieService: CategorieService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ arrowBack, create, grid, informationCircle, list });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCategorie(+id);
    } else {
      this.presentToast('ID catégorie manquant', 'danger');
      this.router.navigate(['/parametres/categories']);
    }
  }

  async loadCategorie(id: number) {
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.categorieService.getCategorieById(id).subscribe({
      next: (data) => {
        this.categorie = data || null;
        loading.dismiss();
      },
      error: async (error) => {
        loading.dismiss();
        const errorMessage = error?.message || 'Erreur lors du chargement de la catégorie';
        await this.presentToast(errorMessage, 'danger');
        this.router.navigate(['/parametres/categories']);
      }
    });
  }

  editCategorie() {
    if (this.categorie?.idCategorie) {
      this.router.navigate(['/parametres/categories/edit', this.categorie.idCategorie]);
    }
  }

  goBack() {
    this.router.navigate(['/parametres/categories']);
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

