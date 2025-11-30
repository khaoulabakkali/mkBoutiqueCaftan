# Guide d'utilisation de la traduction multilingue

## Vue d'ensemble
Ce projet utilise **@ngx-translate** pour supporter l'arabe, le français et l'anglais.

## Langues disponibles
- 🇫🇷 Français (fr) - Par défaut
- 🇬🇧 Anglais (en)
- 🇸🇦 Arabe (ar)

## Comment utiliser les traductions

### 1. Dans les templates HTML

```html
<!-- Traduction simple -->
{{ 'common.welcome' | translate }}

<!-- Traduction avec paramètres -->
{{ 'messages.hello' | translate:{ name: 'Jean' } }}

<!-- Traduction dans les attributs -->
<button [title]="'common.save' | translate">{{ 'common.save' | translate }}</button>

<!-- Traduction de placeholder -->
<input [placeholder]="'clients.search' | translate">
```

### 2. Dans les composants TypeScript

```typescript
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from './services/translation.service';

export class MonComponent {
  constructor(
    private translate: TranslateService,
    private translationService: TranslationService
  ) {}

  // Traduction instantanée (synchrone)
  obtenirTexte() {
    const texte = this.translate.instant('common.welcome');
    console.log(texte);
  }

  // Traduction asynchrone (observable)
  obtenirTexteAsync() {
    this.translate.get('common.welcome').subscribe(texte => {
      console.log(texte);
    });
  }

  // Changer la langue
  changerLangue(langue: string) {
    this.translationService.setLanguage(langue);
  }

  // Obtenir la langue actuelle
  obtenirLangueActuelle() {
    return this.translationService.getCurrentLanguage();
  }
}
```

### 3. Utilisation du service d'aide aux traductions

```typescript
import { TranslationHelperService } from './services/translation-helper.service';

export class MonComponent {
  constructor(private translationHelper: TranslationHelperService) {}

  // Pluralisation automatique
  afficherCommandes(nombre: number) {
    this.translationHelper.pluralize('clients.orders', nombre).subscribe(texte => {
      console.log(texte); // "5 commandes"
    });
  }

  // Obtenir plusieurs traductions
  obtenirMultiples() {
    this.translationHelper.getMultiple(['common.save', 'common.cancel']).subscribe(traductions => {
      console.log(traductions);
    });
  }
}
```

## Structure des clés de traduction

Les clés sont organisées par domaine:

```
common.*         // Éléments communs (boutons, messages génériques)
login.*          // Formulaire de connexion
navigation.*     // Éléments de navigation
messages.*       // Messages d'alerte et de confirmation
home.*           // Page d'accueil
clients.*        // Gestion des clients
articles.*       // Gestion des articles
reservations.*   // Gestion des réservations
payments.*       // Gestion des paiements
users.*          // Gestion des utilisateurs
parameters.*     // Paramètres
dashboard.*      // Tableau de bord
```

## Ajouter une nouvelle traduction

### 1. Ajouter la clé aux fichiers JSON

**src/assets/i18n/fr.json**
```json
{
  "monDomaine": {
    "maCle": "Mon texte en français"
  }
}
```

**src/assets/i18n/en.json**
```json
{
  "monDomaine": {
    "maCle": "My text in English"
  }
}
```

**src/assets/i18n/ar.json**
```json
{
  "monDomaine": {
    "maCle": "نصي بالعربية"
  }
}
```

### 2. Utiliser la clé dans le template

```html
{{ 'monDomaine.maCle' | translate }}
```

## Pluralisation

Pour gérer les pluriels, utilisez les suffixes `_plural`:

**fr.json**
```json
{
  "clients": {
    "orders": "commande",
    "orders_plural": "commandes"
  }
}
```

**Utilisation dans le template**
```html
<ion-badge color="primary">
  {{ client.totalCommandes }} 
  {{ client.totalCommandes > 1 ? ('clients.orders_plural' | translate) : ('clients.orders' | translate) }}
</ion-badge>
```

## Sélecteur de langue

Le sélecteur de langue se trouve dans le menu latéral. Il permet de basculer entre:
- Français (fr)
- English (en)
- العربية (ar)

La langue sélectionnée est sauvegardée dans `localStorage` et persistera après fermeture.

## Importer TranslateModule dans les composants

Tous les composants qui utilisent le pipe `translate` doivent importer `TranslateModule`:

```typescript
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-mon-composant',
  templateUrl: 'mon-composant.html',
  styleUrls: ['mon-composant.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    // ... autres imports
    CommonModule,
    TranslateModule  // ← Important!
  ]
})
export class MonComposant {
  // ...
}
```

## Variables d'interpolation

Pour utiliser des variables dans les traductions:

**fr.json**
```json
{
  "messages": {
    "bienvenue": "Bienvenue {{name}}!",
    "confirmation": "Êtes-vous sûr de vouloir supprimer {{itemName}}?"
  }
}
```

**Template**
```html
{{ 'messages.bienvenue' | translate:{ name: 'Jean' } }}
{{ 'messages.confirmation' | translate:{ itemName: article.nom } }}
```

## Traduction de contenu dynamique

Pour des contenus générés dynamiquement (comme des messages d'erreur), utilisez:

```typescript
this.translate.get('messages.error', { code: errorCode }).subscribe(message => {
  console.log(message);
  this.showErrorToast(message);
});
```

## Points d'attention

1. ✅ **Toujours inclure `TranslateModule`** dans les imports des composants standalone
2. ✅ **Utiliser le pipe `translate`** pour les textes dans les templates
3. ✅ **Organiser les clés par domaine** pour une meilleure maintenabilité
4. ✅ **Documenter les clés** avec des commentaires dans les fichiers JSON
5. ✅ **Tester les trois langues** lors du développement de nouvelles fonctionnalités

## Architecture

```
src/
├── app/
│   ├── services/
│   │   ├── translation.service.ts        # Service principal de traduction
│   │   └── translation-helper.service.ts # Service d'aide avec utils
│   └── ...
└── assets/
    └── i18n/
        ├── en.json   # Anglais
        ├── fr.json   # Français (défaut)
        └── ar.json   # Arabe
```

## Support

Pour ajouter d'autres langues ou modifier les traductions existantes, mettez à jour les fichiers JSON correspondants dans `src/assets/i18n/`.
