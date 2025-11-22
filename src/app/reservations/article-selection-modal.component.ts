import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonImg
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { close, imageOutline, alertCircle } from 'ionicons/icons';
import { Article } from '../models/article.model';
import { Reservation } from '../models/reservation.model';

@Component({
  selector: 'app-article-selection-modal',
  templateUrl: 'article-selection-modal.component.html',
  styleUrls: ['article-selection-modal.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonImg,
    CommonModule,
    FormsModule
  ],
})
export class ArticleSelectionModalComponent implements OnInit {
  @Input() articles: Article[] = [];
  @Input() searchTerm: string = '';
  @Input() dateDebut?: string;
  @Input() dateFin?: string;
  @Input() reservations: Reservation[] = [];
  @Input() excludeReservationId?: number;
  
  articlesFiltres: Article[] = [];
  articleAvailability: Map<number, { available: boolean; conflictingReservation?: any }> = new Map();

  constructor(private modalController: ModalController) {
    addIcons({ close, imageOutline, alertCircle });
  }

  ngOnInit() {
    this.checkArticleAvailability();
    this.articlesFiltres = this.articles;
    if (this.searchTerm) {
      this.filterArticles();
    }
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterArticles();
  }

  filterArticles() {
    if (!this.searchTerm.trim()) {
      this.articlesFiltres = this.articles;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.articlesFiltres = this.articles.filter(
      (article) =>
        article.nomArticle.toLowerCase().includes(term) ||
        (article.couleur && article.couleur.toLowerCase().includes(term)) ||
        (article.description && article.description.toLowerCase().includes(term))
    );
  }

  checkArticleAvailability() {
    if (!this.dateDebut || !this.dateFin) {
      // Si pas de dates, tous les articles sont disponibles
      this.articles.forEach(article => {
        if (article.idArticle) {
          this.articleAvailability.set(article.idArticle, { available: true });
        }
      });
      return;
    }

    const debut = new Date(this.dateDebut);
    debut.setHours(0, 0, 0, 0);
    const fin = new Date(this.dateFin);
    fin.setHours(23, 59, 59, 999);

    this.articles.forEach(article => {
      if (!article.idArticle) {
        return;
      }

      let available = true;
      let conflictingReservation: any = undefined;

      // Vérifier dans toutes les réservations
      for (const reservation of this.reservations) {
        // Ignorer la réservation en cours d'édition
        if (this.excludeReservationId && reservation.idReservation === this.excludeReservationId) {
          continue;
        }

        // Ignorer les réservations annulées ou terminées
        if (reservation.statutReservation === 'Annulée' || reservation.statutReservation === 'Terminée') {
          continue;
        }

        // Vérifier si la réservation contient l'article
        if (reservation.articles && reservation.articles.length > 0) {
          const hasArticle = reservation.articles.some(resArticle => 
            resArticle.article?.idArticle === article.idArticle
          );

          if (hasArticle) {
            // Vérifier si les périodes se chevauchent
            const resDebut = new Date(reservation.dateDebut);
            resDebut.setHours(0, 0, 0, 0);
            const resFin = new Date(reservation.dateFin);
            resFin.setHours(23, 59, 59, 999);

            // Vérifier le chevauchement
            if (debut <= resFin && fin >= resDebut) {
              available = false;
              conflictingReservation = reservation;
              break;
            }
          }
        }
      }

      this.articleAvailability.set(article.idArticle, { available, conflictingReservation });
    });
  }

  isArticleAvailable(articleId?: number): boolean {
    if (!articleId) return false;
    return this.articleAvailability.get(articleId)?.available ?? true;
  }

  getConflictingReservation(articleId?: number): any {
    if (!articleId) return undefined;
    return this.articleAvailability.get(articleId)?.conflictingReservation;
  }

  selectArticle(articleId: number) {
    const availability = this.articleAvailability.get(articleId);
    if (availability && !availability.available) {
      // Ne pas permettre la sélection si l'article n'est pas disponible
      return;
    }
    this.modalController.dismiss({ action: 'select', articleId });
  }

  close() {
    this.modalController.dismiss();
  }

  getArticleDisplayName(article: Article): string {
    let name = article.nomArticle;
    if (article.couleur) {
      name += ` - ${article.couleur}`;
    }
    return name;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}

