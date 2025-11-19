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
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { save, arrowBack, checkmark } from 'ionicons/icons';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-form-client',
  templateUrl: 'form-client.page.html',
  styleUrls: ['form-client.page.scss'],
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
    ReactiveFormsModule,
    CommonModule
  ],
})
export class FormClientPage implements OnInit {
  clientForm: FormGroup;
  isEditMode = false;
  clientId?: number;
  returnTo?: string;

  constructor(
    private formBuilder: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ save, arrowBack, checkmark });
    
    this.clientForm = this.formBuilder.group({
      nomClient: ['', [Validators.required, Validators.minLength(2)]],
      prenomClient: ['', [Validators.required, Validators.minLength(2)]],
      telephone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-]+$/)]],
      email: ['', [Validators.email]],
      adressePrincipale: ['', []],
      totalCommandes: [0, [Validators.required, Validators.min(0)]],
      actif: [true, [Validators.required]]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.clientId = +id;
      this.loadClient();
    }
    
    // Vérifier si on vient d'une autre page (ex: formulaire de réservation)
    const returnTo = this.route.snapshot.queryParams['returnTo'];
    if (returnTo) {
      // Décoder le paramètre returnTo au cas où il serait encodé
      try {
        this.returnTo = decodeURIComponent(returnTo);
      } catch (e) {
        // Si le décodage échoue, utiliser la valeur telle quelle
        this.returnTo = returnTo;
      }
    }
  }

  loadClient() {
    if (!this.clientId) return;

    const loading = this.loadingController.create({
      message: 'Chargement...'
    });
    loading.then(l => l.present());

    this.clientService.getClientById(this.clientId).subscribe({
      next: (client) => {
        this.clientForm.patchValue({
          nomClient: client.nomClient,
          prenomClient: client.prenomClient,
          telephone: client.telephone,
          email: client.email || '',
          adressePrincipale: client.adressePrincipale || '',
          totalCommandes: client.totalCommandes || 0,
          actif: client.actif !== undefined ? client.actif : true
        });
        loading.then(l => l.dismiss());
      },
      error: (error) => {
        if (!environment.production) {
          console.error('Erreur lors du chargement:', error);
        }
        loading.then(l => l.dismiss());
        this.showToast('Erreur lors du chargement du client', 'danger');
        this.router.navigate(['/clients']);
      }
    });
  }

  async onSubmit() {
    if (this.clientForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEditMode ? 'Modification...' : 'Création...'
      });
      await loading.present();

      const clientData: Client = this.clientForm.value;

      if (this.isEditMode && this.clientId) {
        this.clientService.updateClient(this.clientId, clientData).subscribe({
          next: () => {
            loading.dismiss();
            this.showToast('Client modifié avec succès', 'success');
            this.router.navigate(['/clients']);
          },
          error: (error) => {
            loading.dismiss();
            const errorMessage = error?.message || 'Erreur lors de la modification';
            this.showToast(errorMessage, 'danger');
          }
        });
      } else {
        this.clientService.createClient(clientData).subscribe({
          next: (newClient) => {
            loading.dismiss();
            this.showToast('Client créé avec succès', 'success');
            // Si on vient d'une autre page, y retourner avec le nouvel ID client
            if (this.returnTo) {
              // S'assurer que returnTo commence par / et n'est pas encodé
              const returnPath = this.returnTo.startsWith('/') ? this.returnTo : '/' + this.returnTo;
              this.router.navigate([returnPath], { 
                queryParams: { clientId: newClient.idClient },
                replaceUrl: true
              });
            } else {
              this.router.navigate(['/clients']);
            }
          },
          error: (error) => {
            loading.dismiss();
            const errorMessage = error?.message || 'Erreur lors de la création';
            this.showToast(errorMessage, 'danger');
          }
        });
      }
    } else {
      Object.keys(this.clientForm.controls).forEach(key => {
        this.clientForm.get(key)?.markAsTouched();
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

  get nomClient() {
    return this.clientForm.get('nomClient');
  }

  get prenomClient() {
    return this.clientForm.get('prenomClient');
  }

  get telephone() {
    return this.clientForm.get('telephone');
  }

  get email() {
    return this.clientForm.get('email');
  }

  get adressePrincipale() {
    return this.clientForm.get('adressePrincipale');
  }

  get totalCommandes() {
    return this.clientForm.get('totalCommandes');
  }

  get actif() {
    return this.clientForm.get('actif');
  }

  onCancel() {
    this.router.navigate(['/clients']);
  }
}

