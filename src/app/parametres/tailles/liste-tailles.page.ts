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

  async loadTailles() {
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.tailleService.getAllTailles().subscribe({
      next: (data) => {
        this.tailles = data;
        this.taillesFiltres = data;
        loading.dismiss();
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        loading.dismiss();
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

  async editTaille(taille: Taille) {
    this.router.navigate(['/parametres/tailles/edit', taille.id_taille]);
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

            this.tailleService.deleteTaille(taille.id_taille!).subscribe({
              next: () => {
                loading.dismiss();
                this.presentToast('Taille supprimée avec succès', 'success');
                // Retirer la taille de la liste localement
                this.tailles = this.tailles.filter(t => t.id_taille !== taille.id_taille);
                this.filterTailles();
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

