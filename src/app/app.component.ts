import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, IonMenuToggle } from '@ionic/angular/standalone';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { addIcons } from 'ionicons';
import { home, grid, settings, logOut, people } from 'ionicons/icons';
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
    RouterLinkActive
  ],
})
export class AppComponent {
  currentUrl: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ home, grid, settings, logOut, people });
    
    // Initialiser l'URL actuelle
    this.currentUrl = this.router.url;
    
    // Écouter les changements de route pour mettre à jour l'URL actuelle
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.url;
      });
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
    return this.currentUrl === route;
  }
}
