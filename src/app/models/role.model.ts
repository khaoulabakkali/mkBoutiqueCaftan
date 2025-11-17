/**
 * Modèle Role
 * Pour la gestion dynamique des rôles dans l'application
 * 
 * Structure de la table roles (si base de données) :
 * - id_role: INTEGER (clé primaire, auto-increment)
 * - code_role: VARCHAR(50) - Code unique du rôle (ex: ADMIN, STAFF, MANAGER)
 * - libelle_role: VARCHAR(100) - Libellé affiché (ex: Administrateur, Staff, Manager)
 * - description: TEXT - Description du rôle (optionnel)
 * - actif: BOOLEAN - Statut actif/inactif
 * - date_creation: DATETIME - Date de création
 */
export interface Role {
  /** INTEGER - Clé primaire, auto-increment */
  id_role?: number;
  
  /** VARCHAR(50) - Code unique du rôle (ex: ADMIN, STAFF, MANAGER) */
  code_role: string;
  
  /** VARCHAR(100) - Libellé affiché (ex: Administrateur, Staff, Manager) */
  libelle_role: string;
  
  /** TEXT - Description du rôle (optionnel) */
  description?: string;
  
  /** BOOLEAN - Statut actif/inactif */
  actif: boolean;
  
  /** DATETIME - Date de création */
  date_creation?: string;
}

