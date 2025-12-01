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
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonList,
  IonSpinner,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { arrowBack, create, shieldCheckmark, checkmarkCircle, closeCircle, informationCircle, person, personOutline } from 'ionicons/icons';
import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role.model';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur } from '../../models/utilisateur.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-detail-role',
  templateUrl: 'detail-role.page.html',
  styleUrls: ['detail-role.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonMenuButton,
    IonItem,
    IonLabel,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonList,
    IonSpinner,
    CommonModule,
    TranslateModule
  ],
})
export class DetailRolePage implements OnInit {
  role: Role | null = null;
  utilisateurs: Utilisateur[] = [];
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private utilisateurService: UtilisateurService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ arrowBack, create, shieldCheckmark, checkmarkCircle, closeCircle, informationCircle, person, personOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRole(+id);
    } else {
      this.presentToast('ID rôle manquant', 'danger');
      this.router.navigate(['/parametres/roles']);
    }
  }

  async loadRole(id: number) {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.roleService.getRoleById(id).subscribe({
      next: (data) => {
        this.role = data || null;
        if (this.role) {
          this.loadUtilisateurs();
        }
        this.isLoading = false;
        loading.dismiss();
      },
      error: async (error) => {
        this.isLoading = false;
        loading.dismiss();
        const errorMessage = error?.message || 'Erreur lors du chargement du rôle';
        await this.presentToast(errorMessage, 'danger');
        this.router.navigate(['/parametres/roles']);
      }
    });
  }

  loadUtilisateurs() {
    if (!this.role?.idRole) return;

    this.utilisateurService.getUtilisateursByRole(this.role.idRole).subscribe({
      next: (data) => {
        this.utilisateurs = data || [];
      },
      error: (error) => {
        this.utilisateurs = [];
        if (!environment.production) {
          console.error('Erreur lors du chargement des utilisateurs:', error);
        }
      }
    });
  }

  viewUtilisateur(utilisateur: Utilisateur) {
    if (utilisateur.idUtilisateur) {
      this.router.navigate(['/utilisateurs/detail', utilisateur.idUtilisateur]);
    }
  }

  editRole() {
    if (this.role?.idRole) {
      this.router.navigate(['/parametres/roles/edit', this.role.idRole]);
    }
  }

  goBack() {
    this.router.navigate(['/parametres/roles']);
  }

  private async presentToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}

