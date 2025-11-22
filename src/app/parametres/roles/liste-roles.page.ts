import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonMenuButton,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonBadge,
  IonButtons,
  IonSpinner,
  IonAlert,
  AlertController,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  add, 
  create, 
  trash, 
  eyeOff, 
  eye, 
  search, 
  shieldOutline,
  checkmarkCircle,
  closeCircle,
  informationCircle
} from 'ionicons/icons';
import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-liste-roles',
  templateUrl: 'liste-roles.page.html',
  styleUrls: ['liste-roles.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonMenuButton,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonBadge,
    IonButtons,
    IonSpinner,
    CommonModule,
    FormsModule
  ],
})
export class ListeRolesPage implements OnInit {
  roles: Role[] = [];
  rolesFiltres: Role[] = [];
  searchTerm: string = '';
  isLoading = false;
  private isLoadingData = false;

  constructor(
    private roleService: RoleService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ 
      add, 
      create, 
      trash, 
      eyeOff, 
      eye, 
      search, 
      shieldOutline,
      checkmarkCircle,
      closeCircle,
      informationCircle
    });
  }

  ngOnInit() {
    this.loadRoles();
  }

  ionViewWillEnter() {
    // Recharger les données chaque fois que la page est sur le point d'être affichée
    // Cela garantit que les modifications effectuées ailleurs sont reflétées
    // Ne pas afficher le loading si on revient juste de la modification
    this.loadRoles(false);
  }

  async loadRoles(showLoading = true) {
    if (this.isLoadingData) return;
    
    this.isLoadingData = true;
    this.isLoading = true;
    const loading = showLoading ? await this.loadingController.create({
      message: 'Chargement...'
    }) : null;
    
    if (loading) {
      await loading.present();
    }

    this.roleService.getAllRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.rolesFiltres = data;
        if (loading) {
          loading.dismiss();
        }
        this.isLoadingData = false;
        this.isLoading = false;
      },
      error: (error) => {
        if (loading) {
          loading.dismiss();
        }
        this.roles = [];
        this.rolesFiltres = [];
        this.isLoadingData = false;
        this.isLoading = false;
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        const errorMessage = error?.message || 'Erreur lors du chargement des rôles';
        this.presentToast(errorMessage, 'danger');
      }
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterRoles();
  }

  filterRoles() {
    if (!this.searchTerm.trim()) {
      this.rolesFiltres = this.roles;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.rolesFiltres = this.roles.filter(
      (role) =>
        role.nomRole.toLowerCase().includes(term) ||
        role.description?.toLowerCase().includes(term)
    );
  }

  viewRole(role: Role) {
    if (role.idRole) {
      this.router.navigate(['/parametres/roles/detail', role.idRole]);
    }
  }

  async editRole(role: Role) {
    if (role.idRole) {
      this.router.navigate(['/parametres/roles/edit', role.idRole]);
    }
  }

  async deleteRole(role: Role) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer le rôle "${role.nomRole}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Suppression...'
            });
            await loading.present();

            this.roleService.deleteRole(role.idRole!).subscribe({
              next: () => {
                loading.dismiss();
                this.presentToast('Rôle supprimé avec succès', 'success');
                // Retirer le rôle de la liste localement pour une mise à jour immédiate
                this.roles = this.roles.filter(r => r.idRole !== role.idRole);
                // Réappliquer le filtre si nécessaire
                this.filterRoles();
              },
              error: (error) => {
                loading.dismiss();
                const errorMessage = error?.message || 'Erreur lors de la suppression';
                this.presentToast(errorMessage, 'danger');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async toggleActif(role: Role) {
    const newActif = !role.actif;
    const loading = await this.loadingController.create({
      message: newActif ? 'Activation...' : 'Désactivation...'
    });
    await loading.present();

    this.roleService.toggleActif(role.idRole!, newActif).subscribe({
      next: () => {
        role.actif = newActif;
        loading.dismiss();
        this.presentToast(
          `Rôle ${newActif ? 'activé' : 'désactivé'} avec succès`,
          'success'
        );
      },
      error: (error) => {
        loading.dismiss();
        const errorMessage = error?.message || 'Erreur lors de la modification';
        this.presentToast(errorMessage, 'danger');
      }
    });
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

  addNewRole() {
    this.router.navigate(['/parametres/roles/new']);
  }
}

