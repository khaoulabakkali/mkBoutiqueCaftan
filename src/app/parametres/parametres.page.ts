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
import { TranslateModule } from '@ngx-translate/core';
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
    CommonModule,
    TranslateModule
  ],
})
export class ParametresPage implements OnInit {
  menuItems = [
    {
      titleKey: 'parameters.roles',
      descriptionKey: 'parameters.rolesDescription',
      icon: 'shield-checkmark',
      route: '/parametres/roles',
      color: 'primary'
    },
    {
      titleKey: 'parameters.sizes',
      descriptionKey: 'parameters.sizesDescription',
      icon: 'resize',
      route: '/parametres/tailles',
      color: 'secondary'
    },
    {
      titleKey: 'parameters.categories',
      descriptionKey: 'parameters.categoriesDescription',
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

