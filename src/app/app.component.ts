import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, IonMenuToggle } from '@ionic/angular/standalone';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { home, grid, settings, logOut, people, person, cube, calendar, chevronDown, chevronUp, shieldCheckmark, resize } from 'ionicons/icons';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ home, grid, settings, logOut, people, person, cube, calendar, chevronDown, chevronUp, shieldCheckmark, resize });
    
    // Initialiser l'URL actuelle
    this.currentUrl = this.router.url;
    
    // Écouter les changements de route pour mettre à jour l'URL actuelle
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.url;
        // Garder le menu paramètres ouvert si on est sur une route paramètres
        this.parametresExpanded = this.currentUrl.startsWith('/parametres');
      });
    
    // Initialiser l'état du menu paramètres
    this.parametresExpanded = this.currentUrl.startsWith('/parametres');
  }
  
  toggleParametres(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.parametresExpanded = !this.parametresExpanded;
  }

  logout() {
    this.authService.logout();
  }

  // Vérifier si une route est active (y compris les routes enfants)
  isRouteActive(route: string): boolean {
    if (route === '/tabs/tab1') {
      return this.currentUrl.startsWith('/tabs');
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
    if (route === '/parametres') {
      return this.currentUrl.startsWith('/parametres');
    }
    return this.currentUrl === route;
  }
}
