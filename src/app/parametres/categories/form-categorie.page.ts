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
  IonIcon,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { save, arrowBack } from 'ionicons/icons';
import { CategorieService } from '../../services/categorie.service';
import { Categorie } from '../../models/categorie.model';

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
    addIcons({ save, arrowBack });
    
    this.categorieForm = this.formBuilder.group({
      nom_categorie: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(500)]],
      ordre_affichage: [null, [Validators.min(0)]]
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
          nom_categorie: categorie.nom_categorie,
          description: categorie.description || '',
          ordre_affichage: categorie.ordre_affichage || null
        });
        loading.then(l => l.dismiss());
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
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
        ordre_affichage: this.categorieForm.value.ordre_affichage || undefined
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

  get nom_categorie() {
    return this.categorieForm.get('nom_categorie');
  }

  get description() {
    return this.categorieForm.get('description');
  }

  get ordre_affichage() {
    return this.categorieForm.get('ordre_affichage');
  }
}

