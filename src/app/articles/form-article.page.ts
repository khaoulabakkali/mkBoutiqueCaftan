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
  IonButtons,
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
import { save, arrowBack, checkmark } from 'ionicons/icons';
import { ArticleService } from '../services/article.service';
import { Article } from '../models/article.model';
import { CategorieService } from '../services/categorie.service';
import { Categorie } from '../models/categorie.model';
import { TailleService } from '../services/taille.service';
import { Taille } from '../models/taille.model';
import { environment } from '../../environments/environment';

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
    IonButtons,
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
    addIcons({ save, arrowBack, checkmark });
    
    this.articleForm = this.formBuilder.group({
      nomArticle: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      prixLocationBase: [0, [Validators.required, Validators.min(0)]],
      prixAvanceBase: [0, [Validators.required, Validators.min(0)]],
      idTaille: ['', []],
      couleur: ['', []],
      photo: ['', []],
      idCategorie: ['', [Validators.required]],
      idSociete: [1, [Validators.required]], // Valeur par défaut, à ajuster selon votre logique
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
        if (!this.articleForm.get('idCategorie')?.value && data.length > 0) {
          this.articleForm.patchValue({ idCategorie: data[0].idCategorie });
        }
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des catégories:', error);
        }
      }
    });
  }

  loadTailles() {
    this.tailleService.getAllTailles().subscribe({
      next: (data) => {
        this.tailles = data;
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement des tailles:', error);
        }
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
          nomArticle: article.nomArticle,
          description: article.description,
          prixLocationBase: article.prixLocationBase,
          prixAvanceBase: article.prixAvanceBase,
          idTaille: article.idTaille ? article.idTaille.toString() : '',
          couleur: article.couleur || '',
          photo: article.photo || '',
          idCategorie: article.idCategorie,
          idSociete: article.idSociete,
          actif: article.actif
        });
        loading.then(l => l.dismiss());
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
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
        nomArticle: formValue.nomArticle,
        description: formValue.description,
        prixLocationBase: parseFloat(formValue.prixLocationBase),
        prixAvanceBase: parseFloat(formValue.prixAvanceBase),
        idTaille: formValue.idTaille ? parseInt(formValue.idTaille) : undefined,
        couleur: formValue.couleur || undefined,
        photo: formValue.photo || undefined,
        idCategorie: formValue.idCategorie,
        idSociete: formValue.idSociete,
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

  get nomArticle() {
    return this.articleForm.get('nomArticle');
  }

  get description() {
    return this.articleForm.get('description');
  }

  get prixLocationBase() {
    return this.articleForm.get('prixLocationBase');
  }

  get prixAvanceBase() {
    return this.articleForm.get('prixAvanceBase');
  }

  get idCategorie() {
    return this.articleForm.get('idCategorie');
  }

  onCancel() {
    this.router.navigate(['/articles']);
  }
}

