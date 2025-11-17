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
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonIcon,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { save, arrowBack } from 'ionicons/icons';
import { UtilisateurService } from '../services/utilisateur.service';
import { Utilisateur } from '../models/utilisateur.model';
import { RoleService } from '../services/role.service';
import { Role as RoleModel } from '../models/role.model';

@Component({
  selector: 'app-form-utilisateur',
  templateUrl: 'form-utilisateur.page.html',
  styleUrls: ['form-utilisateur.page.scss'],
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
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonIcon,
    ReactiveFormsModule,
    CommonModule
  ],
})
export class FormUtilisateurPage implements OnInit {
  utilisateurForm: FormGroup;
  isEditMode = false;
  utilisateurId?: number;
  roles: RoleModel[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private utilisateurService: UtilisateurService,
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ save, arrowBack });
    
    this.utilisateurForm = this.formBuilder.group({
      nom_complet: ['', [Validators.required, Validators.minLength(3)]],
      login: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      mot_de_passe: ['', []],
      role: ['', [Validators.required]],
      telephone: ['', []],
      actif: [true, [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadRoles();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.utilisateurId = +id;
      this.loadUtilisateur(this.utilisateurId);
    } else {
      // Mode création - le mot de passe est requis
      this.utilisateurForm.get('mot_de_passe')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.utilisateurForm.get('mot_de_passe')?.updateValueAndValidity();
    }
  }

  loadRoles() {
    this.roleService.getActiveRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        // Si aucun rôle n'est sélectionné et qu'il y a des rôles, sélectionner le premier
        if (!this.utilisateurForm.get('role')?.value && roles.length > 0) {
          this.utilisateurForm.patchValue({ role: roles[0].code_role });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rôles:', error);
      }
    });
  }

  loadUtilisateur(id: number) {
    const loading = this.loadingController.create({
      message: 'Chargement...'
    });
    loading.then(l => l.present());

    this.utilisateurService.getUtilisateurById(id).subscribe({
      next: (utilisateur) => {
        this.utilisateurForm.patchValue({
          nom_complet: utilisateur.nom_complet,
          login: utilisateur.login,
          email: utilisateur.email || utilisateur.login, // Fallback sur login si email n'existe pas
          role: utilisateur.role,
          telephone: utilisateur.telephone || '',
          actif: utilisateur.actif
        });
        // En mode édition, le mot de passe n'est pas requis
        this.utilisateurForm.get('mot_de_passe')?.clearValidators();
        this.utilisateurForm.get('mot_de_passe')?.updateValueAndValidity();
        loading.then(l => l.dismiss());
      },
      error: (error) => {
        loading.then(l => l.dismiss());
        const errorMessage = error?.message || 'Erreur lors du chargement';
        this.presentToast(errorMessage, 'danger');
      }
    });
  }

  async onSubmit() {
    if (this.utilisateurForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEditMode ? 'Mise à jour...' : 'Création...'
      });
      await loading.present();

      const formValue = this.utilisateurForm.value;
      const utilisateur: Utilisateur = {
        nom_complet: formValue.nom_complet,
        login: formValue.login,
        email: formValue.email || undefined,
        mot_de_passe: formValue.mot_de_passe,
        role: formValue.role as any, // Le rôle est maintenant le code_role (string)
        telephone: formValue.telephone || undefined,
        actif: formValue.actif
      };

      if (this.isEditMode && this.utilisateurId) {
        // Mise à jour
        this.utilisateurService.updateUtilisateur(this.utilisateurId, utilisateur).subscribe({
          next: () => {
            loading.dismiss();
            this.presentToast('Utilisateur mis à jour avec succès', 'success');
            this.router.navigate(['/utilisateurs']);
          },
          error: (error) => {
            loading.dismiss();
            const errorMessage = error?.message || 'Erreur lors de la mise à jour';
            this.presentToast(errorMessage, 'danger');
          }
        });
      } else {
        // Création
        this.utilisateurService.createUtilisateur(utilisateur).subscribe({
          next: () => {
            loading.dismiss();
            this.presentToast('Utilisateur créé avec succès', 'success');
            this.router.navigate(['/utilisateurs']);
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
      Object.keys(this.utilisateurForm.controls).forEach(key => {
        this.utilisateurForm.get(key)?.markAsTouched();
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

  get nom_complet() {
    return this.utilisateurForm.get('nom_complet');
  }

  get login() {
    return this.utilisateurForm.get('login');
  }

  get email() {
    return this.utilisateurForm.get('email');
  }

  get mot_de_passe() {
    return this.utilisateurForm.get('mot_de_passe');
  }

  get role() {
    return this.utilisateurForm.get('role');
  }

  getRoleLabel(codeRole: string): string {
    const role = this.roles.find(r => r.code_role === codeRole);
    return role ? role.libelle_role : codeRole;
  }

  onCancel() {
    this.router.navigate(['/utilisateurs']);
  }
}

