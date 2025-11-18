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
  IonIcon,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { save, arrowBack } from 'ionicons/icons';
import { PaiementService } from '../services/paiement.service';
import { Paiement } from '../models/paiement.model';

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
    IonIcon,
    ReactiveFormsModule,
    CommonModule
  ],
})
export class FormPaiementPage implements OnInit {
  paiementForm: FormGroup;
  isEditMode = false;
  paiementId?: number;

  constructor(
    private formBuilder: FormBuilder,
    private paiementService: PaiementService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ save, arrowBack });
    
    this.paiementForm = this.formBuilder.group({
      montant: ['', [Validators.required, Validators.min(0.01)]],
      reference_paiement: ['']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.paiementId = +id;
      this.loadPaiement(this.paiementId);
    }
  }

  async loadPaiement(id: number) {
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.paiementService.getPaiementById(id).subscribe({
      next: (paiement) => {
        this.paiementForm.patchValue({
          montant: paiement.montant,
          reference_paiement: paiement.reference_paiement || ''
        });
        loading.dismiss();
      },
      error: (error) => {
        loading.dismiss();
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
        montant: parseFloat(formValue.montant),
        reference_paiement: formValue.reference_paiement || undefined
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

  get montant() {
    return this.paiementForm.get('montant');
  }

  get reference_paiement() {
    return this.paiementForm.get('reference_paiement');
  }

  onCancel() {
    this.router.navigate(['/paiements']);
  }
}

