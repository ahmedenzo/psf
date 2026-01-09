import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 
import { MatSelectModule } from '@angular/material/select';  
import { MatFormFieldModule } from '@angular/material/form-field';  
import { MatOptionModule } from '@angular/material/core';  
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';  
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { AgencyService } from 'app/core/services/agency-service.service';
import { Agency, Region, BizerteCities, TunisCities, NabeulCities, TozeurCities, ZaghouanCities, TataouineCities, SousseCities, SilianaCities, SidiBouzidCities, SfaxCities, MonastirCities, MedenineCities, ManoubaCities, MahdiaCities, KefCities, KebiliCities, KasserineCities, KairouanCities, JendoubaCities, GafsaCities, GabesCities, BenArousCities, BejaCities, ArianaCities } from 'app/core/Model/Agency.model';  
import { ChangeDetectorRef } from '@angular/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from 'app/core/auth/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-team-admin',
  standalone: true,
  imports: [
    CommonModule, 
   
    MatSlideToggleModule, 
    MatSelectModule, 
    MatFormFieldModule, 
    MatOptionModule, 
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatDialogModule
  ],
  templateUrl: './team-admin.component.html',
  styleUrls: ['./team-admin.component.scss']
})
export class TeamAdminComponent implements OnInit, AfterViewInit {
  agencies: any[] = [];
  filteredAgencies = [];
  paginatedAgencies = [];
  searchForm: FormGroup;
  agents: any[] = [];
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  private _auth = inject(AuthService);
  pageSize = 20;
  pageIndex = 0;
  private _AgencyService = inject(AgencyService);  
  regions = Object.values(Region);
  availableCities: string[] = [];
  expandedAgentUsername: string | null = null;

  constructor(private fb: FormBuilder, private agencyService: AgencyService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      globalSearch: [''],
      region: [''],
      city: ['']
    });

    this.searchForm.valueChanges.subscribe(filters => {
      this.filterAgencies(filters);
    });

    forkJoin({
      agencies: this.agencyService.listAllAgenciesAssociatedUser(),
      agents: this._AgencyService.GetAgents()
    }).subscribe({
      next: (result) => {
        const grouped = new Map<string, any>();

        result.agencies.forEach((agency) => {
          const agent = result.agents.find(agent => agent.id === agency.userId);
          const key = agency.agencyName + '-' + agency.agencyCode;

          if (!grouped.has(key)) {
            grouped.set(key, {
              ...agency,
              users: [agency.username],
              userIds: [agency.userId],
              statuses: [agent?.status ?? false]
            });
          } else {
            const existing = grouped.get(key);
            existing.users.push(agency.username);
            existing.userIds.push(agency.userId);
            existing.statuses.push(agent?.status ?? false);
          }
        });

        this.agencies = Array.from(grouped.values());
        this.filteredAgencies = [...this.agencies];
        this.paginateAgencies();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }

  fetchAgencies(): void {
    this.agencyService.listAllAgenciesAssociatedUser().subscribe({
      next: (data) => {
        this.agencies = data;
        this.filteredAgencies = [...this.agencies];
        this.paginateAgencies();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching agencies:', err);
      }
    });
  }

  getagents(): void {
    this._AgencyService.GetAgents().subscribe({
      next: (response) => {
        if (Array.isArray(response) && response.length > 0) {
          this.agents = response.map(agent => ({
            ...agent,
            status: agent.status !== undefined ? agent.status : false
          }));
          this.cdr.detectChanges();
        } else {
          console.warn("No valid agent data found.");
        }
      },
      error: (error) => {
        console.error("Error fetching agents:", error);
      }
    });
  }

  toggleActivation(agency: any): void {
    if (!agency || typeof agency.userId === 'undefined') {
      console.warn("Agency or agency userId is undefined. Cannot toggle activation.");
      return;
    }

    const originalStatus = agency.status;
    agency.status = !agency.status;
    this.cdr.detectChanges();

    this._auth.deactivateUser(agency.userId).subscribe({
      next: () => {
        console.log(`User with ID ${agency.userId} is now ${agency.status ? 'activated' : 'deactivated'}.`);
      },
      error: (err) => {
        agency.status = originalStatus;
        this.cdr.detectChanges();
        console.error(`Error toggling activation:`, err);
      }
    });
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.paginateAgencies();
    });
  }

  updateCitiesForRegion(region: Region): void {
    switch (region) {
      case Region.Ariana: this.availableCities = Object.values(ArianaCities); break;
      case Region.Beja: this.availableCities = Object.values(BejaCities); break;
      case Region.BenArous: this.availableCities = Object.values(BenArousCities); break;
      case Region.Bizerte: this.availableCities = Object.values(BizerteCities); break;
      case Region.Gabes: this.availableCities = Object.values(GabesCities); break;
      case Region.Gafsa: this.availableCities = Object.values(GafsaCities); break;
      case Region.Jendouba: this.availableCities = Object.values(JendoubaCities); break;
      case Region.Kairouan: this.availableCities = Object.values(KairouanCities); break;
      case Region.Kasserine: this.availableCities = Object.values(KasserineCities); break;
      case Region.Kebili: this.availableCities = Object.values(KebiliCities); break;
      case Region.Kef: this.availableCities = Object.values(KefCities); break;
      case Region.Mahdia: this.availableCities = Object.values(MahdiaCities); break;
      case Region.Manouba: this.availableCities = Object.values(ManoubaCities); break;
      case Region.Medenine: this.availableCities = Object.values(MedenineCities); break;
      case Region.Monastir: this.availableCities = Object.values(MonastirCities); break;
      case Region.Nabeul: this.availableCities = Object.values(NabeulCities); break;
      case Region.Sfax: this.availableCities = Object.values(SfaxCities); break;
      case Region.SidiBouzid: this.availableCities = Object.values(SidiBouzidCities); break;
      case Region.Siliana: this.availableCities = Object.values(SilianaCities); break;
      case Region.Sousse: this.availableCities = Object.values(SousseCities); break;
      case Region.Tataouine: this.availableCities = Object.values(TataouineCities); break;
      case Region.Tozeur: this.availableCities = Object.values(TozeurCities); break;
      case Region.Tunis: this.availableCities = Object.values(TunisCities); break;
      case Region.Zaghouan: this.availableCities = Object.values(ZaghouanCities); break;
      default: this.availableCities = [];
    }
    this.searchForm.patchValue({ city: '' });
  }



filterAgencies(filters: any): void {
  const { globalSearch, region, city } = filters;
  const search = globalSearch?.toLowerCase() ?? '';

  this.filteredAgencies = this.agencies.filter(agency => {
    const matchesGlobalSearch =
      (agency.agencyName?.toLowerCase().includes(search) ||
       agency.agencyCode?.toLowerCase().includes(search) ||
       agency.users?.some((u: string) => u.toLowerCase().includes(search)));

    const matchesRegion = region ? agency.region === region : true;
    const matchesCity = city ? agency.city === city : true;

    return matchesGlobalSearch && matchesRegion && matchesCity;
  });

  if (this.paginator) this.paginator.firstPage();
  this.paginateAgencies();
}


  paginateAgencies(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedAgencies = this.filteredAgencies.slice(start, end);
  }

  toggleRowExpansion(agentUsername: string): void {
    this.expandedAgentUsername = this.expandedAgentUsername === agentUsername ? null : agentUsername;
  }
}