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

  async loadClients() {
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.clientsFiltres = data;
        loading.dismiss();
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        loading.dismiss();
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
        client.nom_client.toLowerCase().includes(term) ||
        client.prenom_client.toLowerCase().includes(term) ||
        client.telephone.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term)
    );
  }

  async editClient(client: Client) {
    this.router.navigate(['/clients/edit', client.id_client]);
  }

  async deleteClient(client: Client) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer le client "${client.prenom_client} ${client.nom_client}" ?`,
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

            this.clientService.deleteClient(client.id_client!).subscribe({
              next: () => {
                loading.dismiss();
                this.presentToast('Client supprimé avec succès', 'success');
                // Retirer le client de la liste localement
                this.clients = this.clients.filter(c => c.id_client !== client.id_client);
                this.filterClients();
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

  addNewClient() {
    this.router.navigate(['/clients/new']);
  }

  getFullName(client: Client): string {
    return `${client.prenom_client} ${client.nom_client}`;
  }
}

