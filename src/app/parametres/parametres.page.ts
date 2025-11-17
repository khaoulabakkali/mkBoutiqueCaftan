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
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { shieldCheckmark, settings } from 'ionicons/icons';

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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
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
    }
  ];

  constructor(private router: Router) {
    addIcons({ shieldCheckmark, settings });
  }

  ngOnInit() {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}

