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
  wallet,
  documentText
} from 'ionicons/icons';
import { PaiementService } from '../services/paiement.service';
import { Paiement } from '../models/paiement.model';

@Component({
  selector: 'app-liste-paiements',
  templateUrl: 'liste-paiements.page.html',
  styleUrls: ['liste-paiements.page.scss'],
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
export class ListePaiementsPage implements OnInit {
  paiements: Paiement[] = [];
  paiementsFiltres: Paiement[] = [];
  searchTerm: string = '';

  constructor(
    private paiementService: PaiementService,
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
      wallet,
      documentText
    });
  }

  ngOnInit() {
    this.loadPaiements();
  }

  async loadPaiements() {
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.paiementService.getAllPaiements().subscribe({
      next: (data) => {
        this.paiements = Array.isArray(data) ? data : [];
        this.paiementsFiltres = Array.isArray(data) ? data : [];
        loading.dismiss();
      },
      error: (error) => {
        loading.dismiss();
        this.paiements = [];
        this.paiementsFiltres = [];
        const errorMessage = error?.message || 'Erreur lors du chargement des paiements';
        this.presentToast(errorMessage, 'danger');
      }
    });
  }

  onSearchChange(event: any) {
    if (event && event.detail) {
      this.searchTerm = event.detail.value || '';
    } else {
      this.searchTerm = '';
    }
    this.filterPaiements();
  }

  filterPaiements() {
    if (!this.searchTerm || !this.searchTerm.trim()) {
      this.paiementsFiltres = this.paiements || [];
      return;
    }

    if (!Array.isArray(this.paiements) || this.paiements.length === 0) {
      this.paiementsFiltres = [];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.paiementsFiltres = this.paiements.filter(
      (paiement) => {
        if (!paiement) return false;
        return (
          (paiement.id_paiement?.toString() || '').includes(term) ||
          (paiement.montant?.toString() || '').includes(term) ||
          (paiement.reference_paiement?.toLowerCase() || '').includes(term)
        );
      }
    );
  }

  formatMontant(montant: number | undefined): string {
    if (montant === undefined || montant === null) return '0,00';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(montant);
  }

  async editPaiement(paiement: Paiement) {
    if (!paiement || !paiement.id_paiement) {
      this.presentToast('ID paiement manquant', 'danger');
      return;
    }
    this.router.navigate(['/paiements/edit', paiement.id_paiement]);
  }

  async deletePaiement(paiement: Paiement) {
    if (!paiement || !paiement.id_paiement) {
      this.presentToast('ID paiement manquant', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer le paiement #${paiement.id_paiement} (${this.formatMontant(paiement.montant)}) ?`,
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

            this.paiementService.deletePaiement(paiement.id_paiement!).subscribe({
              next: () => {
                loading.dismiss();
                this.presentToast('Paiement supprimé avec succès', 'success');
                this.loadPaiements();
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

  addNewPaiement() {
    this.router.navigate(['/paiements/new']);
  }
}

