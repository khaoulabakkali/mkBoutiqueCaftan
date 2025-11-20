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
  IonTextarea,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonIcon,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { save, arrowBack, checkmark, closeOutline } from 'ionicons/icons';
import { SocieteService } from '../../services/societe.service';
import { Societe } from '../../models/societe.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-form-societe',
  templateUrl: 'form-societe.page.html',
  styleUrls: ['form-societe.page.scss'],
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
    IonTextarea,
    IonButton,
    IonButtons,
    IonCheckbox,
    IonIcon,
    ReactiveFormsModule,
    CommonModule
  ],
})
export class FormSocietePage implements OnInit {
  societeForm: FormGroup;
  isEditMode = false;
  societeId?: number;
  
  router = this.routerInstance;

  constructor(
    private formBuilder: FormBuilder,
    private societeService: SocieteService,
    private routerInstance: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ save, arrowBack, checkmark, closeOutline });
    
    this.societeForm = this.formBuilder.group({
      nomSociete: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      adresse: ['', [Validators.maxLength(500)]],
      telephone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      siteWeb: ['', [Validators.maxLength(200)]],
      logo: ['', []],
      actif: [true, [Validators.required]]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.societeId = +id;
      this.loadSociete();
    }
  }

  loadSociete() {
    if (!this.societeId) return;

    const loading = this.loadingController.create({
      message: 'Chargement...'
    });
    loading.then(l => l.present());

    this.societeService.getSocieteById(this.societeId).subscribe({
      next: (societe) => {
        this.societeForm.patchValue({
          nomSociete: societe.nomSociete,
          description: societe.description || '',
          adresse: societe.adresse || '',
          telephone: societe.telephone || '',
          email: societe.email || '',
          siteWeb: societe.siteWeb || '',
          logo: societe.logo || '',
          actif: societe.actif
        });
        loading.then(l => l.dismiss());
      },
      error: (error) => {
        loading.then(l => l.dismiss());
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        const errorMessage = error?.message || 'Erreur lors du chargement';
        this.presentToast(errorMessage, 'danger');
      }
    });
  }

  async onSubmit() {
    if (this.societeForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEditMode ? 'Modification...' : 'Création...'
      });
      await loading.present();

      const formValue = this.societeForm.value;
      const societe: Societe = {
        nomSociete: formValue.nomSociete,
        description: formValue.description || undefined,
        adresse: formValue.adresse || undefined,
        telephone: formValue.telephone || undefined,
        email: formValue.email || undefined,
        siteWeb: formValue.siteWeb || undefined,
        logo: formValue.logo || undefined,
        actif: formValue.actif
      };

      if (this.isEditMode && this.societeId) {
        this.societeService.updateSociete(this.societeId, societe).subscribe({
          next: () => {
            loading.dismiss();
            this.presentToast('Société modifiée avec succès', 'success');
            this.router.navigate(['/parametres/societes/detail', this.societeId]);
          },
          error: (error) => {
            loading.dismiss();
            if (!environment.production) {
              console.error('Erreur lors de la modification:', error);
            }
            const errorMessage = error?.message || 'Erreur lors de la modification';
            this.presentToast(errorMessage, 'danger');
          }
        });
      } else {
        this.societeService.createSociete(societe).subscribe({
          next: (createdSociete) => {
            loading.dismiss();
            this.presentToast('Société créée avec succès', 'success');
            if (createdSociete?.idSociete) {
              this.router.navigate(['/parametres/societes/detail', createdSociete.idSociete]);
            } else {
              // Si pas d'ID, rediriger vers l'accueil
              this.router.navigate(['/tabs/tab1']);
            }
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
      Object.keys(this.societeForm.controls).forEach(key => {
        this.societeForm.get(key)?.markAsTouched();
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

  get nomSociete() {
    return this.societeForm.get('nomSociete');
  }

  get description() {
    return this.societeForm.get('description');
  }

  get email() {
    return this.societeForm.get('email');
  }

  onCancel() {
    if (this.isEditMode && this.societeId) {
      this.router.navigate(['/parametres/societes/detail', this.societeId]);
    } else {
      this.router.navigate(['/tabs/tab1']);
    }
  }
}

