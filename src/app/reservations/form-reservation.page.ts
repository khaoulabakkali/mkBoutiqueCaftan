import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonMenuButton,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonIcon,
  IonSelect,
  IonSelectOption,
  ToastController,
  LoadingController,
  ModalController
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { save, arrowBack, add, chevronDown, checkmark } from 'ionicons/icons';
import { ReservationService } from '../services/reservation.service';
import { Reservation, StatutReservation } from '../models/reservation.model';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';
import { ClientSelectionModalComponent } from './client-selection-modal.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-form-reservation',
  templateUrl: 'form-reservation.page.html',
  styleUrls: ['form-reservation.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonMenuButton,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons,
    IonIcon,
    IonSelect,
    IonSelectOption,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
})
export class FormReservationPage implements OnInit, OnDestroy {
  reservationForm: FormGroup;
  isEditMode = false;
  reservationId?: number;
  clients: Client[] = [];
  statuts: StatutReservation[] = ['En attente', 'Confirmée', 'En cours', 'Terminée', 'Annulée'];
  private queryParamsSubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private reservationService: ReservationService,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {
    addIcons({ save, arrowBack, add, chevronDown, checkmark });
    
    this.reservationForm = this.formBuilder.group({
      id_client: ['', [Validators.required]],
      date_reservation: [new Date().toISOString().slice(0, 16), [Validators.required]],
      date_debut: ['', [Validators.required]],
      date_fin: ['', [Validators.required]],
      montant_total: [0, [Validators.required, Validators.min(0)]],
      statut_reservation: ['En attente', [Validators.required]],
      id_paiement: ['', []],
      remise_appliquee: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadClients();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.reservationId = +id;
      this.loadReservation();
    } else {
      // Vérifier si un clientId a été passé en paramètre (après création d'un client)
      this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
        const clientId = params['clientId'];
        if (clientId) {
          // Recharger les clients pour inclure le nouveau
          this.loadClients();
          // Sélectionner le nouveau client après le chargement
          setTimeout(() => {
            this.reservationForm.patchValue({ id_client: +clientId });
          }, 500);
        }
      });
    }
  }

  ngOnDestroy() {
    // Désabonner pour éviter les fuites mémoire
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  loadClients() {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
        // Si un clientId a été passé en paramètre, ne pas sélectionner automatiquement
        const clientId = this.route.snapshot.queryParams['clientId'];
        if (!clientId && !this.reservationForm.get('id_client')?.value && data.length > 0) {
          // Ne pas sélectionner automatiquement le premier client
        }
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des clients:', error);
        }
      }
    });
  }

  getSelectedClientName(): string {
    const clientId = this.reservationForm.get('id_client')?.value;
    if (!clientId) return '';
    
    const client = this.clients.find(c => c.idClient === clientId);
    return client ? `${client.prenomClient} ${client.nomClient} - ${client.telephone}` : '';
  }

  async openClientModal() {
    // Recharger les clients avant d'ouvrir le modal pour avoir la liste à jour
    await new Promise<void>((resolve) => {
      this.clientService.getAllClients().subscribe({
        next: (data) => {
          this.clients = data;
          resolve();
        },
        error: (error) => {
          if (!environment.production) {
          console.error('Erreur lors du chargement des clients:', error);
        }
          resolve(); // Continuer même en cas d'erreur
        }
      });
    });
    
    const modal = await this.modalController.create({
      component: ClientSelectionModalComponent,
      componentProps: {
        clients: this.clients,
        searchTerm: ''
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        if (data.data.action === 'select' && data.data.clientId) {
          this.reservationForm.patchValue({ id_client: data.data.clientId });
        } else if (data.data.action === 'new') {
          this.addNewClient();
        }
      }
    });

    await modal.present();
  }

  addNewClient() {
    // Le modal est déjà fermé à ce stade (appelé depuis onDidDismiss)
    // Construire le chemin de base à partir des segments d'URL (non encodés)
    const urlSegments = this.route.snapshot.url.map(segment => segment.path);
    let currentRoute = '/' + urlSegments.join('/');
    
    // Si on est en mode édition, remplacer 'edit' et l'ID par 'new'
    if (this.isEditMode && this.reservationId) {
      currentRoute = '/reservations/new';
    }
    
    // Naviguer vers le formulaire de client avec le paramètre returnTo
    // Utiliser un tableau de segments pour éviter les problèmes d'encodage
    this.router.navigate(['/clients', 'new'], { 
      queryParams: { returnTo: currentRoute }
    });
  }

  loadReservation() {
    if (!this.reservationId) return;

    const loading = this.loadingController.create({
      message: 'Chargement...'
    });
    loading.then(l => l.present());

    this.reservationService.getReservationById(this.reservationId).subscribe({
      next: (reservation) => {
        // Formater les dates pour les inputs
        const dateReservation = reservation.date_reservation ? new Date(reservation.date_reservation).toISOString().slice(0, 16) : '';
        
        this.reservationForm.patchValue({
          id_client: reservation.id_client,
          date_reservation: dateReservation,
          date_debut: reservation.date_debut,
          date_fin: reservation.date_fin,
          montant_total: reservation.montant_total,
          statut_reservation: reservation.statut_reservation,
          id_paiement: reservation.id_paiement || '',
          remise_appliquee: reservation.remise_appliquee || 0
        });
        loading.then(l => l.dismiss());
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        loading.then(l => l.dismiss());
        this.showToast('Erreur lors du chargement de la réservation', 'danger');
        this.router.navigate(['/reservations']);
      }
    });
  }

  async onSubmit() {
    if (this.reservationForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEditMode ? 'Modification...' : 'Création...'
      });
      await loading.present();

      const formValue = this.reservationForm.value;
      const reservationData: Reservation = {
        id_client: formValue.id_client,
        date_reservation: formValue.date_reservation,
        date_debut: formValue.date_debut,
        date_fin: formValue.date_fin,
        montant_total: parseFloat(formValue.montant_total),
        statut_reservation: formValue.statut_reservation,
        id_paiement: formValue.id_paiement || undefined,
        remise_appliquee: parseFloat(formValue.remise_appliquee) || 0
      };

      if (this.isEditMode && this.reservationId) {
        this.reservationService.updateReservation(this.reservationId, reservationData).subscribe({
          next: () => {
            loading.dismiss();
            this.showToast('Réservation modifiée avec succès', 'success');
            this.router.navigate(['/reservations']);
          },
          error: (error) => {
            loading.dismiss();
            const errorMessage = error?.message || 'Erreur lors de la modification';
            this.showToast(errorMessage, 'danger');
          }
        });
      } else {
        this.reservationService.createReservation(reservationData).subscribe({
          next: () => {
            loading.dismiss();
            this.showToast('Réservation créée avec succès', 'success');
            this.router.navigate(['/reservations']);
          },
          error: (error) => {
            loading.dismiss();
            const errorMessage = error?.message || 'Erreur lors de la création';
            this.showToast(errorMessage, 'danger');
          }
        });
      }
    } else {
      Object.keys(this.reservationForm.controls).forEach(key => {
        this.reservationForm.get(key)?.markAsTouched();
      });
      this.showToast('Veuillez remplir tous les champs requis', 'warning');
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  get id_client() {
    return this.reservationForm.get('id_client');
  }

  get date_reservation() {
    return this.reservationForm.get('date_reservation');
  }

  get date_debut() {
    return this.reservationForm.get('date_debut');
  }

  get date_fin() {
    return this.reservationForm.get('date_fin');
  }

  get montant_total() {
    return this.reservationForm.get('montant_total');
  }

  get statut_reservation() {
    return this.reservationForm.get('statut_reservation');
  }

  get remise_appliquee() {
    return this.reservationForm.get('remise_appliquee');
  }

  onCancel() {
    this.router.navigate(['/reservations']);
  }
}

