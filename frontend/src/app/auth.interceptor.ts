import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // Clone request and add headers
  req = req.clone({
    setHeaders: {
      'Content-Type': 'application/json', // ✅ Add Content-Type
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // ✅ Add token if available
    },
  });

  return next(req);
};
