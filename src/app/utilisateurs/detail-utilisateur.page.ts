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
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBack, create, person, mail, call, shieldCheckmark, checkmarkCircle, closeCircle, calendar } from 'ionicons/icons';
import { UtilisateurService } from '../services/utilisateur.service';
import { Utilisateur } from '../models/utilisateur.model';
import { RoleService } from '../services/role.service';
import { Role } from '../models/role.model';

@Component({
  selector: 'app-detail-utilisateur',
  templateUrl: 'detail-utilisateur.page.html',
  styleUrls: ['detail-utilisateur.page.scss'],
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
    CommonModule
  ],
})
export class DetailUtilisateurPage implements OnInit {
  utilisateur: Utilisateur | null = null;
  roles: Role[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utilisateurService: UtilisateurService,
    private roleService: RoleService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ arrowBack, create, person, mail, call, shieldCheckmark, checkmarkCircle, closeCircle, calendar });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUtilisateur(+id);
      this.loadRoles();
    } else {
      this.presentToast('ID utilisateur manquant', 'danger');
      this.router.navigate(['/utilisateurs']);
    }
  }

  async loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: () => {
        // Erreur silencieuse
      }
    });
  }

  async loadUtilisateur(id: number) {
    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    this.utilisateurService.getUtilisateurById(id).subscribe({
      next: (data) => {
        this.utilisateur = data || null;
        loading.dismiss();
      },
      error: async (error) => {
        loading.dismiss();
        const errorMessage = error?.message || 'Erreur lors du chargement de l\'utilisateur';
        await this.presentToast(errorMessage, 'danger');
        this.router.navigate(['/utilisateurs']);
      }
    });
  }

  editUtilisateur() {
    if (this.utilisateur?.idUtilisateur) {
      this.router.navigate(['/utilisateurs/edit', this.utilisateur.idUtilisateur]);
    }
  }

  goBack() {
    this.router.navigate(['/utilisateurs']);
  }

  getRoleColor(role: Role | string | undefined): string {
    if (!role) return 'medium';
    const roleStr = typeof role === 'string' ? role : (role as Role).nomRole || '';
    if (!roleStr) return 'medium';
    switch (roleStr.toUpperCase()) {
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

  getRoleLabel(role: Role | string | undefined): string {
    if (!role) return 'Non défini';
    if (typeof role === 'string') {
      if (Array.isArray(this.roles)) {
        const roleFind = this.roles.find(r => r && r.nomRole === role);
        return roleFind ? roleFind.nomRole : role;
      }
      return role;
    }
    return (role as Role).nomRole || 'Non défini';
  }

  getRoleIcon(role: Role | string | undefined): string {
    if (!role) return 'person';
    const roleStr = typeof role === 'string' ? role : (role as Role).nomRole || '';
    if (!roleStr) return 'person';
    switch (roleStr.toUpperCase()) {
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

  formatDate(date: string | undefined): string {
    if (!date) return 'Non définie';
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return date;
    }
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

