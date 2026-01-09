
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { HelpCenterService } from 'app/modules/admin/apps/help-center/help-center.service';
import { GuideCategory } from 'app/modules/admin/apps/help-center/help-center.type';
import { Subject, takeUntil } from 'rxjs';
@Component({
    selector     : 'datatable',
    templateUrl  : './datatable.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [MatButtonModule, RouterLink, MatIconModule],
})
export class DatatableComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
