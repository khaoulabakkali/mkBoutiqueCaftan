import { Component, OnInit } from '@angular/core';
import { 
  IonContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  ToastController
} from '@ionic/angular/standalone';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { lockClosed, mail, person } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastController: ToastController
  ) {
    addIcons({ lockClosed, mail, person });
    
    this.loginForm = this.formBuilder.group({
      login: ['admin@mkboutique.com', [Validators.required]],
      password: ['123456', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Si l'utilisateur est déjà authentifié, rediriger vers la page d'accueil
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/tabs']);
    }
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      // Simuler un délai de connexion
      setTimeout(() => {
        const login = this.loginForm.value.login;
        const password = this.loginForm.value.password;
        
        // Authentification locale (sans appel API)
        // Vous pouvez ajouter une validation simple ici si nécessaire
        if (login && password) {
          // Générer un token simple (ou utiliser un token fixe pour le développement)
          const token = 'local_auth_token_' + Date.now();
          
          // Créer les données utilisateur
          const userData = {
            id_utilisateur: 1,
            nom_complet: login.split('@')[0] || 'Utilisateur',
            login: login,
            role: 'admin'
          };
          
          // Utiliser la méthode loginWithToken pour authentifier localement
          this.authService.loginWithToken(token, userData);
          
          this.isLoading = false;
          
          // Afficher un message de succès
          this.showToast('Connexion réussie !', 'success');
          
          // Récupérer l'URL de retour ou rediriger vers les tabs (page d'accueil)
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/tabs';
          this.router.navigate([returnUrl]);
        } else {
          this.isLoading = false;
          this.showToast('Veuillez remplir tous les champs', 'danger');
        }
      }, 500); // Petit délai pour simuler une connexion
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  get login() {
    return this.loginForm.get('login');
  }

  get password() {
    return this.loginForm.get('password');
  }
}

