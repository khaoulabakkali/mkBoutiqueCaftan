/**
 * Modèle Role
 * Pour la gestion dynamique des rôles dans l'application
 * 
 * Structure de la table roles (si base de données) :
 * - idRole: INTEGER (clé primaire, auto-increment)
 * - description: TEXT - Description du rôle (optionnel)
 * - actif: BOOLEAN - Statut actif/inactif
 * - date_creation: DATETIME - Date de création
 */
export interface Role {
  /** INTEGER - Clé primaire, auto-increment */
  idRole?: number;
  
  /** VARCHAR(100) - Libellé affiché (ex: Administrateur, Staff, Manager) */
  nomRole: string;
  
  /** TEXT - Description du rôle (optionnel) */
  description?: string;
  
  /** BOOLEAN - Statut actif/inactif */
  actif: boolean;
}

