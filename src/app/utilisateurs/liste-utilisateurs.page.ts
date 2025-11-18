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
  peopleOutline,
  shieldCheckmark,
  briefcase,
  person,
  checkmarkCircle,
  closeCircle
} from 'ionicons/icons';
import { UtilisateurService } from '../services/utilisateur.service';
import { Utilisateur } from '../models/utilisateur.model';
import { RoleService } from '../services/role.service';
import { Role as RoleModel } from '../models/role.model';

@Component({
  selector: 'app-liste-utilisateurs',
  templateUrl: 'liste-utilisateurs.page.html',
  styleUrls: ['liste-utilisateurs.page.scss'],
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
export class ListeUtilisateursPage implements OnInit {
  utilisateurs: Utilisateur[] = [];
  utilisateursFiltres: Utilisateur[] = [];
  searchTerm: string = '';
  roles: RoleModel[] = [];

  constructor(
    private utilisateurService: UtilisateurService,
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
      peopleOutline,
      shieldCheckmark,
      briefcase,
      person,
      checkmarkCircle,
      closeCircle
    });
  }

  ngOnInit() {
    this.loadRoles();
    this.loadUtilisateurs();
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        // Erreur silencieuse - les rôles ne sont pas critiques pour l'affichage
      }
    });
  }

  async loadUtilisateurs() {
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (data) => {
        this.utilisateurs = Array.isArray(data) ? data : [];
        this.utilisateursFiltres = Array.isArray(data) ? data : [];
        loading.dismiss();
      },
      error: (error) => {
        loading.dismiss();
        this.utilisateurs = [];
        this.utilisateursFiltres = [];
        const errorMessage = error?.message || 'Erreur lors du chargement des utilisateurs';
        this.presentToast(errorMessage, 'danger');
      }
    });
  }

  onSearchChange(event: any) {
    if (event && event.detail) {
      this.searchTerm = event.detail.value || '';
    } else {
      this.searchTerm = '';
    }
    this.filterUtilisateurs();
  }

  filterUtilisateurs() {
    if (!this.searchTerm || !this.searchTerm.trim()) {
      this.utilisateursFiltres = this.utilisateurs || [];
      return;
    }

    if (!Array.isArray(this.utilisateurs) || this.utilisateurs.length === 0) {
      this.utilisateursFiltres = [];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.utilisateursFiltres = this.utilisateurs.filter(
      (user) =>
        user &&
        (
          (user.nom_complet || '').toLowerCase().includes(term) ||
          (user.login || '').toLowerCase().includes(term) ||
          (user.telephone || '').toLowerCase().includes(term) ||
          (user.role || '').toLowerCase().includes(term)
        )
    );
  }

  getRoleColor(role: string): string {
    if (!role) return 'medium';
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'danger';
      case 'MANAGER':
        return 'warning';
      case 'STAFF':
        return 'success';
      default:
        return 'medium';
    }
  }

  getRoleLabel(codeRole: string): string {
    if (!codeRole) return 'Non défini';
    if (!Array.isArray(this.roles)) return codeRole;
    const role = this.roles.find(r => r && r.code_role === codeRole);
    return role ? (role.libelle_role || codeRole) : codeRole;
  }

  getRoleIcon(role: string): string {
    if (!role) return 'person';
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'shield-checkmark';
      case 'MANAGER':
        return 'briefcase';
      case 'STAFF':
        return 'person';
      default:
        return 'person';
    }
  }

  async editUtilisateur(utilisateur: Utilisateur) {
    if (!utilisateur || !utilisateur.id_utilisateur) {
      this.presentToast('ID utilisateur manquant', 'danger');
      return;
    }
    this.router.navigate(['/utilisateurs/edit', utilisateur.id_utilisateur]);
  }

  async deleteUtilisateur(utilisateur: Utilisateur) {
    if (!utilisateur || !utilisateur.id_utilisateur) {
      this.presentToast('ID utilisateur manquant', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer l'utilisateur "${utilisateur.nom_complet || 'cet utilisateur'}" ?`,
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

            this.utilisateurService.deleteUtilisateur(utilisateur.id_utilisateur!).subscribe({
              next: () => {
                loading.dismiss();
                this.presentToast('Utilisateur supprimé avec succès', 'success');
                this.loadUtilisateurs();
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

  async toggleActif(utilisateur: Utilisateur) {
    if (!utilisateur || !utilisateur.id_utilisateur) {
      this.presentToast('ID utilisateur manquant', 'danger');
      return;
    }

    const newActif = !utilisateur.actif;
    const loading = await this.loadingController.create({
      message: newActif ? 'Activation...' : 'Désactivation...'
    });
    await loading.present();

    this.utilisateurService.toggleActif(utilisateur.id_utilisateur, newActif).subscribe({
      next: () => {
        utilisateur.actif = newActif;
        loading.dismiss();
        this.presentToast(
          `Utilisateur ${newActif ? 'activé' : 'désactivé'} avec succès`,
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

  addNewUtilisateur() {
    this.router.navigate(['/utilisateurs/new']);
  }
}

