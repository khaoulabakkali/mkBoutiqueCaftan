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
  cube,
  checkmarkCircle,
  closeCircle,
  eye,
  eyeOff
} from 'ionicons/icons';
import { ArticleService } from '../services/article.service';
import { Article } from '../models/article.model';
import { CategorieService } from '../services/categorie.service';
import { Categorie } from '../models/categorie.model';
import { TailleService } from '../services/taille.service';
import { Taille } from '../models/taille.model';

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
export class ListeArticlesPage implements OnInit {
  articles: Article[] = [];
  articlesFiltres: Article[] = [];
  categories: Categorie[] = [];
  tailles: Taille[] = [];
  searchTerm: string = '';

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
      eyeOff
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadTailles();
    this.loadArticles();
  }

  async loadCategories() {
    this.categorieService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    });
  }

  async loadTailles() {
    this.tailleService.getAllTailles().subscribe({
      next: (data) => {
        this.tailles = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tailles:', error);
      }
    });
  }

  async loadArticles() {
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.articleService.getAllArticles().subscribe({
      next: (data) => {
        this.articles = data;
        this.articlesFiltres = data;
        loading.dismiss();
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        loading.dismiss();
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
        article.nom_article.toLowerCase().includes(term) ||
        article.description.toLowerCase().includes(term)
    );
  }

  getCategorieName(idCategorie: number): string {
    const categorie = this.categories.find(c => c.id_categorie === idCategorie);
    return categorie ? categorie.nom_categorie : 'N/A';
  }

  getTailleLabel(idTaille?: string): string {
    if (!idTaille) return 'N/A';
    const taille = this.tailles.find(t => t.taille === idTaille);
    return taille ? taille.taille : idTaille;
  }

  async editArticle(article: Article) {
    this.router.navigate(['/articles/edit', article.id_article]);
  }

  async deleteArticle(article: Article) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer l'article "${article.nom_article}" ?`,
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

            this.articleService.deleteArticle(article.id_article!).subscribe({
              next: () => {
                loading.dismiss();
                this.presentToast('Article supprimé avec succès', 'success');
                // Retirer l'article de la liste localement
                this.articles = this.articles.filter(a => a.id_article !== article.id_article);
                this.filterArticles();
              },
              error: (error) => {
                loading.dismiss();
                const errorMessage = error?.message || 'Erreur lors de la suppression';
                this.presentToast(errorMessage, 'danger');
              }
            });
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

    this.articleService.toggleActif(article.id_article!).subscribe({
      next: (updatedArticle) => {
        loading.dismiss();
        article.actif = updatedArticle.actif;
        this.presentToast(
          updatedArticle.actif ? 'Article activé' : 'Article désactivé',
          'success'
        );
      },
      error: (error) => {
        loading.dismiss();
        const errorMessage = error?.message || 'Erreur lors de la modification';
        this.presentToast(errorMessage, 'danger');
      }
    });
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
}

