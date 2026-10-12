import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Loader } from './loader';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(Loader);

  loader.show();

  return next(req).pipe(
    finalize(() => loader.hide())
  );
};