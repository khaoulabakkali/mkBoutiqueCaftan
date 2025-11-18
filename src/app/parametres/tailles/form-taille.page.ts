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
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { save, arrowBack, checkmark } from 'ionicons/icons';
import { TailleService } from '../../services/taille.service';
import { Taille } from '../../models/taille.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-form-taille',
  templateUrl: 'form-taille.page.html',
  styleUrls: ['form-taille.page.scss'],
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
    ReactiveFormsModule,
    CommonModule
  ],
})
export class FormTaillePage implements OnInit {
  tailleForm: FormGroup;
  isEditMode = false;
  tailleId?: number;
  
  // Exposer router pour le template
  router = this.routerInstance;

  constructor(
    private formBuilder: FormBuilder,
    private tailleService: TailleService,
    private routerInstance: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ save, arrowBack, checkmark });
    
    this.tailleForm = this.formBuilder.group({
      taille: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.tailleId = +id;
      this.loadTaille();
    }
  }

  loadTaille() {
    if (!this.tailleId) return;

    const loading = this.loadingController.create({
      message: 'Chargement...'
    });
    loading.then(l => l.present());

    this.tailleService.getTailleById(this.tailleId).subscribe({
      next: (taille) => {
        this.tailleForm.patchValue({
          taille: taille.taille
        });
        loading.then(l => l.dismiss());
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        loading.then(l => l.dismiss());
        this.showToast('Erreur lors du chargement de la taille', 'danger');
        this.routerInstance.navigate(['/parametres/tailles']);
      }
    });
  }

  async onSubmit() {
    if (this.tailleForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEditMode ? 'Modification...' : 'Création...'
      });
      await loading.present();

      const tailleData: Taille = this.tailleForm.value;

      if (this.isEditMode && this.tailleId) {
        this.tailleService.updateTaille(this.tailleId, tailleData).subscribe({
          next: () => {
            loading.dismiss();
            this.showToast('Taille modifiée avec succès', 'success');
            this.routerInstance.navigate(['/parametres/tailles']);
          },
          error: (error) => {
            loading.dismiss();
            const errorMessage = error?.message || 'Erreur lors de la modification';
            this.showToast(errorMessage, 'danger');
          }
        });
      } else {
        this.tailleService.createTaille(tailleData).subscribe({
          next: () => {
            loading.dismiss();
            this.showToast('Taille créée avec succès', 'success');
            this.routerInstance.navigate(['/parametres/tailles']);
          },
          error: (error) => {
            loading.dismiss();
            const errorMessage = error?.message || 'Erreur lors de la création';
            this.showToast(errorMessage, 'danger');
          }
        });
      }
    } else {
      Object.keys(this.tailleForm.controls).forEach(key => {
        this.tailleForm.get(key)?.markAsTouched();
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

  get taille() {
    return this.tailleForm.get('taille');
  }
}

