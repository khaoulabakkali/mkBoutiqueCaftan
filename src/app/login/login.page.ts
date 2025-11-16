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
  IonCardContent
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
    private authService: AuthService
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
      this.router.navigate(['/tabs/tab1']);
    }
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      // Simuler une authentification
      setTimeout(() => {
        // Générer un token simulé
        const token = 'mock_token_' + Date.now();
        const userData = {
          login: this.loginForm.value.login
        };
        
        // Utiliser le service d'authentification pour se connecter
        this.authService.login(token, userData);
        
        this.isLoading = false;
        
        // Récupérer l'URL de retour ou rediriger vers les tabs
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/tabs/tab1';
        this.router.navigate([returnUrl]);
      }, 1500);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  get login() {
    return this.loginForm.get('login');
  }

  get password() {
    return this.loginForm.get('password');
  }
}

