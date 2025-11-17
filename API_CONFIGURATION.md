# Configuration de l'API

## Endpoints attendus par l'application

### Authentification

**POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "login": "email@exemple.com",
    "mot_de_passe": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id_utilisateur": 1,
      "nom_complet": "Nom Complet",
      "login": "email@exemple.com",
      "role": "ADMIN"
    }
  }
  ```

### Utilisateurs

**GET** `/api/utilisateurs`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Array d'utilisateurs
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

**GET** `/api/utilisateurs/:id`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Objet utilisateur

**POST** `/api/utilisateurs`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "nom_complet": "Nom Complet",
    "login": "email@exemple.com",
    "mot_de_passe": "password123",
    "role": "STAFF",
    "telephone": "+212 6 12 34 56 78",
    "actif": true
  }
  ```
- **Response:** Utilisateur créé

**PUT** `/api/utilisateurs/:id`
- **Headers:** `Authorization: Bearer {token}`
- **Body:** Même structure que POST (mot_de_passe optionnel)
- **Response:** Utilisateur mis à jour

**DELETE** `/api/utilisateurs/:id`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "success": true
  }
  ```

**PATCH** `/api/utilisateurs/:id/actif`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "actif": true
  }
  ```
- **Response:**
  ```json
  {
    "success": true
  }
  ```

## Configuration

### Environnement de développement

Modifiez `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api' // Votre URL d'API
};
```

### Environnement de production

Modifiez `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'
};
```

## Gestion des erreurs

L'application gère automatiquement les erreurs HTTP suivantes:
- **401 Unauthorized:** Token invalide ou expiré
- **403 Forbidden:** Accès interdit
- **404 Not Found:** Ressource non trouvée
- **500 Internal Server Error:** Erreur serveur

## Authentification

Le token JWT est automatiquement ajouté à toutes les requêtes via l'intercepteur HTTP (`auth.interceptor.ts`). Le token est stocké dans le `localStorage` sous la clé `auth_token`.

