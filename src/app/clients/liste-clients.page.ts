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
  personOutline,
  checkmarkCircle,
  closeCircle
} from 'ionicons/icons';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-liste-clients',
  templateUrl: 'liste-clients.page.html',
  styleUrls: ['liste-clients.page.scss'],
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
export class ListeClientsPage implements OnInit {
  clients: Client[] = [];
  clientsFiltres: Client[] = [];
  searchTerm: string = '';
  private isLoadingData = false;
  constructor(
    private clientService: ClientService,
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
      personOutline,
      checkmarkCircle,
      closeCircle
    });
  }

  ngOnInit() {
    this.loadClients();
  }

  ionViewWillEnter() {
    // Recharger les données chaque fois que la page est sur le point d'être affichée
    // Cela garantit que les modifications effectuées ailleurs sont reflétées
    // Ne pas afficher le loading si on revient juste de la modification
    this.loadClients(false);
  }

  async loadClients(showLoading = true) {
    if (this.isLoadingData) return;
    
    this.isLoadingData = true;
    const loading = showLoading ? await this.loadingController.create({
      message: 'Chargement...'
    }) : null;
    
    if (loading) {
      await loading.present();
    }

    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data || [];
        this.clientsFiltres = data || [];
        if (loading) {
          loading.dismiss();
        }
        this.isLoadingData = false;
      },
      error: (error) => {
        if (loading) {
          loading.dismiss();
        }
        this.clients = [];
        this.clientsFiltres = [];
        this.isLoadingData = false;
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        const errorMessage = error?.message || 'Erreur lors du chargement des clients';
        this.presentToast(errorMessage, 'danger');
      }
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterClients();
  }

  filterClients() {
    if (!this.searchTerm.trim()) {
      this.clientsFiltres = this.clients;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.clientsFiltres = this.clients.filter(
      (client) =>
        client.nomClient.toLowerCase().includes(term) ||
        client.prenomClient.toLowerCase().includes(term) ||
        client.telephone.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term)
    );
  }

  async editClient(client: Client) {
    if (client.idClient) {
      this.router.navigate(['/clients/edit', client.idClient]);
    }
  }

  async deleteClient(client: Client) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer le client "${client.prenomClient} ${client.nomClient}" ?`,
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

            if (client.idClient) {
              this.clientService.deleteClient(client.idClient).subscribe({
                next: () => {
                  loading.dismiss();
                  this.presentToast('Client supprimé avec succès', 'success');
                  // Recharger la liste depuis l'API
                  this.loadClients(false);
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

  addNewClient() {
    this.router.navigate(['/clients/new']);
  }

  getFullName(client: Client): string {
    return `${client.prenomClient} ${client.nomClient}`;
  }

  viewClient(client: Client) {
    if (client.idClient) {
      this.router.navigate(['/clients/detail', client.idClient]);
    }
  }
}

