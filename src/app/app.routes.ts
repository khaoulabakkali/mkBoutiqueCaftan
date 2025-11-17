import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'utilisateurs',
    loadComponent: () => import('./utilisateurs/liste-utilisateurs.page').then((m) => m.ListeUtilisateursPage),
    canActivate: [authGuard],
  },
  {
    path: 'utilisateurs/new',
    loadComponent: () => import('./utilisateurs/form-utilisateur.page').then((m) => m.FormUtilisateurPage),
    canActivate: [authGuard],
  },
  {
    path: 'utilisateurs/edit/:id',
    loadComponent: () => import('./utilisateurs/form-utilisateur.page').then((m) => m.FormUtilisateurPage),
    canActivate: [authGuard],
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [authGuard],
  },
  {
    path: 'parametres',
    loadComponent: () => import('./parametres/parametres.page').then((m) => m.ParametresPage),
    canActivate: [authGuard],
  },
  {
    path: 'parametres/roles',
    loadComponent: () => import('./parametres/roles/liste-roles.page').then((m) => m.ListeRolesPage),
    canActivate: [authGuard],
  },
  {
    path: 'parametres/roles/new',
    loadComponent: () => import('./parametres/roles/form-role.page').then((m) => m.FormRolePage),
    canActivate: [authGuard],
  },
  {
    path: 'parametres/roles/edit/:id',
    loadComponent: () => import('./parametres/roles/form-role.page').then((m) => m.FormRolePage),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
