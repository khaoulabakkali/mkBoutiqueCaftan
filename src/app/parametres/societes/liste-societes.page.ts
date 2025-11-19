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
  eyeOff, 
  eye, 
  search,
  business,
  checkmarkCircle,
  closeCircle
} from 'ionicons/icons';
import { SocieteService } from '../../services/societe.service';
import { Societe } from '../../models/societe.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-liste-societes',
  templateUrl: 'liste-societes.page.html',
  styleUrls: ['liste-societes.page.scss'],
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
export class ListeSocietesPage implements OnInit {
  societes: Societe[] = [];
  societesFiltres: Societe[] = [];
  searchTerm: string = '';
  private isLoadingData = false;

  constructor(
    private societeService: SocieteService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ 
      add, 
      create, 
      trash, 
      eyeOff, 
      eye, 
      search,
      business,
      checkmarkCircle,
      closeCircle
    });
  }

  ngOnInit() {
    this.loadSocietes();
  }

  ionViewWillEnter() {
    this.loadSocietes(false);
  }

  async loadSocietes(showLoading = true) {
    if (this.isLoadingData) return;
    
    this.isLoadingData = true;
    const loading = showLoading ? await this.loadingController.create({
      message: 'Chargement...'
    }) : null;
    
    if (loading) {
      await loading.present();
    }

    this.societeService.getAllSocietes().subscribe({
      next: (data) => {
        this.societes = data || [];
        this.societesFiltres = data || [];
        if (loading) {
          loading.dismiss();
        }
        this.isLoadingData = false;
      },
      error: (error) => {
        if (loading) {
          loading.dismiss();
        }
        this.societes = [];
        this.societesFiltres = [];
        this.isLoadingData = false;
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        const errorMessage = error?.message || 'Erreur lors du chargement des sociétés';
        this.presentToast(errorMessage, 'danger');
      }
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterSocietes();
  }

  filterSocietes() {
    if (!this.searchTerm.trim()) {
      this.societesFiltres = this.societes;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.societesFiltres = this.societes.filter(
      (societe) =>
        societe.nomSociete.toLowerCase().includes(term) ||
        societe.description?.toLowerCase().includes(term) ||
        societe.email?.toLowerCase().includes(term) ||
        societe.telephone?.toLowerCase().includes(term)
    );
  }

  async editSociete(societe: Societe) {
    if (societe.idSociete) {
      this.router.navigate(['/parametres/societes/edit', societe.idSociete]);
    }
  }

  async viewSociete(societe: Societe) {
    if (societe.idSociete) {
      this.router.navigate(['/parametres/societes/detail', societe.idSociete]);
    }
  }

  async deleteSociete(societe: Societe) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer la société "${societe.nomSociete}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            if (societe.idSociete) {
              const loading = await this.loadingController.create({
                message: 'Suppression...'
              });
              await loading.present();

              this.societeService.deleteSociete(societe.idSociete).subscribe({
                next: () => {
                  loading.dismiss();
                  this.presentToast('Société supprimée avec succès', 'success');
                  this.loadSocietes(false);
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

  async toggleActif(societe: Societe) {
    if (!societe.idSociete) return;

    const newActifState = !societe.actif;
    const loading = await this.loadingController.create({
      message: 'Modification...'
    });
    await loading.present();

    this.societeService.toggleActif(societe.idSociete, newActifState).subscribe({
      next: () => {
        loading.dismiss();
        societe.actif = newActifState;
        this.presentToast(
          newActifState ? 'Société activée' : 'Société désactivée',
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

  addNewSociete() {
    this.router.navigate(['/parametres/societes/new']);
  }
}

