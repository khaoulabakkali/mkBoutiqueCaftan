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
      idClient: ['', [Validators.required]],
      dateReservation: [new Date().toISOString().slice(0, 16), [Validators.required]],
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]],
      montantTotal: [0, [Validators.required, Validators.min(0)]],
      statutReservation: ['En attente', [Validators.required]],
      idPaiement: ['', []],
      remiseAppliquee: [0, [Validators.required, Validators.min(0)]]
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
            this.reservationForm.patchValue({ idClient: +clientId });
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
        if (!clientId && !this.reservationForm.get('idClient')?.value && data.length > 0) {
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
    const clientId = this.reservationForm.get('idClient')?.value;
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
          this.reservationForm.patchValue({ idClient: data.data.clientId });
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
        const dateReservation = reservation.dateReservation ? new Date(reservation.dateReservation).toISOString().slice(0, 16) : '';
        // Formater les dates pour les inputs de type "date" (format YYYY-MM-DD)
        const dateDebut = reservation.dateDebut ? new Date(reservation.dateDebut).toISOString().slice(0, 10) : '';
        const dateFin = reservation.dateFin ? new Date(reservation.dateFin).toISOString().slice(0, 10) : '';
        
        this.reservationForm.patchValue({
          idClient: reservation.idClient,
          dateReservation: dateReservation,
          dateDebut: dateDebut,
          dateFin: dateFin,
          montantTotal: reservation.montantTotal,
          statutReservation: reservation.statutReservation,
          idPaiement: reservation.idPaiement || '',
          remiseAppliquee: reservation.remiseAppliquee || 0
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
        idClient: formValue.idClient,
        dateReservation: formValue.dateReservation,
        dateDebut: formValue.dateDebut,
        dateFin: formValue.dateFin,
        montantTotal: parseFloat(formValue.montantTotal),
        statutReservation: formValue.statutReservation,
        idPaiement: formValue.idPaiement || undefined,
        remiseAppliquee: parseFloat(formValue.remiseAppliquee) || 0
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

  get idClient() {
    return this.reservationForm.get('idClient');
  }

  get dateReservation() {
    return this.reservationForm.get('dateReservation');
  }

  get dateDebut() {
    return this.reservationForm.get('dateDebut');
  }

  get dateFin() {
    return this.reservationForm.get('dateFin');
  }

  get montantTotal() {
    return this.reservationForm.get('montantTotal');
  }

  get statutReservation() {
    return this.reservationForm.get('statutReservation');
  }

  get remiseAppliquee() {
    return this.reservationForm.get('remiseAppliquee');
  }

  onCancel() {
    this.router.navigate(['/reservations']);
  }
}

