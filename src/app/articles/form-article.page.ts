import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonMenuButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { save, arrowBack } from 'ionicons/icons';
import { ArticleService } from '../services/article.service';
import { Article } from '../models/article.model';
import { CategorieService } from '../services/categorie.service';
import { Categorie } from '../models/categorie.model';
import { TailleService } from '../services/taille.service';
import { Taille } from '../models/taille.model';

@Component({
  selector: 'app-form-article',
  templateUrl: 'form-article.page.html',
  styleUrls: ['form-article.page.scss'],
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
    IonTextarea,
    IonButton,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    ReactiveFormsModule,
    CommonModule
  ],
})
export class FormArticlePage implements OnInit {
  articleForm: FormGroup;
  isEditMode = false;
  articleId?: number;
  categories: Categorie[] = [];
  tailles: Taille[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private articleService: ArticleService,
    private categorieService: CategorieService,
    private tailleService: TailleService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ save, arrowBack });
    
    this.articleForm = this.formBuilder.group({
      nom_article: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      prix_location_base: [0, [Validators.required, Validators.min(0)]],
      prix_avance_base: [0, [Validators.required, Validators.min(0)]],
      id_taille: ['', []],
      couleur: ['', []],
      photo: ['', []],
      id_categorie: ['', [Validators.required]],
      actif: [true, [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadTailles();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.articleId = +id;
      this.loadArticle();
    }
  }

  loadCategories() {
    this.categorieService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        // Si aucun catégorie n'est sélectionnée et qu'il y a des catégories, sélectionner la première
        if (!this.articleForm.get('id_categorie')?.value && data.length > 0) {
          this.articleForm.patchValue({ id_categorie: data[0].id_categorie });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    });
  }

  loadTailles() {
    this.tailleService.getAllTailles().subscribe({
      next: (data) => {
        this.tailles = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tailles:', error);
      }
    });
  }

  loadArticle() {
    if (!this.articleId) return;

    const loading = this.loadingController.create({
      message: 'Chargement...'
    });
    loading.then(l => l.present());

    this.articleService.getArticleById(this.articleId).subscribe({
      next: (article) => {
        this.articleForm.patchValue({
          nom_article: article.nom_article,
          description: article.description,
          prix_location_base: article.prix_location_base,
          prix_avance_base: article.prix_avance_base,
          id_taille: article.id_taille || '',
          couleur: article.couleur || '',
          photo: article.photo || '',
          id_categorie: article.id_categorie,
          actif: article.actif
        });
        loading.then(l => l.dismiss());
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        loading.then(l => l.dismiss());
        this.showToast('Erreur lors du chargement de l\'article', 'danger');
        this.router.navigate(['/articles']);
      }
    });
  }

  async onSubmit() {
    if (this.articleForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEditMode ? 'Modification...' : 'Création...'
      });
      await loading.present();

      const formValue = this.articleForm.value;
      const articleData: Article = {
        nom_article: formValue.nom_article,
        description: formValue.description,
        prix_location_base: parseFloat(formValue.prix_location_base),
        prix_avance_base: parseFloat(formValue.prix_avance_base),
        id_taille: formValue.id_taille || undefined,
        couleur: formValue.couleur || undefined,
        photo: formValue.photo || undefined,
        id_categorie: formValue.id_categorie,
        actif: formValue.actif
      };

      if (this.isEditMode && this.articleId) {
        this.articleService.updateArticle(this.articleId, articleData).subscribe({
          next: () => {
            loading.dismiss();
            this.showToast('Article modifié avec succès', 'success');
            this.router.navigate(['/articles']);
          },
          error: (error) => {
            loading.dismiss();
            const errorMessage = error?.message || 'Erreur lors de la modification';
            this.showToast(errorMessage, 'danger');
          }
        });
      } else {
        this.articleService.createArticle(articleData).subscribe({
          next: () => {
            loading.dismiss();
            this.showToast('Article créé avec succès', 'success');
            this.router.navigate(['/articles']);
          },
          error: (error) => {
            loading.dismiss();
            const errorMessage = error?.message || 'Erreur lors de la création';
            this.showToast(errorMessage, 'danger');
          }
        });
      }
    } else {
      Object.keys(this.articleForm.controls).forEach(key => {
        this.articleForm.get(key)?.markAsTouched();
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

  get nom_article() {
    return this.articleForm.get('nom_article');
  }

  get description() {
    return this.articleForm.get('description');
  }

  get prix_location_base() {
    return this.articleForm.get('prix_location_base');
  }

  get prix_avance_base() {
    return this.articleForm.get('prix_avance_base');
  }

  get id_categorie() {
    return this.articleForm.get('id_categorie');
  }

  onCancel() {
    this.router.navigate(['/articles']);
  }
}

