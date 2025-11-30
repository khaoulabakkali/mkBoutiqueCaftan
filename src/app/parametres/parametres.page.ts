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
  IonItemDivider,
  IonLabel,
  IonIcon,
  ToastController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../services/translation.service';
import { addIcons } from 'ionicons';
import { shieldCheckmark, resize, grid, settings, globe, language, checkmark } from 'ionicons/icons';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  icon: string;
}

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
    IonItemDivider,
    IonLabel,
    IonIcon,
    CommonModule,
    TranslateModule
  ],
})
export class ParametresPage implements OnInit {
  currentLanguage: string = 'fr';
  currentLanguageName: string = 'Français';
  availableLanguages: Language[] = [
    { code: 'fr', name: 'French', nativeName: 'Français', icon: 'language' },
    { code: 'en', name: 'English', nativeName: 'English', icon: 'language' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', icon: 'language' }
  ];

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

  constructor(
    private router: Router,
    private translationService: TranslationService,
    private translate: TranslateService,
    private toastController: ToastController
  ) {
    addIcons({ shieldCheckmark, resize, grid, settings, globe, language, checkmark });
  }

  ngOnInit() {
    this.currentLanguage = this.translationService.getCurrentLanguage();
    this.updateCurrentLanguageName();
    
    // Écouter les changements de langue
    this.translationService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
      this.updateCurrentLanguageName();
    });
  }

  updateCurrentLanguageName() {
    const lang = this.availableLanguages.find(l => l.code === this.currentLanguage);
    if (lang) {
      this.currentLanguageName = lang.nativeName;
    }
  }

  async changeLanguage(languageCode: string) {
    if (languageCode !== this.currentLanguage) {
      this.translationService.setLanguage(languageCode);
      this.currentLanguage = languageCode;
      this.updateCurrentLanguageName();
      
      // Afficher un message de confirmation
      const toast = await this.toastController.create({
        message: this.translate.instant('parameters.language.changed'),
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}

