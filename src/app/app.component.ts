// src/app/app.component.ts
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InactivityServiceService } from './core/auth/inactivity-service.service'; 

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss'],
    standalone : true,
    imports    : [RouterOutlet],
})
export class AppComponent
{
    
    private inactivityService = inject(InactivityServiceService); // Inject InactivityServiceService

    /**
     * Constructor
     */
    constructor()
    {
        // Initializing the inactivity service will start monitoring user inactivity
    }
}


