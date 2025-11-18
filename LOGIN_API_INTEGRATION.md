# Intégration Login API - Structure C#

## ✅ Modifications apportées

Le code frontend a été adapté pour correspondre à la structure de votre API C#.

### Structure de la requête
```typescript
POST /api/auth/login
{
  "Login": "votre_login",
  "Password": "votre_mot_de_passe"
}
```

### Structure de la réponse attendue
```typescript
{
  "success": boolean,
  "message": string?,
  "user": {
    "idUtilisateur": number,
    "nomComplet": string,
    "login": string,
    "role": string,
    "token"?: string  // Optionnel - voir ci-dessous
  }
}
```

## 🔑 Gestion du Token

Le code frontend vérifie le token dans **3 emplacements possibles** (dans cet ordre) :

1. **Dans l'objet `User.token`** (recommandé)
   ```csharp
   public class User
   {
       // ... autres propriétés
       public string? Token { get; set; }
   }
   ```

2. **Dans le header HTTP `Authorization`**
   ```csharp
   // Dans votre contrôleur C#
   Response.Headers.Add("Authorization", $"Bearer {token}");
   ```

3. **Si aucun token n'est trouvé**, une erreur sera levée

## 📝 Exemple d'implémentation C# recommandée

### Option 1 : Token dans l'objet User (Recommandé)
```csharp
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    // Vérifier les identifiants
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

    // Récupérer le rôle de l'utilisateur
    var role = await _roleService.GetRoleByIdAsync(user.IdRole);
    
    // Générer le token JWT avec votre méthode GenerateJwtToken
    var token = _authService.GenerateJwtToken(user, role);
    
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
            Token = token  // ← Token JWT généré avec GenerateJwtToken
        }
    });
}
```

**Note :** Votre méthode `GenerateJwtToken` crée un token JWT avec :
- Claims : `IdUtilisateur`, `NomComplet`, `Login`, `Role`
- Expiration : 24 heures par défaut (configurable)
- Signature : HMAC SHA256

### Option 2 : Token dans le header HTTP
```csharp
[HttpPost("login")]
public IActionResult Login([FromBody] LoginRequest request)
{
    var user = _userService.Authenticate(request.Login, request.Password);
    
    if (user == null)
    {
        return Ok(new LoginResponse
        {
            Success = false,
            Message = "Identifiants invalides"
        });
    }

    var token = _tokenService.GenerateToken(user);
    
    // Ajouter le token dans le header
    Response.Headers.Add("Authorization", $"Bearer {token}");
    
    return Ok(new LoginResponse
    {
        Success = true,
        Message = "Connexion réussie",
        User = new User
        {
            IdUtilisateur = user.IdUtilisateur,
            NomComplet = user.NomComplet,
            Login = user.Login,
            Role = user.Role
            // Pas de Token ici
        }
    });
}
```

## ⚠️ Important

1. **Le champ `success`** doit être `true` pour que la connexion soit considérée comme réussie
2. **Le champ `user`** doit être présent et non null si `success` est `true`
3. **Le token** doit être fourni soit dans `user.token`, soit dans le header `Authorization`
4. **En cas d'échec**, retournez `success: false` avec un `message` explicite

## 🧪 Test avec Postman

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "Login": "test@gmail.com",
  "Password": "123456"
}
```

Réponse attendue (succès) :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": {
    "idUtilisateur": 1,
    "nomComplet": "Nom Complet",
    "login": "test@gmail.com",
    "role": "ADMIN",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Réponse attendue (échec) :
```json
{
  "success": false,
  "message": "Identifiants invalides",
  "user": null
}
```

## 🔍 Debug

Si le login ne fonctionne pas :

1. **Vérifiez la console du navigateur** (F12) pour voir les erreurs
2. **Vérifiez la réponse de l'API** dans l'onglet Network
3. **Vérifiez que `success` est `true`** dans la réponse
4. **Vérifiez que `user` n'est pas null** dans la réponse
5. **Vérifiez que le token est présent** (dans User ou dans les headers)

