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
  IonLabel,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonBadge,
  IonButtons,
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
  closeCircle
} from 'ionicons/icons';
import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role.model';

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
    IonLabel,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonBadge,
    IonButtons,
    CommonModule,
    FormsModule
  ],
})
export class ListeRolesPage implements OnInit {
  roles: Role[] = [];
  rolesFiltres: Role[] = [];
  searchTerm: string = '';

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
      closeCircle
    });
  }

  ngOnInit() {
    this.loadRoles();
  }

  async loadRoles() {
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.roleService.getAllRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.rolesFiltres = data;
        loading.dismiss();
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        loading.dismiss();
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
        role.code_role.toLowerCase().includes(term) ||
        role.libelle_role.toLowerCase().includes(term) ||
        role.description?.toLowerCase().includes(term)
    );
  }

  async editRole(role: Role) {
    this.router.navigate(['/parametres/roles/edit', role.id_role]);
  }

  async deleteRole(role: Role) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer le rôle "${role.libelle_role}" ?`,
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

            this.roleService.deleteRole(role.id_role!).subscribe({
              next: () => {
                loading.dismiss();
                this.presentToast('Rôle supprimé avec succès', 'success');
                // Retirer le rôle de la liste localement pour une mise à jour immédiate
                this.roles = this.roles.filter(r => r.id_role !== role.id_role);
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

    this.roleService.toggleActif(role.id_role!, newActif).subscribe({
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

