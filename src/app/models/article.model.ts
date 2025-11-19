import { Taille } from './taille.model';
import { Categorie } from './categorie.model';

/**
 * Modèle Article
 * Pour la gestion des articles dans l'application
 * 
 * Structure de la table articles (si base de données) :
 * - IdArticle: INTEGER (clé primaire, auto-increment)
 * - NomArticle: VARCHAR(150) NOT NULL
 * - Description: TEXT NOT NULL
 * - PrixLocationBase: DECIMAL(10, 2) NOT NULL
 * - PrixAvanceBase: DECIMAL(10, 2) NOT NULL
 * - IdTaille: INTEGER NULLABLE (référence à la table tailles)
 * - Couleur: VARCHAR(50) NULLABLE
 * - Photo: Longtext NULLABLE
 * - IdCategorie: INTEGER FK (référence à Categories)
 * - Actif: BOOLEAN NOT NULL
 */
export interface Article {
  /** INTEGER - Clé primaire, auto-increment */
  idArticle?: number;
  
  /** VARCHAR(150) - Le nom commercial de l'article */
  nomArticle: string;
  
  /** TEXT - Description complète (matière, style, etc.) */
  description: string;
  
  /** DECIMAL(10, 2) - Le prix de location standard par jour */
  prixLocationBase: number;
  
  /** DECIMAL(10, 2) - Le montant standard de l'avance */
  prixAvanceBase: number;
  
  /** INTEGER - La taille de l'article (référence à la table tailles) */
  idTaille?: number;
  
  /** VARCHAR(50) - La couleur de l'article */
  couleur?: string;
  
  /** Longtext - La photo de l'article (base64 ou URL) */
  photo?: string;
  
  /** INTEGER - Lien vers la catégorie (FK vers Categories) */
  idCategorie: number;
  
  /** BOOLEAN - Indique si l'article est visible dans le catalogue */
  actif: boolean;
  
  /** Propriétés de navigation */
  taille?: Taille;
  categorie?: Categorie;
}
