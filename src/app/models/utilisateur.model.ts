import { Role } from './role.model';

/**
 * Modèle Utilisateur
 * Correspond à la structure de la table utilisateurs dans la base de données
 * 
 * Structure de la table :
 * - idUtilisateur: INTEGER (clé primaire, auto-increment)
 * - nomComplet: VARCHAR(100)
 * - login: VARCHAR(50)
 * - mot_de_passe_hash: VARCHAR(255)
 * - idRole: INTEGER - Référence à la table roles
 * - telephone: VARCHAR(20)
 * - actif: BOOLEAN
 * - date_creation_compte: DATETIME
 */

export interface CreateUserRequest {
  
  /** VARCHAR(100) - Nom complet de l'utilisateur */
  nomComplet: string;
  
  /** VARCHAR(50) - Identifiant de connexion (username) */
  login: string;
  
  /** VARCHAR(100) - Adresse email de l'utilisateur */
  email?: string;

  /** Champ temporaire pour le formulaire uniquement (non stocké en base) */
  password?: string;
  
  /** INTEGER - ID du rôle - Référence à la table roles */
  idRole: number;
  
  /** VARCHAR(20) - Numéro de téléphone (optionnel) */
  telephone?: string;
  
  /** BOOLEAN - Statut actif/inactif de l'utilisateur */
  actif: boolean;
  
}

export interface Utilisateur {
  /** INTEGER - Clé primaire, auto-increment */
  idUtilisateur?: number;
  
  /** VARCHAR(100) - Nom complet de l'utilisateur */
  nomComplet: string;
  
  /** VARCHAR(50) - Identifiant de connexion (username) */
  login: string;
  
  /** VARCHAR(100) - Adresse email de l'utilisateur */
  email?: string;
  
  /** VARCHAR(255) - Hash du mot de passe (stocké en base) */
  mot_de_passe_hash?: string;
  
  /** Champ temporaire pour le formulaire uniquement (non stocké en base) */
  password?: string;
  
  /** INTEGER - ID du rôle - Référence à la table roles */
  idRole?: number;
  
  /** Rôle complet (objet Role) ou nom du rôle (string) - Peut être retourné par l'API */
  role?: Role | string;
  
  /** VARCHAR(20) - Numéro de téléphone (optionnel) */
  telephone?: string;
  
  /** BOOLEAN - Statut actif/inactif de l'utilisateur */
  actif: boolean;
  
  /** DATETIME - Date de création du compte */
  dateCreationCompte?: string;
}

