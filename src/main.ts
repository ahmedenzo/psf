import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';
import { environment } from '../environment.prod'; 

if (environment.production && !environment.enableLogging) {
    // Override console methods
    console.log = () => {}; // Disable console.log
    console.warn = () => {}; // Optional: Disable console.warn
    console.info = () => {}; // Optional: Disable console.info
    console.debug = () => {}; // Optional: Disable console.debug
    window.console.log = () => {};
    window.console.warn = () => {};
    window.console.error = () => {};
    console.error = console.error; // Keep console.error (Optional, can be disabled too)
  }

bootstrapApplication(AppComponent, appConfig)
    .catch(err => console.error(err));
