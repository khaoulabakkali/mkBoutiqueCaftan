# CRUD Utilisateur - Consommation API

## ✅ Configuration complète

Le CRUD utilisateur est entièrement configuré pour consommer l'API backend. Toutes les opérations utilisent des appels HTTP réels.

## 📡 Endpoints utilisés

### 1. **GET** `/api/utilisateurs`
- **Fonction:** Récupérer tous les utilisateurs
- **Méthode:** `getAllUtilisateurs()`
- **Utilisé dans:** `liste-utilisateurs.page.ts`
- **Headers:** `Authorization: Bearer {token}`

### 2. **GET** `/api/utilisateurs/:id`
- **Fonction:** Récupérer un utilisateur par ID
- **Méthode:** `getUtilisateurById(id)`
- **Utilisé dans:** `form-utilisateur.page.ts` (mode édition)

### 3. **POST** `/api/utilisateurs`
- **Fonction:** Créer un nouvel utilisateur
- **Méthode:** `createUtilisateur(utilisateur)`
- **Utilisé dans:** `form-utilisateur.page.ts` (mode création)
- **Body:**
  ```json
  {
    "nom_complet": "string",
    "login": "string",
    "mot_de_passe": "string",
    "role": "ADMIN|STAFF|MANAGER",
    "telephone": "string (optionnel)",
    "actif": boolean
  }
  ```

### 4. **PUT** `/api/utilisateurs/:id`
- **Fonction:** Mettre à jour un utilisateur
- **Méthode:** `updateUtilisateur(id, utilisateur)`
- **Utilisé dans:** `form-utilisateur.page.ts` (mode édition)
- **Note:** Le mot de passe est optionnel en mode édition

### 5. **DELETE** `/api/utilisateurs/:id`
- **Fonction:** Supprimer un utilisateur
- **Méthode:** `deleteUtilisateur(id)`
- **Utilisé dans:** `liste-utilisateurs.page.ts` (bouton supprimer)

### 6. **PATCH** `/api/utilisateurs/:id/actif`
- **Fonction:** Activer/Désactiver un utilisateur
- **Méthode:** `toggleActif(id, actif)`
- **Utilisé dans:** `liste-utilisateurs.page.ts` (bouton activer/désactiver)
- **Body:**
  ```json
  {
    "actif": boolean
  }
  ```

## 🔐 Authentification

Toutes les requêtes incluent automatiquement le token JWT via:
1. **Intercepteur HTTP** (`auth.interceptor.ts`) - Ajoute le token à toutes les requêtes
2. **Méthode `getHttpOptions()`** dans le service - Fallback si l'intercepteur ne fonctionne pas

## 🎯 Fonctionnalités implémentées

### Page Liste Utilisateurs
- ✅ Chargement de la liste depuis l'API
- ✅ Recherche en temps réel (côté client)
- ✅ Affichage des badges de rôle et statut
- ✅ Suppression avec confirmation
- ✅ Activation/Désactivation
- ✅ Navigation vers le formulaire d'édition
- ✅ Gestion des erreurs avec messages toast

### Page Formulaire Utilisateur
- ✅ Création d'utilisateur
- ✅ Édition d'utilisateur
- ✅ Validation des champs
- ✅ Gestion du mot de passe (requis en création, optionnel en édition)
- ✅ Sélection du rôle
- ✅ Gestion des erreurs avec messages toast

## 🛠️ Gestion des erreurs

Le service gère automatiquement:
- **401 Unauthorized:** Token invalide ou expiré
- **403 Forbidden:** Accès interdit
- **404 Not Found:** Ressource non trouvée
- **500 Internal Server Error:** Erreur serveur
- **Erreurs de validation:** Messages d'erreur du backend
- **Erreurs réseau:** Messages d'erreur génériques

Les messages d'erreur sont affichés via des toasts Ionic dans l'interface utilisateur.

## 📝 Configuration

L'URL de l'API est configurée dans:
- **Développement:** `src/environments/environment.ts`
- **Production:** `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

## 🚀 Utilisation

1. **Assurez-vous que votre backend est démarré** sur le port configuré
2. **Connectez-vous** via la page de login (le token sera stocké automatiquement)
3. **Accédez au menu** → Utilisateurs
4. **Utilisez les fonctionnalités CRUD:**
   - Cliquez sur ➕ pour créer un utilisateur
   - Cliquez sur ✏️ pour modifier
   - Cliquez sur 🗑️ pour supprimer
   - Cliquez sur 👁️ pour activer/désactiver

## 📋 Format de données attendu

### Réponse GET /api/utilisateurs
```json
[
  {
    "id_utilisateur": 1,
    "nom_complet": "Nom Complet",
    "login": "email@exemple.com",
    "role": "ADMIN",
    "telephone": "+212 6 12 34 56 78",
    "actif": true,
    "date_creation_compte": "2024-01-15T10:00:00Z"
  }
]
```

### Réponse POST/PUT /api/utilisateurs
```json
{
  "id_utilisateur": 1,
  "nom_complet": "Nom Complet",
  "login": "email@exemple.com",
  "role": "ADMIN",
  "telephone": "+212 6 12 34 56 78",
  "actif": true,
  "date_creation_compte": "2024-01-15T10:00:00Z"
}
```

## ⚠️ Notes importantes

1. Le mot de passe n'est jamais renvoyé par l'API (seulement `mot_de_passe_hash` si nécessaire)
2. Le champ `mot_de_passe` dans le formulaire est utilisé uniquement pour l'envoi à l'API
3. Le backend doit hasher le mot de passe avant de le stocker
4. Le token JWT doit être valide pour toutes les opérations CRUD

