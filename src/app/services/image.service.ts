import { Injectable } from '@angular/core';

export interface ImageUploadResult {
  base64: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_WIDTH = 1920;
  private readonly MAX_HEIGHT = 1920;
  private readonly QUALITY = 0.8; // Compression quality (0-1)

  /**
   * Lit un fichier et le convertit en base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.size > this.MAX_FILE_SIZE) {
        reject(new Error(`Le fichier est trop volumineux. Taille maximale: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compresse une image et retourne le base64 compressé
   */
  async compressImage(base64: string, maxWidth: number = this.MAX_WIDTH, maxHeight: number = this.MAX_HEIGHT, quality: number = this.QUALITY): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculer les nouvelles dimensions en gardant le ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'));
          return;
        }

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en base64 avec compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };

      img.onerror = () => {
        reject(new Error('Erreur lors du chargement de l\'image'));
      };

      img.src = base64;
    });
  }

  /**
   * Traite un fichier image : validation, compression et conversion en base64
   */
  async processImageFile(file: File): Promise<ImageUploadResult> {
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier sélectionné n\'est pas une image');
    }

    // Vérifier la taille
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`Le fichier est trop volumineux. Taille maximale: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Convertir en base64
    let base64 = await this.fileToBase64(file);

    // Compresser l'image
    base64 = await this.compressImage(base64);

    return {
      base64,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type
    };
  }

  /**
   * Crée un input file et déclenche la sélection
   */
  triggerFileInput(accept: string = 'image/*'): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.style.display = 'none';

      input.onchange = (event: any) => {
        const file = event.target.files?.[0] || null;
        document.body.removeChild(input);
        resolve(file);
      };

      input.oncancel = () => {
        document.body.removeChild(input);
        resolve(null);
      };

      document.body.appendChild(input);
      input.click();
    });
  }

  /**
   * Vérifie si une chaîne est une URL valide
   */
  isUrl(str: string): boolean {
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Vérifie si une chaîne est du base64
   */
  isBase64(str: string): boolean {
    if (!str || str.trim() === '') {
      return false;
    }
    // Vérifier le format base64 (commence par data:image)
    return str.startsWith('data:image/');
  }

  /**
   * Extrait le type MIME depuis une chaîne base64
   */
  getMimeTypeFromBase64(base64: string): string {
    const match = base64.match(/data:([^;]+);base64/);
    return match ? match[1] : 'image/jpeg';
  }
}

