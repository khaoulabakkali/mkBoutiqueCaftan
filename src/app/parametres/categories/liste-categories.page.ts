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
  grid
} from 'ionicons/icons';
import { CategorieService } from '../../services/categorie.service';
import { Categorie } from '../../models/categorie.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-liste-categories',
  templateUrl: 'liste-categories.page.html',
  styleUrls: ['liste-categories.page.scss'],
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
    IonButtons,
    CommonModule,
    FormsModule
  ],
})
export class ListeCategoriesPage implements OnInit {
  categories: Categorie[] = [];
  categoriesFiltres: Categorie[] = [];
  searchTerm: string = '';

  constructor(
    private categorieService: CategorieService,
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
      grid
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  async loadCategories() {
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.categorieService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.categoriesFiltres = data;
        loading.dismiss();
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        loading.dismiss();
        const errorMessage = error?.message || 'Erreur lors du chargement des catégories';
        this.presentToast(errorMessage, 'danger');
      }
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterCategories();
  }

  filterCategories() {
    if (!this.searchTerm.trim()) {
      this.categoriesFiltres = this.categories;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.categoriesFiltres = this.categories.filter(
      (categorie) =>
        categorie.nom_categorie.toLowerCase().includes(term) ||
        categorie.description?.toLowerCase().includes(term)
    );
  }

  async editCategorie(categorie: Categorie) {
    this.router.navigate(['/parametres/categories/edit', categorie.id_categorie]);
  }

  async deleteCategorie(categorie: Categorie) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer la catégorie "${categorie.nom_categorie}" ?`,
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

            this.categorieService.deleteCategorie(categorie.id_categorie!).subscribe({
              next: () => {
                loading.dismiss();
                this.presentToast('Catégorie supprimée avec succès', 'success');
                // Retirer la catégorie de la liste localement
                this.categories = this.categories.filter(c => c.id_categorie !== categorie.id_categorie);
                this.filterCategories();
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

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  addNewCategorie() {
    this.router.navigate(['/parametres/categories/new']);
  }
}

