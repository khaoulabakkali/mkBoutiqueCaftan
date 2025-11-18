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
      login: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Si l'utilisateur est déjà authentifié, rediriger vers la page d'accueil
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/tabs/tab1']);
    }
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const login = this.loginForm.value.login;
      const password = this.loginForm.value.password;

      this.authService.login(login, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Récupérer l'URL de retour ou rediriger vers l'accueil
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/tabs/tab1';
          // Décoder l'URL au cas où elle serait encodée
          let decodedUrl = returnUrl;
          try {
            decodedUrl = decodeURIComponent(returnUrl);
          } catch (e) {
            // Si le décodage échoue, utiliser la valeur telle quelle
            decodedUrl = returnUrl;
          }
          // Utiliser navigateByUrl pour gérer correctement les URLs avec query params
          // ou split pour extraire seulement le chemin si c'est une URL complète
          if (decodedUrl.includes('?')) {
            const [path, queryString] = decodedUrl.split('?');
            const queryParams: any = {};
            queryString.split('&').forEach((param: string) => {
              const [key, value] = param.split('=');
              if (key && value) {
                queryParams[decodeURIComponent(key)] = decodeURIComponent(value);
              }
            });
            this.router.navigate([path], { queryParams });
          } else {
            // Si pas de query params, utiliser navigate normalement
            this.router.navigate([decodedUrl]);
          }
        },
        error: async (error) => {
          this.isLoading = false;
          const errorMessage = error.message || 'Erreur de connexion. Vérifiez vos identifiants.';
          await this.showErrorToast(errorMessage);
        }
      });
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

  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }
}

