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
  cube,
  checkmarkCircle,
  closeCircle,
  eye,
  eyeOff,
  imageOutline,
  informationCircle
} from 'ionicons/icons';
import { ArticleService } from '../services/article.service';
import { Article } from '../models/article.model';
import { CategorieService } from '../services/categorie.service';
import { Categorie } from '../models/categorie.model';
import { TailleService } from '../services/taille.service';
import { Taille } from '../models/taille.model';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-liste-articles',
  templateUrl: 'liste-articles.page.html',
  styleUrls: ['liste-articles.page.scss'],
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
    FormsModule,
    TranslateModule
  ],
})
export class ListeArticlesPage implements OnInit {
  articles: Article[] = [];
  articlesFiltres: Article[] = [];
  categories: Categorie[] = [];
  tailles: Taille[] = [];
  searchTerm: string = '';
  isLoading = false;
  private isLoadingData = false;

  constructor(
    private articleService: ArticleService,
    private categorieService: CategorieService,
    private tailleService: TailleService,
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
      cube,
      checkmarkCircle,
      closeCircle,
      eye,
      eyeOff,
      imageOutline,
      informationCircle
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadTailles();
    this.loadArticles();
  }

  ionViewWillEnter() {
    // Recharger les données chaque fois que la page est sur le point d'être affichée
    // Cela garantit que les modifications effectuées ailleurs sont reflétées
    // Ne pas afficher le loading si on revient juste de la modification
    this.loadArticles(false);
  }

  async loadCategories() {
    this.categorieService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des catégories:', error);
        }
      }
    });
  }

  async loadTailles() {
    this.tailleService.getAllTailles().subscribe({
      next: (data) => {
        this.tailles = data;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des tailles:', error);
        }
      }
    });
  }

  async loadArticles(showLoading = true) {
    if (this.isLoadingData) return;
    
    this.isLoadingData = true;
    this.isLoading = true;
    const loading = showLoading ? await this.loadingController.create({
      message: 'Chargement...'
    }) : null;
    
    if (loading) {
      await loading.present();
    }

    this.articleService.getAllArticles().subscribe({
      next: (data) => {
        this.articles = data || [];
        this.articlesFiltres = data || [];
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
        this.articles = [];
        this.articlesFiltres = [];
        this.isLoadingData = false;
        this.isLoading = false;
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        const errorMessage = error?.message || 'Erreur lors du chargement des articles';
        this.presentToast(errorMessage, 'danger');
      }
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterArticles();
  }

  filterArticles() {
    if (!this.searchTerm.trim()) {
      this.articlesFiltres = this.articles;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.articlesFiltres = this.articles.filter(
      (article) =>
        article.nomArticle.toLowerCase().includes(term) ||
        article.description.toLowerCase().includes(term)
    );
  }

  getCategorieName(idCategorie: number): string {
    const categorie = this.categories.find(c => c.idCategorie === idCategorie);
    return categorie ? categorie.nomCategorie : 'N/A';
  }

  getTailleLabel(idTaille?: number): string {
    if (!idTaille) return 'N/A';
    const taille = this.tailles.find(t => t.idTaille === idTaille);
    return taille ? taille.taille : 'N/A';
  }

  async editArticle(article: Article) {
    if (article.idArticle) {
      this.router.navigate(['/articles/edit', article.idArticle]);
    }
  }

  async deleteArticle(article: Article) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer l'article "${article.nomArticle}" ?`,
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

            if (article.idArticle) {
              this.articleService.deleteArticle(article.idArticle).subscribe({
                next: () => {
                  loading.dismiss();
                  this.presentToast('Article supprimé avec succès', 'success');
                  // Recharger la liste depuis l'API
                  this.loadArticles(false);
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

  async toggleActif(article: Article) {
    const loading = await this.loadingController.create({
      message: 'Modification...'
    });
    await loading.present();

    const newActifState = !article.actif;
    if (article.idArticle) {
      this.articleService.toggleActif(article.idArticle, newActifState).subscribe({
        next: () => {
          loading.dismiss();
          article.actif = newActifState;
          this.presentToast(
            newActifState ? 'Article activé' : 'Article désactivé',
            'success'
          );
          // Recharger la liste depuis l'API pour s'assurer de la synchronisation
          this.loadArticles(false);
        },
        error: (error) => {
          loading.dismiss();
          const errorMessage = error?.message || 'Erreur lors de la modification';
          this.presentToast(errorMessage, 'danger');
        }
      });
    }
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

  addNewArticle() {
    this.router.navigate(['/articles/new']);
  }

  viewArticle(article: Article) {
    if (article.idArticle) {
      this.router.navigate(['/articles/detail', article.idArticle]);
    }
  }
}

