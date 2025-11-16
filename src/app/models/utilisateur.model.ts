export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  MANAGER = 'MANAGER'
}

export interface Utilisateur {
  id_utilisateur?: number;
  nom_complet: string;
  login: string;
  mot_de_passe_hash?: string;
  mot_de_passe?: string; // Pour le formulaire uniquement
  role: Role;
  telephone?: string;
  actif: boolean;
  date_creation_compte?: string;
}

