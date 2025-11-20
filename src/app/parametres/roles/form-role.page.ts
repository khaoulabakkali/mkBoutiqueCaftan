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
import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-form-role',
  templateUrl: 'form-role.page.html',
  styleUrls: ['form-role.page.scss'],
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
export class FormRolePage implements OnInit {
  roleForm: FormGroup;
  isEditMode = false;
  roleId?: number;
  
  // Exposer router pour le template
  router = this.routerInstance;

  constructor(
    private formBuilder: FormBuilder,
    private roleService: RoleService,
    private routerInstance: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ save, arrowBack, checkmark, closeOutline });
    
    this.roleForm = this.formBuilder.group({
      nomRole: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      actif: [true, [Validators.required]]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.roleId = +id;
      this.loadRole();
    }
  }

  loadRole() {
    if (!this.roleId) return;

    const loading = this.loadingController.create({
      message: 'Chargement...'
    });
    loading.then(l => l.present());

    this.roleService.getRoleById(this.roleId).subscribe({
      next: (role) => {
        this.roleForm.patchValue({
          nomRole: role.nomRole,
          description: role.description || '',
          actif: role.actif
        });
        loading.then(l => l.dismiss());
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        loading.then(l => l.dismiss());
        this.showToast('Erreur lors du chargement du rôle', 'danger');
        this.routerInstance.navigate(['/parametres/roles']);
      }
    });
  }

  async onSubmit() {
    if (this.roleForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEditMode ? 'Modification...' : 'Création...'
      });
      await loading.present();

      const roleData: Role = this.roleForm.value;

      if (this.isEditMode && this.roleId) {
        this.roleService.updateRole(this.roleId, roleData).subscribe({
          next: () => {
            loading.dismiss();
            this.showToast('Rôle modifié avec succès', 'success');
            this.routerInstance.navigate(['/parametres/roles']);
          },
          error: (error) => {
            loading.dismiss();
            const errorMessage = error?.message || 'Erreur lors de la modification';
            this.showToast(errorMessage, 'danger');
          }
        });
      } else {
        this.roleService.createRole(roleData).subscribe({
          next: () => {
            loading.dismiss();
            this.showToast('Rôle créé avec succès', 'success');
            this.routerInstance.navigate(['/parametres/roles']);
          },
          error: (error) => {
            loading.dismiss();
            const errorMessage = error?.message || 'Erreur lors de la création';
            this.showToast(errorMessage, 'danger');
          }
        });
      }
    } else {
      Object.keys(this.roleForm.controls).forEach(key => {
        this.roleForm.get(key)?.markAsTouched();
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

  get nomRole() {
    return this.roleForm.get('nomRole');
  }

  get description() {
    return this.roleForm.get('description');
  }

  get actif() {
    return this.roleForm.get('actif');
  }

  onCancel() {
    this.routerInstance.navigate(['/parametres/roles']);
  }
}

