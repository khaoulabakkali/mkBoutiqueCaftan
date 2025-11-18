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
import { save, arrowBack, checkmark } from 'ionicons/icons';
import { UtilisateurService } from '../services/utilisateur.service';
import { Utilisateur, CreateUserRequest } from '../models/utilisateur.model';
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
    IonButtons,
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
    addIcons({ save, arrowBack, checkmark });
    
    this.utilisateurForm = this.formBuilder.group({
      nomComplet: ['', [Validators.required, Validators.minLength(3)]],
      login: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', []],
      idRole: ['', [Validators.required]],
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
      this.utilisateurForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.utilisateurForm.get('password')?.updateValueAndValidity();
    }
  }

  loadRoles() {
    this.roleService.getActiveRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        // Si aucun rôle n'est sélectionné et qu'il y a des rôles, sélectionner le premier
        if (!this.utilisateurForm.get('idRole')?.value && roles.length > 0) {
          this.utilisateurForm.patchValue({ role: roles[0].idRole });
        }
      },
      error: (error) => {
        // Erreur silencieuse - les rôles ne sont pas critiques
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
        // Convertir le rôle en nomRole pour le formulaire
        let roleValue = '';
        if (typeof utilisateur.role === 'string') {
          roleValue = utilisateur.role;
        } else if (utilisateur.role && typeof utilisateur.role === 'object' && 'nomRole' in utilisateur.role) {
          roleValue = (utilisateur.role as any).nomRole;
        }
        
        this.utilisateurForm.patchValue({
          nomComplet: utilisateur.nomComplet,
          login: utilisateur.login,
          email: utilisateur.email || utilisateur.login, // Fallback sur login si email n'existe pas
          idRole: roleValue,
          telephone: utilisateur.telephone || '',
          actif: utilisateur.actif
        });
        // En mode édition, le mot de passe n'est pas requis
        this.utilisateurForm.get('password')?.clearValidators();
        this.utilisateurForm.get('password')?.updateValueAndValidity();
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
    console.log(this.utilisateurForm)
    if (this.utilisateurForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEditMode ? 'Mise à jour...' : 'Création...'
      });
      await loading.present();

      const formValue = this.utilisateurForm.value;
    
      const utilisateur: CreateUserRequest = {
        nomComplet: formValue.nomComplet,
        login: formValue.login,
        email: formValue.email || undefined,
        password: formValue.password,
        idRole: formValue.idRole || 1, // Fallback à 0 si non trouvé (sera géré par le backend)
        telephone: formValue.telephone || undefined,
        actif: formValue.actif
      };

      console.debug('Form value', formValue);
      console.debug('Payload utilisateur', utilisateur);

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

  get nomComplet() {
    return this.utilisateurForm.get('nomComplet');
  }

  get login() {
    return this.utilisateurForm.get('login');
  }

  get email() {
    return this.utilisateurForm.get('email');
  }

  get password() {
    return this.utilisateurForm.get('password');
  }

  get role() {
    return this.utilisateurForm.get('idRole');
  }

  getRoleLabel(nomRole: string): string {
    const role = this.roles.find(r => r.nomRole === nomRole);
    return role ? role.nomRole : nomRole;
  }

  onCancel() {
    this.router.navigate(['/utilisateurs']);
  }
}

