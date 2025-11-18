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
  IonIcon
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { shieldCheckmark, resize, grid, settings } from 'ionicons/icons';

@Component({
  selector: 'app-parametres',
  templateUrl: 'parametres.page.html',
  styleUrls: ['parametres.page.scss'],
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
    IonIcon,
    CommonModule
  ],
})
export class ParametresPage implements OnInit {
  menuItems = [
    {
      title: 'Rôles',
      description: 'Gérer les rôles des utilisateurs',
      icon: 'shield-checkmark',
      route: '/parametres/roles',
      color: 'primary'
    },
    {
      title: 'Tailles',
      description: 'Gérer les tailles disponibles',
      icon: 'resize',
      route: '/parametres/tailles',
      color: 'secondary'
    },
    {
      title: 'Catégories',
      description: 'Gérer les catégories de produits',
      icon: 'grid',
      route: '/parametres/categories',
      color: 'tertiary'
    }
  ];

  constructor(private router: Router) {
    addIcons({ shieldCheckmark, resize, grid, settings });
  }

  ngOnInit() {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}

