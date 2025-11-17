# Implémentation JWT Token - Guide Complet

## 🔑 Génération du Token (Côté API)

Votre méthode `GenerateJwtToken` génère un token JWT avec les informations suivantes :

### Claims inclus dans le token :
- `ClaimTypes.NameIdentifier` → `IdUtilisateur`
- `ClaimTypes.Name` → `Login`
- `IdUtilisateur` → ID de l'utilisateur
- `NomComplet` → Nom complet
- `IdRole` → ID du rôle
- `ClaimTypes.Role` → Nom du rôle (si disponible)
- `Role` → Nom du rôle (si disponible)

### Configuration :
- **Secret Key** : `Jwt:SecretKey` (ou valeur par défaut)
- **Issuer** : `Jwt:Issuer` (défaut: "mkBoutiqueCaftan")
- **Audience** : `Jwt:Audience` (défaut: "mkBoutiqueCaftan")
- **Expiration** : `Jwt:ExpirationMinutes` (défaut: 1440 = 24 heures)

## 📤 Retour du Token dans la Réponse

### Structure recommandée :

```csharp
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    // 1. Authentification
    var user = await _userService.AuthenticateAsync(request.Login, request.Password);
    
    if (user == null)
    {
        return Ok(new LoginResponse
        {
            Success = false,
            Message = "Identifiants invalides",
            User = null
        });
    }

    // 2. Récupérer le rôle
    var role = await _roleService.GetRoleByIdAsync(user.IdRole);
    
    // 3. Générer le token JWT
    var token = _authService.GenerateJwtToken(user, role);
    
    // 4. Retourner la réponse avec le token dans User
    return Ok(new LoginResponse
    {
        Success = true,
        Message = "Connexion réussie",
        User = new User
        {
            IdUtilisateur = user.IdUtilisateur,
            NomComplet = user.NomComplet,
            Login = user.Login,
            Role = role?.NomRole ?? "STAFF",
            Token = token  // ← Token JWT ici
        }
    });
}
```

## 📥 Réception du Token (Côté Frontend)

Le code frontend récupère automatiquement le token dans cet ordre :

1. **Depuis `user.token`** (recommandé)
2. **Depuis le header `Authorization`** (alternative)
3. **Erreur si aucun token** n'est trouvé

### Code frontend actuel :

```typescript
private extractToken(user: any, httpResponse: HttpResponse<LoginResponse>): string | null {
  // 1. Vérifier dans user.token
  if (user?.token) {
    return user.token;
  }

  // 2. Vérifier dans le header Authorization
  const authHeader = httpResponse.headers.get('Authorization');
  if (authHeader) {
    return authHeader.replace('Bearer ', '');
  }

  return null;
}
```

## 🔐 Utilisation du Token

Une fois stocké, le token est automatiquement ajouté à toutes les requêtes HTTP via l'intercepteur :

```typescript
// auth.interceptor.ts
Authorization: `Bearer ${token}`
```

## ✅ Vérification Côté Backend

Votre backend doit valider le token JWT dans les endpoints protégés :

```csharp
[Authorize]
[HttpGet("utilisateurs")]
public async Task<IActionResult> GetUtilisateurs()
{
    // Le token est automatiquement validé par [Authorize]
    // Les claims sont disponibles via User.Claims
    var userId = User.FindFirst("IdUtilisateur")?.Value;
    var role = User.FindFirst(ClaimTypes.Role)?.Value;
    
    // Votre logique métier...
}
```

## 🧪 Test

### Requête de login :
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "Login": "test@gmail.com",
  "Password": "123456"
}
```

### Réponse attendue :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": {
    "idUtilisateur": 1,
    "nomComplet": "Nom Complet",
    "login": "test@gmail.com",
    "role": "ADMIN",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJIdXRpbGlzYXRldXIiOiIxIiwibmFtZSI6InRlc3RAZ21haWwuY29tIiwiUm9sZSI6IkFETUlOIiwiZXhwIjoxNzA1MjM0NTY3fQ..."
  }
}
```

### Utilisation du token :
```http
GET http://localhost:5000/api/utilisateurs
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⚠️ Points Importants

1. **Le token doit être dans `user.token`** pour que le frontend le récupère automatiquement
2. **Le token expire après 24 heures** (configurable via `Jwt:ExpirationMinutes`)
3. **Le secret key doit être sécurisé** en production (ne pas utiliser la valeur par défaut)
4. **Le token contient les informations utilisateur** dans les claims
5. **Le frontend stocke le token** dans `localStorage` sous la clé `auth_token`

## 🔄 Gestion de l'Expiration

Si le token expire, le backend retournera un **401 Unauthorized**. Le frontend peut :
- Rediriger vers la page de login
- Démarrer un refresh token (si implémenté)
- Afficher un message à l'utilisateur

