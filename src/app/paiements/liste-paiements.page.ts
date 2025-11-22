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
  IonButtons,
  IonSpinner,
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
  documentText,
  informationCircle
} from 'ionicons/icons';
import { PaiementService } from '../services/paiement.service';
import { Paiement } from '../models/paiement.model';
import { environment } from '../../environments/environment';

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
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonButtons,
    IonSpinner,
    CommonModule,
    FormsModule
  ],
})
export class ListePaiementsPage implements OnInit {
  paiements: Paiement[] = [];
  paiementsFiltres: Paiement[] = [];
  searchTerm: string = '';
  isLoading = false;
  private isLoadingData = false;

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
      documentText,
      informationCircle
    });
  }

  ngOnInit() {
    this.loadPaiements();
  }

  ionViewWillEnter() {
    // Recharger les données chaque fois que la page est sur le point d'être affichée
    // Cela garantit que les modifications effectuées ailleurs sont reflétées
    // Ne pas afficher le loading si on revient juste de la modification
    this.loadPaiements(false);
  }

  async loadPaiements(showLoading = true) {
    if (this.isLoadingData) return;
    
    this.isLoadingData = true;
    this.isLoading = true;
    const loading = showLoading ? await this.loadingController.create({
      message: 'Chargement...'
    }) : null;
    
    if (loading) {
      await loading.present();
    }

    this.paiementService.getAllPaiements().subscribe({
      next: (data) => {
        this.paiements = Array.isArray(data) ? data : [];
        this.paiementsFiltres = Array.isArray(data) ? data : [];
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
        this.paiements = [];
        this.paiementsFiltres = [];
        this.isLoadingData = false;
        this.isLoading = false;
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
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
          (paiement.idPaiement?.toString() || '').includes(term) ||
          (paiement.montant?.toString() || '').includes(term) ||
          (paiement.reference?.toLowerCase() || '').includes(term) ||
          (paiement.methodePaiement?.toLowerCase() || '').includes(term)
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

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async editPaiement(paiement: Paiement) {
    if (!paiement || !paiement.idPaiement) {
      this.presentToast('ID paiement manquant', 'danger');
      return;
    }
    this.router.navigate(['/paiements/edit', paiement.idPaiement]);
  }

  async deletePaiement(paiement: Paiement) {
    if (!paiement || !paiement.idPaiement) {
      this.presentToast('ID paiement manquant', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer le paiement #${paiement.idPaiement} (${this.formatMontant(paiement.montant)}) ?`,
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

            if (paiement.idPaiement) {
              this.paiementService.deletePaiement(paiement.idPaiement).subscribe({
                next: () => {
                  loading.dismiss();
                  this.presentToast('Paiement supprimé avec succès', 'success');
                  // Recharger la liste depuis l'API
                  this.loadPaiements(false);
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

  viewPaiement(paiement: Paiement) {
    if (paiement.idPaiement) {
      this.router.navigate(['/paiements/detail', paiement.idPaiement]);
    }
  }
}

