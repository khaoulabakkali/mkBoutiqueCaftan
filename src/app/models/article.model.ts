/**
 * Modèle Article
 * Pour la gestion des articles dans l'application
 * 
 * Structure de la table articles (si base de données) :
 * - id_article: INTEGER (clé primaire, auto-increment)
 * - nom_article: VARCHAR(150) NOT NULL
 * - description: TEXT NOT NULL
 * - prix_location_base: DECIMAL(10, 2) NOT NULL
 * - prix_avance_base: DECIMAL(10, 2) NOT NULL
 * - idTaille: VARCHAR(20) NULLABLE (référence à la table tailles)
 * - photo: Longtext NULLABLE
 * - idCategorie: INTEGER FK (référence à Categories)
 * - actif: BOOLEAN NOT NULL
 */
export interface Article {
  /** INTEGER - Clé primaire, auto-increment */
  id_article?: number;
  
  /** VARCHAR(150) - Le nom commercial de l'article */
  nom_article: string;
  
  /** TEXT - Description complète (matière, style, etc.) */
  description: string;
  
  /** DECIMAL(10, 2) - Le prix de location standard par jour */
  prix_location_base: number;
  
  /** DECIMAL(10, 2) - Le montant standard de l'avance */
  prix_avance_base: number;
  
  /** VARCHAR(20) - La taille de l'article (référence à la table tailles) */
  idTaille?: string;
  
  /** VARCHAR(50) - La couleur de l'article */
  couleur?: string;
  
  /** Longtext - La photo de l'article (base64 ou URL) */
  photo?: string;
  
  /** INTEGER - Lien vers la catégorie (FK vers Categories) */
  idCategorie: number;
  
  /** BOOLEAN - Indique si l'article est visible dans le catalogue */
  actif: boolean;
}

