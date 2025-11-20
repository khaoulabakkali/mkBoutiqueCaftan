import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  LoadingController
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { save, arrowBack, checkmark, closeOutline } from 'ionicons/icons';
import { PaiementService } from '../services/paiement.service';
import { Paiement } from '../models/paiement.model';
import { ReservationService } from '../services/reservation.service';
import { Reservation } from '../models/reservation.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-form-paiement',
  templateUrl: 'form-paiement.page.html',
  styleUrls: ['form-paiement.page.scss'],
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
export class FormPaiementPage implements OnInit {
  paiementForm: FormGroup;
  isEditMode = false;
  paiementId?: number;
  reservations: Reservation[] = [];
  methodesPaiement: string[] = ['Espèces', 'Carte', 'Chèque', 'Virement', 'Autre'];

  constructor(
    private formBuilder: FormBuilder,
    private paiementService: PaiementService,
    private reservationService: ReservationService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ save, arrowBack, checkmark, closeOutline });
    
    this.paiementForm = this.formBuilder.group({
      idReservation: ['', [Validators.required]],
      montant: ['', [Validators.required, Validators.min(0.01)]],
      datePaiement: [new Date().toISOString().slice(0, 16), [Validators.required]],
      methodePaiement: [''],
      reference: ['']
    });
  }

  ngOnInit() {
    this.loadReservations();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.paiementId = +id;
      this.loadPaiement(this.paiementId);
    }
  }

  async loadReservations() {
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations = data || [];
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des réservations:', error);
        }
      }
    });
  }

  async loadPaiement(id: number) {
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.paiementService.getPaiementById(id).subscribe({
      next: (paiement) => {
        const datePaiement = paiement.datePaiement ? new Date(paiement.datePaiement).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);
        this.paiementForm.patchValue({
          idReservation: paiement.idReservation,
          montant: paiement.montant,
          datePaiement: datePaiement,
          methodePaiement: paiement.methodePaiement || '',
          reference: paiement.reference || ''
        });
        loading.dismiss();
      },
      error: (error) => {
        loading.dismiss();
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        const errorMessage = error?.message || 'Erreur lors du chargement';
        this.presentToast(errorMessage, 'danger');
      }
    });
  }

  async onSubmit() {
    if (this.paiementForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEditMode ? 'Mise à jour...' : 'Création...'
      });
      await loading.present();

      const formValue = this.paiementForm.value;
      const paiement: Paiement = {
        idReservation: formValue.idReservation,
        montant: parseFloat(formValue.montant),
        datePaiement: new Date(formValue.datePaiement).toISOString(),
        methodePaiement: formValue.methodePaiement || undefined,
        reference: formValue.reference || undefined
      };

      if (this.isEditMode && this.paiementId) {
        // Mise à jour
        this.paiementService.updatePaiement(this.paiementId, paiement).subscribe({
          next: () => {
            loading.dismiss();
            this.presentToast('Paiement mis à jour avec succès', 'success');
            this.router.navigate(['/paiements']);
          },
          error: (error) => {
            loading.dismiss();
            if (!environment.production) {
              console.error('Erreur lors de la mise à jour:', error);
            }
            const errorMessage = error?.message || 'Erreur lors de la mise à jour';
            this.presentToast(errorMessage, 'danger');
          }
        });
      } else {
        // Création
        this.paiementService.createPaiement(paiement).subscribe({
          next: () => {
            loading.dismiss();
            this.presentToast('Paiement créé avec succès', 'success');
            this.router.navigate(['/paiements']);
          },
          error: (error) => {
            loading.dismiss();
            if (!environment.production) {
              console.error('Erreur lors de la création:', error);
            }
            const errorMessage = error?.message || 'Erreur lors de la création';
            this.presentToast(errorMessage, 'danger');
          }
        });
      }
    } else {
      // Marquer tous les champs comme touchés
      Object.keys(this.paiementForm.controls).forEach(key => {
        this.paiementForm.get(key)?.markAsTouched();
      });
      this.presentToast('Veuillez remplir tous les champs requis', 'warning');
    }
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

  get idReservation() {
    return this.paiementForm.get('idReservation');
  }

  get montant() {
    return this.paiementForm.get('montant');
  }

  get datePaiement() {
    return this.paiementForm.get('datePaiement');
  }

  get methodePaiement() {
    return this.paiementForm.get('methodePaiement');
  }

  get reference() {
    return this.paiementForm.get('reference');
  }

  getReservationLabel(reservation: Reservation): string {
    if (!reservation.idReservation) return '';
    return `Réservation #${reservation.idReservation}`;
  }

  getReservationId(reservation: Reservation): number | undefined {
    return reservation.idReservation;
  }

  onCancel() {
    this.router.navigate(['/paiements']);
  }
}
