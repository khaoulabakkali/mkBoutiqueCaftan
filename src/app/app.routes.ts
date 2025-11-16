import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'utilisateurs',
    loadComponent: () => import('./utilisateurs/liste-utilisateurs.page').then((m) => m.ListeUtilisateursPage),
  },
  {
    path: 'utilisateurs/new',
    loadComponent: () => import('./utilisateurs/form-utilisateur.page').then((m) => m.FormUtilisateurPage),
  },
  {
    path: 'utilisateurs/edit/:id',
    loadComponent: () => import('./utilisateurs/form-utilisateur.page').then((m) => m.FormUtilisateurPage),
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
];
