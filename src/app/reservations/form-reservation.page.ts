import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonMenuButton,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  ToastController,
  LoadingController,
  ModalController
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { save, arrowBack, add, chevronDown, checkmark, closeOutline, trash, image, camera, refresh, checkmarkCircle } from 'ionicons/icons';
import { ReservationService } from '../services/reservation.service';
import { Reservation, StatutReservation, ReservationArticle } from '../models/reservation.model';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';
import { ArticleService } from '../services/article.service';
import { Article } from '../models/article.model';
import { ImageService } from '../services/image.service';
import { ClientSelectionModalComponent } from './client-selection-modal.component';
import { IonImg } from '@ionic/angular/standalone';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-form-reservation',
  templateUrl: 'form-reservation.page.html',
  styleUrls: ['form-reservation.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonMenuButton,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons,
    IonIcon,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonImg,
  ReactiveFormsModule,
  FormsModule,
  CommonModule
  ],
})
export class FormReservationPage implements OnInit, OnDestroy {
  reservationForm: FormGroup;
  isEditMode = false;
  reservationId?: number;
  clients: Client[] = [];
  articles: Article[] = [];
  selectedArticles: Array<{ article: Article; quantite: number }> = [];
  statuts: StatutReservation[] = ['En attente', 'Confirmée', 'En cours', 'Terminée', 'Annulée'];
  private queryParamsSubscription?: Subscription;
  selectedClient: Client | null = null;
  carteIdentitePreview: string | null = null;
  carteIdentiteFromClient: boolean = false;
  isUploadingCarteIdentite = false;

  constructor(
    private formBuilder: FormBuilder,
    private reservationService: ReservationService,
    private clientService: ClientService,
    private articleService: ArticleService,
    private imageService: ImageService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {
    addIcons({ save, arrowBack, add, chevronDown, checkmark, closeOutline, trash, image, camera, refresh, checkmarkCircle });
    
    this.reservationForm = this.formBuilder.group({
      idClient: ['', [Validators.required]],
      dateReservation: [new Date().toISOString().slice(0, 16), [Validators.required]],
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]],
      montantTotal: [0, [Validators.required, Validators.min(0)]],
      statutReservation: ['En attente', [Validators.required]],
      idPaiement: ['', []],
      remiseAppliquee: [0, [Validators.required, Validators.min(0)]],
      photoCarteIdentite: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadClients();
    this.loadArticles();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.reservationId = +id;
      this.loadReservation();
    } else {
      // Vérifier si un clientId a été passé en paramètre (après création d'un client)
      this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
        const clientId = params['clientId'];
        if (clientId) {
          // Recharger les clients pour inclure le nouveau
          this.loadClients();
          // Sélectionner le nouveau client après le chargement
          setTimeout(() => {
            this.reservationForm.patchValue({ idClient: +clientId });
          }, 500);
        }
      });
    }
  }

  ngOnDestroy() {
    // Désabonner pour éviter les fuites mémoire
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  loadClients() {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
        // Si un clientId a été passé en paramètre, ne pas sélectionner automatiquement
        const clientId = this.route.snapshot.queryParams['clientId'];
        if (!clientId && !this.reservationForm.get('idClient')?.value && data.length > 0) {
          // Ne pas sélectionner automatiquement le premier client
        }
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des clients:', error);
        }
      }
    });
  }

  loadArticles() {
    this.articleService.getAllArticles().subscribe({
      next: (data) => {
        // Filtrer uniquement les articles actifs
        this.articles = data.filter(article => article.actif);
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des articles:', error);
        }
      }
    });
  }

  getSelectedClientName(): string {
    const clientId = this.reservationForm.get('idClient')?.value;
    if (!clientId) return '';
    
    const client = this.clients.find(c => c.idClient === clientId);
    return client ? `${client.prenomClient} ${client.nomClient} - ${client.telephone}` : '';
  }

  async openClientModal() {
    // Recharger les clients avant d'ouvrir le modal pour avoir la liste à jour
    await new Promise<void>((resolve) => {
      this.clientService.getAllClients().subscribe({
        next: (data) => {
          this.clients = data;
          resolve();
        },
        error: (error) => {
          if (!environment.production) {
          console.error('Erreur lors du chargement des clients:', error);
        }
          resolve(); // Continuer même en cas d'erreur
        }
      });
    });
    
    const modal = await this.modalController.create({
      component: ClientSelectionModalComponent,
      componentProps: {
        clients: this.clients,
        searchTerm: ''
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        if (data.data.action === 'select' && data.data.clientId) {
          this.reservationForm.patchValue({ idClient: data.data.clientId });
          this.loadClientCarteIdentite(data.data.clientId);
        } else if (data.data.action === 'new') {
          this.addNewClient();
        }
      }
    });

    await modal.present();
  }

  addNewClient() {
    // Le modal est déjà fermé à ce stade (appelé depuis onDidDismiss)
    // Construire le chemin de base à partir des segments d'URL (non encodés)
    const urlSegments = this.route.snapshot.url.map(segment => segment.path);
    let currentRoute = '/' + urlSegments.join('/');
    
    // Si on est en mode édition, remplacer 'edit' et l'ID par 'new'
    if (this.isEditMode && this.reservationId) {
      currentRoute = '/reservations/new';
    }
    
    // Naviguer vers le formulaire de client avec le paramètre returnTo
    // Utiliser un tableau de segments pour éviter les problèmes d'encodage
    this.router.navigate(['/clients', 'new'], { 
      queryParams: { returnTo: currentRoute }
    });
  }

  loadReservation() {
    if (!this.reservationId) return;

    const loading = this.loadingController.create({
      message: 'Chargement...'
    });
    loading.then(l => l.present());

    this.reservationService.getReservationById(this.reservationId).subscribe({
      next: (reservation) => {
        // Formater les dates pour les inputs
        const dateReservation = reservation.dateReservation ? new Date(reservation.dateReservation).toISOString().slice(0, 16) : '';
        // Formater les dates pour les inputs de type "date" (format YYYY-MM-DD)
        const dateDebut = reservation.dateDebut ? new Date(reservation.dateDebut).toISOString().slice(0, 10) : '';
        const dateFin = reservation.dateFin ? new Date(reservation.dateFin).toISOString().slice(0, 10) : '';
        
        this.reservationForm.patchValue({
          idClient: reservation.idClient,
          dateReservation: dateReservation,
          dateDebut: dateDebut,
          dateFin: dateFin,
          montantTotal: reservation.montantTotal,
          statutReservation: reservation.statutReservation,
          idPaiement: reservation.idPaiement || '',
          remiseAppliquee: reservation.remiseAppliquee || 0,
          photoCarteIdentite: reservation.photoCarteIdentite || ''
        });
        
        // Afficher l'aperçu de la carte d'identité si elle existe
        if (reservation.photoCarteIdentite) {
          this.carteIdentitePreview = reservation.photoCarteIdentite;
          this.carteIdentiteFromClient = false; // En édition, on considère qu'elle vient de la réservation
        }
        
        // Charger les articles de la réservation
        if (reservation.articles && reservation.articles.length > 0) {
          this.selectedArticles = [];
          reservation.articles.forEach(resArticle => {
            const article = this.articles.find(a => a.idArticle === resArticle.article?.idArticle);
            if (article) {
              this.selectedArticles.push({
                article: article,
                quantite: resArticle.quantite || 1
              });
            }
          });
          // Recalculer le montant total après chargement des articles
          this.calculateTotal();
        }
        
        // Charger les informations du client pour vérifier si la carte vient de lui
        this.loadClientCarteIdentite(reservation.idClient);
        
        loading.then(l => l.dismiss());
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        loading.then(l => l.dismiss());
        this.showToast('Erreur lors du chargement de la réservation', 'danger');
        this.router.navigate(['/reservations']);
      }
    });
  }

  async onSubmit() {
    if (this.reservationForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEditMode ? 'Modification...' : 'Création...'
      });
      await loading.present();

      const formValue = this.reservationForm.value;
      
      // Préparer les articles pour l'API
      const articles: ReservationArticle[] = this.selectedArticles.map(item => ({
        article: item.article,
        quantite: item.quantite,
        nomArticle: item.article.nomArticle
      }));
      
      const reservationData: Reservation = {
        idClient: formValue.idClient,
        dateReservation: formValue.dateReservation,
        dateDebut: formValue.dateDebut,
        dateFin: formValue.dateFin,
        montantTotal: parseFloat(formValue.montantTotal),
        statutReservation: formValue.statutReservation,
        photoCarteIdentite: formValue.photoCarteIdentite || undefined,
        idPaiement: formValue.idPaiement || undefined,
        remiseAppliquee: parseFloat(formValue.remiseAppliquee) || 0,
        articles: articles.length > 0 ? articles : undefined
      };

      if (this.isEditMode && this.reservationId) {
        this.reservationService.updateReservation(this.reservationId, reservationData).subscribe({
          next: () => {
            loading.dismiss();
            this.showToast('Réservation modifiée avec succès', 'success');
            this.router.navigate(['/reservations']);
          },
          error: (error) => {
            loading.dismiss();
            const errorMessage = error?.message || 'Erreur lors de la modification';
            this.showToast(errorMessage, 'danger');
          }
        });
      } else {
        this.reservationService.createReservation(reservationData).subscribe({
          next: () => {
            loading.dismiss();
            this.showToast('Réservation créée avec succès', 'success');
            this.router.navigate(['/reservations']);
          },
          error: (error) => {
            loading.dismiss();
            const errorMessage = error?.message || 'Erreur lors de la création';
            this.showToast(errorMessage, 'danger');
          }
        });
      }
    } else {
      Object.keys(this.reservationForm.controls).forEach(key => {
        this.reservationForm.get(key)?.markAsTouched();
      });
      this.showToast('Veuillez remplir tous les champs requis', 'warning');
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  get idClient() {
    return this.reservationForm.get('idClient');
  }

  get dateReservation() {
    return this.reservationForm.get('dateReservation');
  }

  get dateDebut() {
    return this.reservationForm.get('dateDebut');
  }

  get dateFin() {
    return this.reservationForm.get('dateFin');
  }

  get montantTotal() {
    return this.reservationForm.get('montantTotal');
  }

  get statutReservation() {
    return this.reservationForm.get('statutReservation');
  }

  get remiseAppliquee() {
    return this.reservationForm.get('remiseAppliquee');
  }

  onCancel() {
    this.router.navigate(['/reservations']);
  }

  /**
   * Obtenir les articles disponibles (non encore sélectionnés)
   */
  getAvailableArticles(): Article[] {
    return this.articles.filter(article => 
      !this.selectedArticles.some(selected => selected.article.idArticle === article.idArticle)
    );
  }

  /**
   * Ajouter un article à la réservation
   */
  addArticle(articleId?: number) {
    let articleToAdd: Article | undefined;
    
    if (articleId) {
      // Si un ID est fourni, utiliser cet article
      articleToAdd = this.articles.find(a => a.idArticle === articleId);
    } else {
      // Sinon, prendre le premier article disponible
      articleToAdd = this.getAvailableArticles()[0];
    }
    
    if (articleToAdd && !this.selectedArticles.some(selected => selected.article.idArticle === articleToAdd!.idArticle)) {
      this.selectedArticles.push({
        article: articleToAdd,
        quantite: 1
      });
      this.calculateTotal();
    } else if (!articleToAdd) {
      this.showToast('Aucun article disponible', 'warning');
    } else {
      this.showToast('Cet article est déjà ajouté', 'warning');
    }
  }

  /**
   * Supprimer un article de la réservation
   */
  removeArticle(index: number) {
    if (index >= 0 && index < this.selectedArticles.length) {
      this.selectedArticles.splice(index, 1);
      this.calculateTotal();
    }
  }

  /**
   * Mettre à jour la quantité d'un article
   */
  updateQuantite(index: number, quantite: string | number | null | undefined) {
    if (index < 0 || index >= this.selectedArticles.length) {
      return;
    }
    
    // Gérer les valeurs null ou undefined
    if (quantite === null || quantite === undefined) {
      return;
    }
    
    const qty = typeof quantite === 'string' ? parseInt(quantite, 10) : quantite;
    if (qty > 0 && !isNaN(qty)) {
      this.selectedArticles[index].quantite = qty;
      this.calculateTotal();
    }
  }

  /**
   * Calculer le montant total basé sur les articles sélectionnés
   */
  calculateTotal() {
    let total = 0;
    const dateDebut = this.reservationForm.get('dateDebut')?.value;
    const dateFin = this.reservationForm.get('dateFin')?.value;
    
    if (dateDebut && dateFin) {
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      const jours = Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24));
      
      if (jours > 0) {
        this.selectedArticles.forEach(item => {
          total += item.article.prixLocationBase * item.quantite * jours;
        });
      }
    }
    
    // Appliquer la remise
    const remise = parseFloat(this.reservationForm.get('remiseAppliquee')?.value || '0') || 0;
    total = total - remise;
    
    if (total < 0) total = 0;
    
    // Convertir en nombre avec 2 décimales
    const totalNumber = parseFloat(total.toFixed(2));
    this.reservationForm.patchValue({ montantTotal: totalNumber });
  }

  /**
   * Obtenir le nom d'un article
   */
  getArticleName(idArticle?: number): string {
    if (!idArticle) return '';
    const article = this.articles.find(a => a.idArticle === idArticle);
    return article ? article.nomArticle : '';
  }

  /**
   * Charge la carte d'identité du client sélectionné si elle existe
   */
  loadClientCarteIdentite(clientId: number) {
    this.clientService.getClientById(clientId).subscribe({
      next: (client) => {
        this.selectedClient = client;
        if (client.photoCarteIdentite && !this.carteIdentitePreview) {
          // Le client a déjà une carte d'identité, on l'utilise
          this.reservationForm.patchValue({ photoCarteIdentite: client.photoCarteIdentite });
          this.carteIdentitePreview = client.photoCarteIdentite;
          this.carteIdentiteFromClient = true;
          this.showToast('Carte d\'identité récupérée depuis la fiche client', 'success');
        } else if (!client.photoCarteIdentite) {
          // Le client n'a pas de carte d'identité, on doit l'ajouter
          if (!this.carteIdentitePreview) {
            this.reservationForm.patchValue({ photoCarteIdentite: '' });
            this.carteIdentitePreview = null;
            this.carteIdentiteFromClient = false;
            this.reservationForm.get('photoCarteIdentite')?.setErrors({ required: true });
            this.reservationForm.get('photoCarteIdentite')?.markAsTouched();
          }
        }
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement du client:', error);
        }
      }
    });
  }

  /**
   * Sélectionne une image de carte d'identité depuis la galerie
   */
  async selectCarteIdentite() {
    try {
      this.isUploadingCarteIdentite = true;
      const file = await this.imageService.triggerFileInput('image/*');
      
      if (!file) {
        this.isUploadingCarteIdentite = false;
        return;
      }

      const loading = await this.loadingController.create({
        message: 'Traitement de l\'image...'
      });
      await loading.present();

      const result = await this.imageService.processImageFile(file);
      
      // Mettre à jour le formulaire avec le base64
      this.reservationForm.patchValue({ photoCarteIdentite: result.base64 });
      this.carteIdentitePreview = result.base64;
      this.carteIdentiteFromClient = false;
      
      await loading.dismiss();
      this.isUploadingCarteIdentite = false;
      this.showToast('Image de la carte d\'identité ajoutée avec succès', 'success');
    } catch (error: any) {
      this.isUploadingCarteIdentite = false;
      const errorMessage = error?.message || 'Erreur lors de l\'upload de l\'image';
      this.showToast(errorMessage, 'danger');
    }
  }

  /**
   * Prend une photo de la carte d'identité avec la caméra
   */
  async takeCarteIdentitePhoto() {
    try {
      this.isUploadingCarteIdentite = true;
      
      // Utiliser l'input file avec l'attribut capture pour ouvrir la caméra
      const file = await this.imageService.triggerCameraInput();
      
      if (!file) {
        this.isUploadingCarteIdentite = false;
        return;
      }

      const loading = await this.loadingController.create({
        message: 'Traitement de la photo...'
      });
      await loading.present();

      const result = await this.imageService.processImageFile(file);
      
      // Mettre à jour le formulaire avec le base64
      this.reservationForm.patchValue({ photoCarteIdentite: result.base64 });
      this.carteIdentitePreview = result.base64;
      this.carteIdentiteFromClient = false;
      
      await loading.dismiss();
      this.isUploadingCarteIdentite = false;
      this.showToast('Photo de la carte d\'identité ajoutée avec succès', 'success');
    } catch (error: any) {
      this.isUploadingCarteIdentite = false;
      const errorMessage = error?.message || 'Erreur lors de la prise de photo';
      this.showToast(errorMessage, 'danger');
    }
  }

  /**
   * Remplace la carte d'identité récupérée du client par une nouvelle
   */
  replaceCarteIdentite() {
    this.carteIdentiteFromClient = false;
    this.carteIdentitePreview = null;
    this.reservationForm.patchValue({ photoCarteIdentite: '' });
    this.reservationForm.get('photoCarteIdentite')?.setErrors({ required: true });
    this.reservationForm.get('photoCarteIdentite')?.markAsTouched();
  }

  /**
   * Supprime la carte d'identité sélectionnée
   */
  removeCarteIdentite() {
    this.reservationForm.patchValue({ photoCarteIdentite: '' });
    this.carteIdentitePreview = null;
    this.carteIdentiteFromClient = false;
    this.reservationForm.get('photoCarteIdentite')?.setErrors({ required: true });
    this.reservationForm.get('photoCarteIdentite')?.markAsTouched();
    this.showToast('Photo de la carte d\'identité supprimée', 'success');
  }

  get photoCarteIdentite() {
    return this.reservationForm.get('photoCarteIdentite');
  }
}

