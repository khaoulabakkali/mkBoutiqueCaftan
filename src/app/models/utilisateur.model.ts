/**
 * Enum pour les rôles des utilisateurs
 * Correspond à l'ENUM de la base de données
 */
export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  MANAGER = 'MANAGER'
}

/**
 * Modèle Utilisateur
 * Correspond à la structure de la table utilisateurs dans la base de données
 * 
 * Structure de la table :
 * - id_utilisateur: INTEGER (clé primaire, auto-increment)
 * - nom_complet: VARCHAR(100)
 * - login: VARCHAR(50)
 * - mot_de_passe_hash: VARCHAR(255)
 * - role: ENUM('ADMIN', 'STAFF', 'MANAGER')
 * - telephone: VARCHAR(20)
 * - actif: BOOLEAN
 * - date_creation_compte: DATETIME
 */
export interface Utilisateur {
  /** INTEGER - Clé primaire, auto-increment */
  id_utilisateur?: number;
  
  /** VARCHAR(100) - Nom complet de l'utilisateur */
  nom_complet: string;
  
  /** VARCHAR(50) - Identifiant de connexion (email ou username) */
  login: string;
  
  /** VARCHAR(255) - Hash du mot de passe (stocké en base) */
  mot_de_passe_hash?: string;
  
  /** Champ temporaire pour le formulaire uniquement (non stocké en base) */
  mot_de_passe?: string;
  
  /** VARCHAR(50) - Code du rôle (ex: ADMIN, STAFF, MANAGER) - Référence à la table roles */
  role: Role | string;
  
  /** VARCHAR(20) - Numéro de téléphone (optionnel) */
  telephone?: string;
  
  /** BOOLEAN - Statut actif/inactif de l'utilisateur */
  actif: boolean;
  
  /** DATETIME - Date de création du compte */
  date_creation_compte?: string;
}

