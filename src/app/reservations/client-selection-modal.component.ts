import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { close, add, person } from 'ionicons/icons';
import { Client } from '../models/client.model';

@Component({
  selector: 'app-client-selection-modal',
  templateUrl: 'client-selection-modal.component.html',
  styleUrls: ['client-selection-modal.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    CommonModule,
    FormsModule
  ],
})
export class ClientSelectionModalComponent implements OnInit {
  @Input() clients: Client[] = [];
  @Input() searchTerm: string = '';
  
  clientsFiltres: Client[] = [];

  constructor(private modalController: ModalController) {
    addIcons({ close, add, person });
  }

  ngOnInit() {
    this.clientsFiltres = this.clients;
    if (this.searchTerm) {
      this.filterClients();
    }
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
        client.telephone.toLowerCase().includes(term)
    );
  }

  selectClient(clientId: number) {
    this.modalController.dismiss({ action: 'select', clientId });
  }

  addNewClient() {
    this.modalController.dismiss({ action: 'new' });
  }

  close() {
    this.modalController.dismiss();
  }

  getClientName(client: Client): string {
    return `${client.prenomClient} ${client.nomClient}`;
  }
}

