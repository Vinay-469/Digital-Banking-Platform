import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr'
import { provideNgIdleKeepalive } from '@ng-idle/keepalive';
import { loaderInterceptor } from './Shared/loader-interceptor';
import { NgHttpLoaderModule } from 'ng-http-loader';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      progressBar : true,
      positionClass : 'toast-top-right',
      preventDuplicates : true,
      closeButton:true,
      newestOnTop: true,
    }),
    provideNgIdleKeepalive(),
     provideHttpClient(
      withInterceptors([loaderInterceptor]) 
    ),
    importProvidersFrom(NgHttpLoaderModule.forRoot())
  ]
  
};
