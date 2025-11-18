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
  resize
} from 'ionicons/icons';
import { TailleService } from '../../services/taille.service';
import { Taille } from '../../models/taille.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-liste-tailles',
  templateUrl: 'liste-tailles.page.html',
  styleUrls: ['liste-tailles.page.scss'],
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
export class ListeTaillesPage implements OnInit {
  tailles: Taille[] = [];
  taillesFiltres: Taille[] = [];
  searchTerm: string = '';
  private isLoadingData = false;

  constructor(
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
      resize
    });
  }

  ngOnInit() {
    this.loadTailles();
  }

  ionViewWillEnter() {
    // Recharger les données chaque fois que la page est sur le point d'être affichée
    // Cela garantit que les modifications effectuées ailleurs sont reflétées
    // Ne pas afficher le loading si on revient juste de la modification
    this.loadTailles(false);
  }

  async loadTailles(showLoading = true) {
    if (this.isLoadingData) return;
    
    this.isLoadingData = true;
    const loading = showLoading ? await this.loadingController.create({
      message: 'Chargement...'
    }) : null;
    
    if (loading) {
      await loading.present();
    }

    this.tailleService.getAllTailles().subscribe({
      next: (data) => {
        this.tailles = data || [];
        this.taillesFiltres = data || [];
        if (loading) {
          loading.dismiss();
        }
        this.isLoadingData = false;
      },
      error: (error) => {
        if (loading) {
          loading.dismiss();
        }
        this.tailles = [];
        this.taillesFiltres = [];
        this.isLoadingData = false;
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        const errorMessage = error?.message || 'Erreur lors du chargement des tailles';
        this.presentToast(errorMessage, 'danger');
      }
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterTailles();
  }

  filterTailles() {
    if (!this.searchTerm.trim()) {
      this.taillesFiltres = this.tailles;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.taillesFiltres = this.tailles.filter(
      (taille) => taille.taille.toLowerCase().includes(term)
    );
  }

  viewTaille(taille: Taille) {
    if (taille.idTaille) {
      this.router.navigate(['/parametres/tailles/detail', taille.idTaille]);
    }
  }

  async editTaille(taille: Taille) {
    if (taille.idTaille) {
      this.router.navigate(['/parametres/tailles/edit', taille.idTaille]);
    }
  }

  async deleteTaille(taille: Taille) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer la taille "${taille.taille}" ?`,
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

            this.tailleService.deleteTaille(taille.idTaille!).subscribe({
              next: () => {
                loading.dismiss();
                this.presentToast('Taille supprimée avec succès', 'success');
                // Recharger la liste depuis l'API
                this.loadTailles(false);
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

  addNewTaille() {
    this.router.navigate(['/parametres/tailles/new']);
  }
}

