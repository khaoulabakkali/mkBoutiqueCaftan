import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const societeId = authService.getSocieteId();

  // Préparer les headers à ajouter
  const headers: { [key: string]: string } = {};

  // Ajouter le token seulement si disponible et si la requête n'a pas déjà un header Authorization
  if (token && !req.headers.has('Authorization')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Ajouter le societeId comme header si disponible et si la requête n'a pas déjà ce header
  if (societeId !== null && !req.headers.has('X-Societe-Id')) {
    headers['X-Societe-Id'] = societeId.toString();
  }

  // Cloner la requête avec les nouveaux headers si nécessaire
  if (Object.keys(headers).length > 0) {
    req = req.clone({
      setHeaders: headers
    });
  }

  return next(req);
};

