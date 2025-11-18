import { Injectable } from '@angular/core';
import { Observable, throwError, of, delay } from 'rxjs';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly STORAGE_KEY = 'local_clients';

  constructor() {
    // Initialiser le stockage local avec des données de démonstration si vide
    this.initializeLocalStorage();
  }

  /**
   * Initialise le stockage local avec des données de démonstration
   */
  private initializeLocalStorage(): void {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (!existing) {
      const defaultClients: Client[] = [
        {
          id_client: 1,
          nom_client: 'Alami',
          prenom_client: 'Fatima',
          telephone: '+212 6 11 22 33 44',
          email: 'fatima.alami@example.com',
          adresse_principale: '123 Rue Mohammed V, Casablanca',
          total_commandes: 5,
          date_creation_fiche: new Date().toISOString()
        },
        {
          id_client: 2,
          nom_client: 'Benali',
          prenom_client: 'Ahmed',
          telephone: '+212 6 22 33 44 55',
          email: 'ahmed.benali@example.com',
          adresse_principale: '456 Avenue Hassan II, Rabat',
          total_commandes: 3,
          date_creation_fiche: new Date().toISOString()
        },
        {
          id_client: 3,
          nom_client: 'Idrissi',
          prenom_client: 'Sanae',
          telephone: '+212 6 33 44 55 66',
          email: 'sanae.idrissi@example.com',
          adresse_principale: '789 Boulevard Zerktouni, Casablanca',
          total_commandes: 8,
          date_creation_fiche: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultClients));
    }
  }

  /**
   * Récupère tous les clients du stockage local
   */
  private getLocalClients(): Client[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Sauvegarde les clients dans le stockage local
   */
  private saveLocalClients(clients: Client[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clients));
  }

  /**
   * Génère un nouvel ID pour un client
   */
  private getNextId(): number {
    const clients = this.getLocalClients();
    if (clients.length === 0) return 1;
    return Math.max(...clients.map(c => c.id_client || 0)) + 1;
  }

  /**
   * Récupérer tous les clients (local)
   */
  getAllClients(): Observable<Client[]> {
    const clients = this.getLocalClients();
    return of(clients).pipe(delay(300));
  }

  /**
   * Récupérer un client par ID (local)
   */
  getClientById(id: number): Observable<Client> {
    const clients = this.getLocalClients();
    const client = clients.find(c => c.id_client === id);
    
    if (!client) {
      return throwError(() => new Error(`Client avec l'ID ${id} non trouvé`));
    }
    
    return of({ ...client }).pipe(delay(200));
  }

  /**
   * Créer un nouveau client (local)
   */
  createClient(client: Client): Observable<Client> {
    const clients = this.getLocalClients();
    
    // Vérifier si le téléphone existe déjà
    if (clients.some(c => c.telephone === client.telephone)) {
      return throwError(() => new Error('Un client avec ce numéro de téléphone existe déjà'));
    }
    
    // Créer le nouveau client
    const newClient: Client = {
      ...client,
      id_client: this.getNextId(),
      total_commandes: client.total_commandes || 0,
      date_creation_fiche: new Date().toISOString()
    };
    
    clients.push(newClient);
    this.saveLocalClients(clients);
    
    return of({ ...newClient }).pipe(delay(300));
  }

  /**
   * Mettre à jour un client (local)
   */
  updateClient(id: number, client: Client): Observable<Client> {
    const clients = this.getLocalClients();
    const index = clients.findIndex(c => c.id_client === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Client avec l'ID ${id} non trouvé`));
    }
    
    // Vérifier si le téléphone existe déjà pour un autre client
    const existingClient = clients.find(c => c.telephone === client.telephone && c.id_client !== id);
    if (existingClient) {
      return throwError(() => new Error('Un client avec ce numéro de téléphone existe déjà'));
    }
    
    // Mettre à jour le client
    const updatedClient: Client = {
      ...clients[index],
      ...client,
      id_client: id // S'assurer que l'ID ne change pas
    };
    
    clients[index] = updatedClient;
    this.saveLocalClients(clients);
    
    return of({ ...updatedClient }).pipe(delay(300));
  }

  /**
   * Supprimer un client (local)
   */
  deleteClient(id: number): Observable<boolean> {
    const clients = this.getLocalClients();
    const index = clients.findIndex(c => c.id_client === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Client avec l'ID ${id} non trouvé`));
    }
    
    clients.splice(index, 1);
    this.saveLocalClients(clients);
    
    return of(true).pipe(delay(300));
  }
}

