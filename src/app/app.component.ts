import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, IonMenuToggle } from '@ionic/angular/standalone';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { home, grid, settings, logOut, people, person, cube, calendar, chevronDown, chevronUp, shieldCheckmark, resize, wallet, business, barChart } from 'ionicons/icons';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    IonApp, 
    IonRouterOutlet, 
    IonMenu, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonIcon, 
    IonMenuToggle,
    RouterLink,
    RouterLinkActive,
    CommonModule
  ],
})
export class AppComponent {
  currentUrl: string = '';
  parametresExpanded: boolean = false;
  userName: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ home, grid, settings, logOut, people, person, cube, calendar, chevronDown, chevronUp, shieldCheckmark, resize, wallet, business, barChart });
    
    // Initialiser l'URL actuelle
    this.currentUrl = this.router.url;
    
    // Charger le nom de l'utilisateur
    this.loadUserName();
    
    // Écouter les changements de route pour mettre à jour l'URL actuelle
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.url;
        // Garder le menu paramètres ouvert si on est sur une route paramètres
        this.parametresExpanded = this.currentUrl.startsWith('/parametres');
        // Recharger le nom de l'utilisateur au cas où il aurait changé
        this.loadUserName();
      });
    
    // Initialiser l'état du menu paramètres
    this.parametresExpanded = this.currentUrl.startsWith('/parametres');
  }

  loadUserName() {
    this.userName = this.authService.getUserName();
  }
  
  toggleParametres(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.parametresExpanded = !this.parametresExpanded;
  }

  logout() {
    this.authService.logout();
  }

  async navigateToSociete() {
    const societeId = this.authService.getSocieteId();
    if (societeId) {
      this.router.navigate(['/parametres/societes/detail', societeId]);
    } else {
      // Si pas de societeId, essayer de charger toutes les sociétés et prendre la première
      // ou afficher un message d'erreur
      if (!environment.production) {
        console.error('SocieteId non trouvé dans le token');
      }
      // Rediriger vers l'accueil avec un message d'erreur
      this.router.navigate(['/tabs/tab1']);
    }
  }

  // Vérifier si une route est active (y compris les routes enfants)
  isRouteActive(route: string): boolean {
    if (route === '/tabs/tab1') {
      return this.currentUrl.startsWith('/tabs');
    }
    if (route === '/dashboard') {
      return this.currentUrl.startsWith('/dashboard');
    }
    if (route === '/utilisateurs') {
      return this.currentUrl.startsWith('/utilisateurs');
    }
    if (route === '/clients') {
      return this.currentUrl.startsWith('/clients');
    }
    if (route === '/articles') {
      return this.currentUrl.startsWith('/articles');
    }
    if (route === '/reservations') {
      return this.currentUrl.startsWith('/reservations');
    }
    if (route === '/paiements') {
      return this.currentUrl.startsWith('/paiements');
    }
    if (route === '/parametres') {
      return this.currentUrl.startsWith('/parametres');
    }
    if (route === '/parametres/societes') {
      return this.currentUrl.startsWith('/parametres/societes');
    }
    return this.currentUrl === route;
  }
}
