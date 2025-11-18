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
  IonIcon,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { save, arrowBack, checkmark } from 'ionicons/icons';
import { CategorieService } from '../../services/categorie.service';
import { Categorie } from '../../models/categorie.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-form-categorie',
  templateUrl: 'form-categorie.page.html',
  styleUrls: ['form-categorie.page.scss'],
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
    IonIcon,
    ReactiveFormsModule,
    CommonModule
  ],
})
export class FormCategoriePage implements OnInit {
  categorieForm: FormGroup;
  isEditMode = false;
  categorieId?: number;
  
  // Exposer router pour le template
  router = this.routerInstance;

  constructor(
    private formBuilder: FormBuilder,
    private categorieService: CategorieService,
    private routerInstance: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ save, arrowBack, checkmark });
    
    this.categorieForm = this.formBuilder.group({
      nomCategorie: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(500)]],
      ordreAffichage: [null, [Validators.min(0)]]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.categorieId = +id;
      this.loadCategorie();
    }
  }

  loadCategorie() {
    if (!this.categorieId) return;

    const loading = this.loadingController.create({
      message: 'Chargement...'
    });
    loading.then(l => l.present());

    this.categorieService.getCategorieById(this.categorieId).subscribe({
      next: (categorie) => {
        this.categorieForm.patchValue({
          nomCategorie: categorie.nomCategorie,
          description: categorie.description || '',
          ordreAffichage: categorie.ordreAffichage || null
        });
        loading.then(l => l.dismiss());
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        loading.then(l => l.dismiss());
        this.showToast('Erreur lors du chargement de la catégorie', 'danger');
        this.routerInstance.navigate(['/parametres/categories']);
      }
    });
  }

  async onSubmit() {
    if (this.categorieForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEditMode ? 'Modification...' : 'Création...'
      });
      await loading.present();

      const categorieData: Categorie = {
        ...this.categorieForm.value,
        ordreAffichage: this.categorieForm.value.ordreAffichage || undefined
      };

      if (this.isEditMode && this.categorieId) {
        this.categorieService.updateCategorie(this.categorieId, categorieData).subscribe({
          next: () => {
            loading.dismiss();
            this.showToast('Catégorie modifiée avec succès', 'success');
            this.routerInstance.navigate(['/parametres/categories']);
          },
          error: (error) => {
            loading.dismiss();
            const errorMessage = error?.message || 'Erreur lors de la modification';
            this.showToast(errorMessage, 'danger');
          }
        });
      } else {
        this.categorieService.createCategorie(categorieData).subscribe({
          next: () => {
            loading.dismiss();
            this.showToast('Catégorie créée avec succès', 'success');
            this.routerInstance.navigate(['/parametres/categories']);
          },
          error: (error) => {
            loading.dismiss();
            const errorMessage = error?.message || 'Erreur lors de la création';
            this.showToast(errorMessage, 'danger');
          }
        });
      }
    } else {
      Object.keys(this.categorieForm.controls).forEach(key => {
        this.categorieForm.get(key)?.markAsTouched();
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

  get nomCategorie() {
    return this.categorieForm.get('nomCategorie');
  }

  get description() {
    return this.categorieForm.get('description');
  }

  get ordreAffichage() {
    return this.categorieForm.get('ordreAffichage');
  }
}

