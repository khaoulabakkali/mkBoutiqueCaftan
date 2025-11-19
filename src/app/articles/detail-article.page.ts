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
  IonImg,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBack, create, cube, grid, resize, colorFill, cash, checkmarkCircle, closeCircle, image, informationCircle } from 'ionicons/icons';
import { ArticleService } from '../services/article.service';
import { Article } from '../models/article.model';
import { CategorieService } from '../services/categorie.service';
import { Categorie } from '../models/categorie.model';
import { TailleService } from '../services/taille.service';
import { Taille } from '../models/taille.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-detail-article',
  templateUrl: 'detail-article.page.html',
  styleUrls: ['detail-article.page.scss'],
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
    IonImg,
    CommonModule
  ],
})
export class DetailArticlePage implements OnInit {
  article: Article | null = null;
  categorie: Categorie | null = null;
  taille: Taille | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private categorieService: CategorieService,
    private tailleService: TailleService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ arrowBack, create, cube, grid, resize, colorFill, cash, checkmarkCircle, closeCircle, image, informationCircle });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadArticle(+id);
    } else {
      this.presentToast('ID article manquant', 'danger');
      this.router.navigate(['/articles']);
    }
  }

  async loadArticle(id: number) {
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.articleService.getArticleById(id).subscribe({
      next: async (data) => {
        this.article = data || null;
        if (this.article) {
          // Charger la catégorie
          if (this.article.idCategorie) {
            await this.loadCategorie(this.article.idCategorie);
          }
          // Charger la taille si disponible
          if (this.article.idTaille) {
            await this.loadTaille(this.article.idTaille);
          }
        }
        loading.dismiss();
      },
      error: async (error) => {
        loading.dismiss();
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        const errorMessage = error?.message || 'Erreur lors du chargement de l\'article';
        await this.presentToast(errorMessage, 'danger');
        this.router.navigate(['/articles']);
      }
    });
  }

  async loadCategorie(id: number) {
    this.categorieService.getCategorieById(id).subscribe({
      next: (data) => {
        this.categorie = data || null;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement de la catégorie:', error);
        }
      }
    });
  }

  async loadTaille(id: number) {
    this.tailleService.getTailleById(id).subscribe({
      next: (data) => {
        this.taille = data || null;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement de la taille:', error);
        }
      }
    });
  }

  editArticle() {
    if (this.article?.idArticle) {
      this.router.navigate(['/articles/edit', this.article.idArticle]);
    }
  }

  goBack() {
    this.router.navigate(['/articles']);
  }

  viewCategorie() {
    if (this.categorie?.idCategorie) {
      this.router.navigate(['/parametres/categories/detail', this.categorie.idCategorie]);
    }
  }

  viewTaille() {
    if (this.taille?.idTaille) {
      this.router.navigate(['/parametres/tailles/detail', this.taille.idTaille]);
    }
  }

  formatMontant(montant: number | undefined): string {
    if (montant === undefined || montant === null) return '0,00 MAD';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(montant);
  }

  getPhotoUrl(): string | null {
    if (!this.article?.photo) return null;
    // Si c'est une URL, la retourner directement
    if (this.article.photo.startsWith('http://') || this.article.photo.startsWith('https://')) {
      return this.article.photo;
    }
    // Si c'est du base64, ajouter le préfixe
    if (this.article.photo.startsWith('data:image')) {
      return this.article.photo;
    }
    // Sinon, supposer que c'est du base64 sans préfixe
    return `data:image/jpeg;base64,${this.article.photo}`;
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

