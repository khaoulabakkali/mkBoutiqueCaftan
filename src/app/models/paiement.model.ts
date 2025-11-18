/**
 * Modèle Paiement
 * Pour la gestion des paiements dans l'application
 * 
 * Structure de la table paiements (si base de données) :
 * - id_paiement: INTEGER (clé primaire, auto-increment)
 * - montant: DECIMAL(10, 2) NOT NULL
 * - reference_paiement: VARCHAR(100) NULLABLE
 */
export interface Paiement {
  /** INTEGER - Clé primaire, auto-increment */
  id_paiement?: number;
  
  /** DECIMAL(10, 2) - Montant du paiement */
  montant: number;
  
  /** VARCHAR(100) - Référence du paiement (numéro de transaction, chèque, etc.) */
  reference_paiement?: string;
}

