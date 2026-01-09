import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import {  ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { MatPaginatorModule,MatPaginator} from '@angular/material/paginator';
import { ApiRequestLog } from 'app/core/Model/ApiRequestLog.model';
import { TrackingService } from 'app/core/services/tracking.service';
import { CommonModule } from '@angular/common';
import { UserService } from 'app/core/user/user.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select'; 
import { DecimalPipe } from '@angular/common';
import { AgencyService } from 'app/core/services/agency-service.service';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';



export interface PeriodicElement {

    requestBody?: string;   
    responseBody?: string;  
}

export interface HistoryItem {
    type: string;
    operationType: string;
    sentAt: string;
    processedBy: string;
    customPhoneNumber: string;
    maskedPan: string;
    bankName: string;
    branchName: string;
}

interface BudgetDetail {
    bank: string;
    totalPinSend: number;
    totalOtpSend: number;
    averageOtpSend: number;
    averagePinSend: number;
  }
  
  interface BudgetDetailAdmin {
    agency: string;
    totalPinSend: number;
    totalOtpSend: number;
    averageOtpSend: number;
    averagePinSend: number;
  }

@Component({
    selector       : 'project',
    templateUrl    : './project.component.html',
    styleUrl: './project.css.component.scss',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('detailExpand', [
          state('collapsed,void', style({height: '0px', minHeight: '0'})),
          state('expanded', style({height: '*'})),
          transition('expanded <=> collapsed', animate('100ms cubic-bezier(0.6, 0.0, 0.8, 1)')),
        ]),
      ],
    standalone     : true,
    imports        : [     MatDatepickerModule,    MatPaginatorModule, MatSelectModule,   
        MatSortModule,
        MatFormFieldModule,
          MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,  FormsModule,
  ReactiveFormsModule,MatTooltipModule,
       
       TranslocoModule,DatePipe,CommonModule, MatIconModule, MatButtonModule, MatRippleModule, MatMenuModule, MatTabsModule, MatButtonToggleModule, NgApexchartsModule, NgFor, NgIf, MatTableModule, NgClass, CurrencyPipe,MatPaginatorModule],
         providers: [CurrencyPipe, DatePipe, DecimalPipe], 
})
export class ProjectComponent implements OnInit, OnDestroy
{
    paginatorAdminInitialized = false;
    paginatorAdmineInitialized = false;
    pageSizee = 5;  // Default page size
    pageIndex = 0;  // Default page index
    pageSizeee = 10;  // Default page size
    filteredbank = [];
    filteredagent = [];
    sortOrder: 'pins' | 'otps' | null = null;
    isDescending: boolean = true;
    pageSize = 10; // Default page size
    totalLogs = 0; // Total number of logs
    @ViewChild('paginator') paginator!: MatPaginator;
    @ViewChild('paginatoradmin') paginatoradmin!: MatPaginator;
    @ViewChild('paginatoradmine') paginatoradmine!: MatPaginator;
    @ViewChild('paginatoripad') paginatoripad!: MatPaginator;

  todayPinCount: number = 0;
  todayOtpCount: number = 0;
  private datePipe = inject(DatePipe);
  types = ['All', 'PIN', 'OTP'];
  operationType = ['All', 'INITIAL_PIN', 'PIN_REMINDER'];
  agents: string[] = [];
  banks: string[] = [];
  branches: string[] = [];
  Agency: any[] = [];  
  private dates: string[] = []; // Store dates for XML export
  private pinData: number[] = []; // Store Pin data for XML export
  private otpData: number[] = []; // Store OTP data for XML export

    private _trackingService = inject(TrackingService); 
    private _agency = inject(AgencyService); 
    dataSourceBudgetDetails = new MatTableDataSource<BudgetDetail>();
    dataSourceBudgetDetailsAdmin = new MatTableDataSource<BudgetDetailAdmin>(); 



    
    private decimalPipe = inject(DecimalPipe);
    chartGithubIssues: ApexOptions = {};
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    chartWeeklyExpenses: ApexOptions = {};
    chartMonthlyExpenses: ApexOptions = {};
    chartYearlyExpenses: ApexOptions = {};
    data: any;;
    displayedColumns: string[] = ['bank', 'totalPinSend', 'totalOtpSend', 'averagePinSend','averageOtpSend' ];
    dateControl = new FormControl(); 
    displayedColumnss: string[] = ['agency', 'totalPinSend', 'totalOtpSend', 'averagePinSend','averageOtpSend'];
    displayedColumnssz: string[] = [];


    chartAgencyIssues: ApexOptions = {};
    dateValueAgency: Date | null = null;
    dateControlAgency = new FormControl();
    pinsByDate: [string, number][] = [];
    otpsByDate: [string, number][] = [];
    overallPinsAgent: number = 0;
    overallOtpsAgent: number = 0;
    todayPinsAgent: number = 0;
    todayOtpsAgent: number = 0;
    
    pinsByDateAgent: [string, number][] = [];
    otpsByDateAgent: [string, number][] = [];
    showErrorLogs: boolean = false;
    chartAgentIssues: ApexOptions = {};
    dateValueAgent: Date | null = null;
    dateControlAgent = new FormControl();
    // Data for the table (Banks, Total Pin Send, Total OTP Send, Remaining %)
    budgetDetails: Array<{
        bank: string;
        totalPinSend: number;
        totalOtpSend: number;
        averageOtpSend: number;
        averagePinSend: number;
    }> = [];
    
    budgetDetailsadmin: Array<{
        agency: string;
        totalPinSend: number;
        totalOtpSend: number;
        averageOtpSend: number;
        averagePinSend: number;
    }> = [];
    // Color map to store unique colors for each bank
    colorMap: { [key: string]: string } = {};

    // Generate a random color for a bank

/**
 * Exporte les données du tableau vers un fichier CSV
 */

    activeSessionCount:any
    averageResponseTime:any
    showDatePicker: boolean = false;  // Controls the visibility of the date picker
    selectedDate: Date | null = null; // Holds the selected date
    errorCount: number 
    activeSessions: any = [];
    logs: ApiRequestLog[] = [];
    columnsToDisplay: string[] = [
        'timestamp',
        'username',
        'sessionId',
        'requestPath',
        'method',
        'statusCode',
   
    ];
    isSuperAdmin: boolean = false;
    isAdmin: boolean = false;
    isUser: boolean = false;
    dataSource: MatTableDataSource<ApiRequestLog>;
    columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
    paginatorInitialized: boolean = false;
    filterUsername: string = '';
    filterDate: Date | null = null;
    expandedElement: PeriodicElement | null;
    selectedProject: string = 'ACME Corp. Backend App';
    private _unsubscribeAll: Subject<any> = new Subject<any>();


   dataSourcex = new MatTableDataSource<HistoryItem>([]);
   totalItems = 0;
   pageSizexx = 10;
   pageIndexxx = 0;

  filters: {
    type: string;
    operationType:string;
    processedBy: string;
    customPhoneNumber: string;
    maskedPan: string;
    bankName: string;
    branchName: string;
    fromDate: string | Date;
    toDate: string | Date;
  } = {
    type: '',
    operationType: '',
    processedBy: '',
    customPhoneNumber: '',
    maskedPan: '',
    bankName: '',
    branchName: '',
    fromDate: '',
    toDate: ''
  };
    // Dropdown options for filters
   

    overallPins: number = 0;
    overallOtps: number = 0;
    todayPins: number = 0; // To hold today's PIN count
    todayOtps: number = 0; // To hold today's OTP count

    overallPinsad: number = 0;
    overallOtpsad: number = 0;
    todayPinsad: number = 0; // To hold today's PIN count
    todayOtpsad: number = 0; // To hold today's OTP count

    dateValue: Date | null = null;
    bankId: number | null = null;
    agentId: string | null = null;
    /**
     * Constructor
     */
    constructor(
        private _projectService: ProjectService,
        private _router: Router,
        private cdr: ChangeDetectorRef ,
        private _userService: UserService,
        private _formBuilder: UntypedFormBuilder,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to the user service to get user roles and bank ID if admin
        this._userService.user$.subscribe(user => {
            if (user && user.roles) {
                // Determine roles
                this.isSuperAdmin = user.roles.includes('ROLE_SUPER_ADMIN');
                this.isAdmin = user.roles.includes('ROLE_ADMIN');
                this.isUser = user.roles.includes('ROLE_USER');
                  this.displayedColumnssz = [
                  'type',
                  'operationType',
                  'sentAt',
                  'processedBy',
                  'customPhoneNumber',
                  'maskedPan',
                  ...(this.isSuperAdmin ? ['bankName'] : []), // Ajoute banque si super admin
                  'branchName'
              ];
                // If the user is an Admin, fetch the bank ID
                if (this.isAdmin ) {
                    this.bankId = user.bankId;
                    console.log('Fetched Bank ID:', this.bankId);
               this.paginateadmin()
                                   this.loadData();
                    this.calculateTodayCounts();
                    this.loadFilterOptions();
                    // Call method to fetch bank statistics using the bankId
                    this.loadBankStatistics(this.bankId);
                }

                if (this.isUser) {
                    this.agentId = user.id;
                    console.log('Fetched Agent ID:', this.agentId);
    
                    // Call method to fetch agent statistics using the agentId
                    this.loadAgentStatistics(this.agentId);
                }
    
                // Additional logic for Super Admin
                if (this.isSuperAdmin) {
                    this.LoadErrorCount();
                    this.loadData();
                    this.calculateTodayCounts();
                    this.loadFilterOptions();
                    this.loadActiveSessions();
                    this.loadAverageResponseTime();
                    this.loadOverallStatistics(); 
                    this.getLogs(0, this.pageSize);
                    this.loadSevenDayStatistics();
                    this.paginatesuperadmin();
                  
                    
                }
                 
            
            }
            
        });

        // Get the data
        this._projectService.data$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((data) => {
            // Store the data
            this.data = data;
    
            // Extract last 7 days, pin data, and otp data from `data`
            const last7Days = this.getLast7Days();
            const pinData = last7Days.map((day) =>
                data.pinsGroupedByBankAndDate
                    .filter((item) => item[0] === day)
                    .reduce((sum, item) => sum + item[3], 0)
            );
    
            const otpData = last7Days.map((day) =>
                data.otpsGroupedByBankAndDate
                    .filter((item) => item[0] === day)
                    .reduce((sum, item) => sum + item[3], 0)
            );
    
            // Call _prepareChartData with the 3 required arguments
            this._prepareChartData(last7Days, pinData, otpData);
        });
    
      
        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void =>
                    {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void =>
                    {
                        this._fixSvgFill(chart.el);
                    },
                },
            },
        };
      
 
     
    }
    loadagency(): void {
      this._agency.listAllAgencies().subscribe({
          next: (response) => {
          this.Agency=response
          console.log("les agance sont ",this.Agency)
          },
          error: (error) => {
              console.error('Error fetching banks:', error);
          }
      });
  }
calculateTodayCounts(): void {
  const today = this.formatDateOnly(new Date());

  // Fetch all records, ignoring pagination
  this._projectService.getSentItems(0, 10000, {}).subscribe({
    next: (res) => {
      const allData = res.content as HistoryItem[];

      this.todayPinCount = allData.filter(
        (item) => item.type === 'PIN' && this.formatDateOnly(item.sentAt) === today
      ).length;

      this.todayOtpCount = allData.filter(
        (item) => item.type === 'OTP' && this.formatDateOnly(item.sentAt) === today
      ).length;

      console.log('Today counts -> PIN:', this.todayPinCount, 'OTP:', this.todayOtpCount);
    },
    error: (err) => console.error('Error fetching data for today counts:', err),
  });
}

  loadFilterOptions(): void {
    this._projectService.getSentItems(0, 1000).subscribe(res => {
      const data = res.content as HistoryItem[];
      this.agents = [...new Set(data.map(item => item.processedBy))];
      this.banks = [...new Set(data.map(item => item.bankName))];
      this.branches = [...new Set(data.map(item => item.branchName))];
    }, error => {
      console.error('Erreur lors du chargement des filtres:', error);
    });
  }
clearFilters(): void {
  this.filters = {
    type: '',
    operationType:'',
    processedBy: '',
    bankName: '',
    branchName: '',
    customPhoneNumber: '',
    maskedPan: '',
    fromDate: null,
    toDate: null,
  };

  this.pageIndexxx = 0;
  this.loadData();
}

LoadErrorCount(): void {
        this._trackingService.getErrorCount().subscribe(
            (response: string) => {
                console.log('Raw response:', response); // Log the raw response
    
                // Use a regular expression to extract the number from the string
                const match = response.match(/(\d+)/); // This will match any sequence of digits
    
                if (match) {
                    this.errorCount = Number(match[0]); // Convert the matched string to a number
                } else {
                    console.error('No number found in response:', response);
                    this.errorCount = 0; // Handle the case where no number is found
                }
    
                console.log('Error count:', this.errorCount); // Log the final error count
            },
            (error) => {
                console.error('Error fetching error count:', error);
            }
        );
    }
    
    
    loadAverageResponseTime(): void {
        this._trackingService.getAverageResponseTime().subscribe(
            (response: string) => {
                console.log('Raw response:', response); // Log the raw response
    
                // Use a regular expression to extract the numeric part from the string
                const match = response.match(/(\d+(\.\d+)?)/); // Match digits, including decimal
    
                if (match) {
                    // Convert the matched string to a number and round to three decimal places
                    this.averageResponseTime = Number(match[0]).toFixed(3); // Keeps three decimal places
                } else {
                    console.error('No valid number found in response:', response);
                    this.averageResponseTime = '0.000'; // Handle the case where no number is found
                }
    
                console.log('Average Response Time:', this.averageResponseTime); // Log the final average response time
            },
            (error) => {
                console.error('Error fetching average response time:', error);
            }
        );
    }

      loadActiveSessions(): void {
        this._trackingService.getActiveSessions().subscribe(
          (response: any[]) => {  // Assuming the response is an array of active sessions
            this.activeSessions = response;
            this.activeSessionCount = this.activeSessions.length;  // Count the number of active sessions
            console.log('Active sessions:', this.activeSessions);
            console.log('Number of active sessions:', this.activeSessionCount);
          },
          (error) => {
            console.error('Error fetching active sessions:', error);
          }
        );
      }
      ngAfterViewInit(): void {
  // ✅ Tableau des banques
  if (this.paginatoripad) {
    this.dataSourceBudgetDetails.paginator = this.paginatoripad;
    this.paginatoripad.page.subscribe(() => {
      this.pageIndex = this.paginatoripad.pageIndex;
      this.pageSizee = this.paginatoripad.pageSize;
      // Si tu veux paginer côté serveur, tu peux appeler ici un service
      // Exemple: this.loadBudgetDetails(this.pageIndex, this.pageSizee);
    });
  }

  // ✅ Tableau super admin
  if (this.paginator) {
    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.paginatesuperadmin();
    });
  }

  // ✅ Tableau admin
  if (this.paginatoradmin) {
    this.paginatoradmin.page.subscribe(() => {
      this.pageIndex = this.paginatoradmin.pageIndex;
      this.pageSizee = this.paginatoradmin.pageSize;
      this.paginateadmin();
    });
  }

  // ✅ Tableau agent
  if (this.paginatoradmine) {
    this.paginatoradmine.page.subscribe(() => {
      this.pageIndex = this.paginatoradmine.pageIndex;
      this.pageSizeee = this.paginatoradmine.pageSize;
      this.paginateadmin();
    });
  }
}


      ngAfterViewChecked() {
        // Initialize the first paginator only once
        if (this.paginator && !this.paginatorInitialized) {
          this.paginator.page.subscribe(() => {
            this.getLogs(this.paginator.pageIndex, this.paginator.pageSize);
      
          });
          this.paginatorInitialized = true;
        }
    
        // Initialize the second paginator (paginatoradmin) only once
        if (this.paginatoradmin && !this.paginatorAdminInitialized) {
          this.paginatoradmin.page.subscribe(() => {
            this.paginatorAdminInitialized = true;
          });
       
        }

        if (this.paginatoradmine && !this.paginatorAdminInitialized) {
            this.paginatoradmine.page.subscribe(() => {
                this.paginatorAdmineInitialized = true;
            });
            
          }
      }


    getLogs(page: number, size: number): void {
        this._trackingService.getAllLogs(page, size).subscribe(
            (response: any) => {
                // Directly use the logs from the backend without sorting on the frontend.
                this.logs = response.content; // Backend should already return sorted data (most recent first)
    
                this.totalLogs = response.totalElements; // Set the total number of logs
                this.dataSource = new MatTableDataSource<ApiRequestLog>(this.logs);
                this.dataSource.paginator = this.paginator; // Assign paginator
    
                this.cdr.markForCheck(); // Manually trigger change detection
            },
            (error) => {
                console.error('Error fetching logs:', error);
            }
        );
    }


filterErrorLogs(): void {
  // Charge plus de logs que la page actuelle
  this._trackingService.getAllLogs(0, 5000).subscribe(
    (response: any) => {
      const allLogs = response.content;

      const errorCodes = [400, 401, 403, 404, 408, 409, 422, 429, 500, 502, 503, 504];
      const filteredLogs = allLogs.filter(log =>
        errorCodes.includes(Number(log.statusCode))
      );

      this.dataSource = new MatTableDataSource<ApiRequestLog>(filteredLogs);
      this.dataSource.paginator = this.paginator;
      this.totalLogs = filteredLogs.length;
      this.showErrorLogs = true;

      console.log(`✅ Loaded ${filteredLogs.length} error logs`);
    },
    (error) => {
      console.error('Error fetching logs for filtering:', error);
    }
  );
}




clearErrorFilter(): void {
  // Recharge la liste complète des logs
  this.getLogs(this.pageIndex, this.pageSize);

  // Réinitialise le flag
  this.showErrorLogs = false;

  console.log('✅ Showing all logs again');
}

    exportToCsv(): void {
  // Définir les en-têtes du CSV en fonction des colonnes affichées
  const headers = this.displayedColumnssz.map(col => {
    switch (col) {
      case 'type': return 'Type';
      case 'operationType': return 'operationType';
      case 'sentAt': return 'Sent Date';
      case 'processedBy': return 'Agent Name';
      case 'customPhoneNumber': return 'Phone Number';
      case 'maskedPan': return 'Card Number';
      case 'bankName': return 'Bank';
      case 'branchName': return 'Branch';
      default: return col;
    }
  });
// Format date to YYYY-MM-DD for comparison

  // Formatter les lignes de données
  const rows = this.dataSourcex.data.map(item => {
    return this.displayedColumnssz.map(col => {
      let value = item[col] || 'N/A'; // Valeur par défaut si non définie
      if (col === 'sentAt' && value !== 'N/A') {
        value = this.formatDate(value); // Formater la date si nécessaire
      }
      // Échapper les guillemets et entourer les valeurs contenant des caractères spéciaux
      if (typeof value === 'string' && (value.includes(';') || value.includes('"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
  });


  // Créer le contenu CSV avec séparateur ";"
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  // Créer un Blob pour le fichier CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);

  // Créer un lien pour déclencher le téléchargement
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pin-otp-delivery-history.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}


loadData(): void {
  const {
    fromDate,
    toDate,
    type,
    operationType,
    processedBy,
    customPhoneNumber,
    maskedPan,
    bankName,
    branchName
  } = this.filters;

  // Build finalFilters (existing logic)
  const finalFilters: any = {
    ...(type && type !== 'All' ? { type } : {}),
    ...(operationType && operationType !== 'All' ? { operationType } : {}),
    ...(processedBy ? { processedBy } : {}),
    ...(customPhoneNumber ? { customPhoneNumber } : {}),
    ...(maskedPan ? { maskedPan } : {}),
    ...(bankName ? { bankName } : {}),
    ...(branchName ? { branchName } : {})
  };

  if (fromDate) {
    finalFilters.fromDate = this.formatDateOnly(fromDate);
  }

  if (toDate) {
    finalFilters.toDate = this.formatDateOnly(toDate);
  }

  const params = {
    page: this.pageIndexxx,
    size: this.pageSizexx,
    ...finalFilters
  };

  console.log('Appel getSentItems avec filtres :', finalFilters);

  // Fetch data (existing API call)
  this._projectService.getSentItems(params.page, params.size, finalFilters).subscribe({
    next: (response) => {
      this.dataSourcex.data = response.content;
      this.totalItems = response.totalElements;

   
    },
    error: (err) => {
      console.error('Erreur chargement historique', err);
    }
  });
}


  /**
   * Formate une date JavaScript en "YYYY-MM-DD"
   */
 /**
 * Formate une date JavaScript en "YYYY-MM-DD HH:mm" en ajoutant 2h en LOCAL
 */
formatDate(date: string | Date): string {
    const baseDate = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
    
    // Crée une nouvelle date avec ajout de 2h en local
    const d = new Date(baseDate.getTime());
    d.setHours(d.getHours() + 1); // Ajoute 2 heures locales

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
/**
 * Retourne une date en format "YYYY-MM-DD" (pour le backend)
 */
formatDateOnly(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


  /**
   * Pagination : appelé à chaque changement de page
   */
  onPageChange(event: any): void {
    this.pageIndexxx = event.pageIndex;
    this.pageSizexx = event.pageSize;
    this.loadData();
  }

  /**
   * Appelé à chaque changement de filtre (sélection d’un mat-select,
   * d’un input ou d’un datepicker) :
   * – on remet la page à 0 pour repartir de la première page
   * – on relance loadData() pour récupérer les données filtrées
   */
  onFilterChange(): void {
    this.pageIndexxx = 0;
    this.loadData();
  }
  applyFilterAgency(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceBudgetDetailsAdmin.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceBudgetDetailsAdmin.paginator) {
        this.dataSourceBudgetDetailsAdmin.paginator.firstPage();
    }
}

/**
 * Load bank statistics for the Admin role based on bankId
 */
loadBankStatistics(bankId: number): void {
  this._projectService.getStatisticsForBank(bankId).subscribe(
    response => {
      console.log('Bank statistics response:', response);
this.dataSourceBudgetDetailsAdmin.paginator = this.paginatoradmine;
      // Set overall totals for this specific bank
      this.overallPinsad = response.totalPins || 0; // Default to 0 if null
      this.overallOtpsad = response.totalOtps || 0; // Default to 0 if null

      // Get yesterday's date in the format 'YYYY-MM-DD'
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split('T')[0];

      // Calculate yesterday's total PIN and OTP sends
      this.todayPinsad = response.pinsByDate
        .filter(item => item[0] === yesterdayDate)  // Filter by yesterday's date
        .reduce((sum, item) => sum + item[1], 0);   // Sum up the PIN counts for yesterday

      this.todayOtpsad = response.otpsByDate
        .filter(item => item[0] === yesterdayDate)  // Filter by yesterday's date
        .reduce((sum, item) => sum + item[1], 0);   // Sum up the OTP counts for yesterday

      console.log("Yesterday’s total Pins for Admin:", this.todayPinsad);
      console.log("Yesterday’s total OTPs for Admin:", this.todayOtpsad);

      // Process pins and OTPs grouped by branch (agency)
      const pinsByAgency = response.pinsByBranch;
      const otpsByAgency = response.otpsByBranch;

      // Store pinsByDate and otpsByDate for chart data
      this.pinsByDate = response.pinsByDate;
      this.otpsByDate = response.otpsByDate;

      // Load chart data for the last seven days
      this.loadChartDataForLastSevenDays();

      // Calculate total OTPs and PINs for all agencies for percentage calculations
      const totalOtps = otpsByAgency.reduce((sum, agency) => sum + (agency[1] || 0), 0);
      const totalPins = pinsByAgency.reduce((sum, agency) => sum + (agency[1] || 0), 0);

      // Create dynamic agency details array with colors for each unique agency
      this.budgetDetailsadmin = otpsByAgency.map((otpAgencyData) => {
        const agencyName = otpAgencyData[0]; // Agency name
        const totalOtpSend = otpAgencyData[1] || 0; // OTP count, default to 0 if null

        // Find matching PIN data for the same agency
        const pinData = pinsByAgency.find((pinAgencyData) => pinAgencyData[0] === agencyName);
        const totalPinSend = pinData ? pinData[1] || 0 : 0; // PIN count, default to 0 if not found

        // Calculate average OTP and PIN percentages
        const averageOtpSend = totalOtps ? ((totalOtpSend / totalOtps) * 100).toFixed(2) : 0;
        const averagePinSend = totalPins ? ((totalPinSend / totalPins) * 100).toFixed(2) : 0;

        // Assign a color to each unique agency, if not already set
        if (!this.colorMap[agencyName]) {
          this.colorMap[agencyName] = this.generateRandomColor();
        }

        return {
          agency: agencyName,
          totalPinSend: totalPinSend,
          totalOtpSend: totalOtpSend,
          averageOtpSend: +averageOtpSend, // Convert to number
          averagePinSend: +averagePinSend  // Convert to number
        };
      });

      // Sort the agencies by totalOtpSend in descending order (since PINs might be 0)
      this.budgetDetailsadmin.sort((a, b) => b.totalOtpSend - a.totalOtpSend);

      // Store the sorted array for pagination
      this.filteredagent = [...this.budgetDetailsadmin];

      // Update the data source for the table
      this.dataSourceBudgetDetailsAdmin.data = this.budgetDetailsadmin;

      // Paginate the sorted results
      this.paginateadmin();

      console.log("Sorted Agency Budget Details for Admin (Most OTPs First):", this.budgetDetailsadmin);
      console.log("Color Map:", this.colorMap);

      // Trigger change detection manually if using OnPush strategy
      this.cdr.detectChanges();
    },
    error => console.error("Error fetching bank statistics:", error)
  );
}



  onDateChangeAgency(event: any): void {
    this.dateValueAgency = new Date(Date.UTC(
      event.value.getFullYear(),
      event.value.getMonth(),
      event.value.getDate()
    ));
    const formattedDate = this.dateValueAgency.toISOString().split('T')[0];
    this.loadChartDataForDateAgency(formattedDate);
  }

  // Method to clear the date selection for Admin
  clearDateAgency(): void {
    this.dateValueAgency = null;
    this.dateControlAgency.reset();
    // Reload data for the last 7 days
    this.loadChartDataForLastSevenDays();
  }

  // Load chart data for a specific date for Admin
  loadChartDataForDateAgency(date: string): void {
    const pinItem = this.pinsByDate.find((item) => item[0] === date);
    const otpItem = this.otpsByDate.find((item) => item[0] === date);
    const pinData = [pinItem ? pinItem[1] : 0];
    const otpData = [otpItem ? otpItem[1] : 0];
    this._prepareAgencyChartData([date], pinData, otpData);
  }

  // Load chart data for the last seven days for Admin
  loadChartDataForLastSevenDays(): void {
    const last7Days = this.getLast7Days();
    const pinData = last7Days.map((day) => {
      const pinItem = this.pinsByDate.find((item) => item[0] === day);
      return pinItem ? pinItem[1] : 0;
    });
    const otpData = last7Days.map((day) => {
      const otpItem = this.otpsByDate.find((item) => item[0] === day);
      return otpItem ? otpItem[1] : 0;
    });
    this._prepareAgencyChartData(last7Days, pinData, otpData);
  }
  private _prepareAgencyChartData(dates: string[], pinData: number[], otpData: number[]): void {
    this.dates = dates;
    this.pinData = pinData;
    this.otpData = otpData;

    this.chartAgencyIssues = {
      chart: {
        type: 'line',
        height: '100%',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 300
        },
        toolbar: {
          show: false
        },
        fontFamily: 'Inter, sans-serif'
      },
      colors: ['#cae4ceff', '#878b8431'],
      dataLabels: {
        enabled: true,
        background: {
          enabled: true,
          foreColor: '#f8fcfdff',
          padding: 4,
          borderRadius: 8,
          borderWidth: 0,
          opacity: 1
        },
        style: {
          fontSize: '10px',
          fontWeight: 700,
          colors: ['#228022ff', '#dd0808ff']
        }
      },
      stroke: {
        curve: 'smooth',
        width: [5, 0],
        lineCap: 'round'
      },
      series: [
        {
          name: 'Pin',
          type: 'line',
          data: pinData
        },
        {
          name: 'OTP',
          type: 'bar',
          data: otpData
        }
      ],
      xaxis: {
        categories: dates,
        labels: {
          style: {
            colors: '#4B5563',
            fontSize: '11px',
            fontWeight: 600
          },
          rotate: -45,
          rotateAlways: true
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#4B5563',
            fontSize: '11px',
            fontWeight: 600
          },
          formatter: (val: number) => val.toLocaleString()
        }
      },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '10px',
          fontFamily: 'Inter, sans-serif'
        },
        x: {
          show: true,
          formatter: (value) => `Date: ${value}`
        },
        y: {
          formatter: (val: number) => val.toLocaleString()
        },
        marker: {
          show: true
        }
      },
      grid: {
        borderColor: '#D1D5DB',
        strokeDashArray: 3,
        padding: {
          top: 0,
          right: 10,
          bottom: 0,
          left: 10
        }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '11px',
        fontWeight: 700,
        labels: {
          colors: '#111827'
        },
        markers: {
          width: 8,
          height: 8,
          radius: 8
        }
      }
    };
}
  // Helper method to get the last 7 days in 'YYYY-MM-DD' format

loadOverallStatistics(): void {
    this._projectService.getOverallStatistics().subscribe(response => {
        console.log('pinsGroupedByBank:', response.pinsGroupedByBank);
        console.log('otpsGroupedByBank:', response.otpsGroupedByBank);
        console.log('Overall statistics response:', response);

        // Set overall total values
        this.overallPins = response.overallPins || 0; // Default to 0 if null
        this.overallOtps = response.overallOtps || 0; // Default to 0 if null

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];

        this.todayPins = response.pinsGroupedByBankAndDate
            .filter(item => item[0] === yesterdayDate)
            .reduce((sum, item) => sum + item[3], 0);

        this.todayOtps = response.otpsGroupedByBankAndDate
            .filter(item => item[0] === yesterdayDate)
            .reduce((sum, item) => sum + item[3], 0);

        console.log('Yesterday’s total Pins:', this.todayPins);
        console.log('Yesterday’s total OTPs:', this.todayOtps);

        const pinsByBank = response.pinsGroupedByBank;
        const otpsByBank = response.otpsGroupedByBank;

        // Calculate total OTPs and PINs for all banks
        const totalOtps = otpsByBank.reduce((sum, bank) => sum + (bank[2] || 0), 0);
        const totalPins = pinsByBank.reduce((sum, bank) => sum + (bank[2] || 0), 0);

        // Use otpsGroupedByBank as the primary source to ensure all banks with OTPs are included
        this.budgetDetails = otpsByBank.map((otpBankData) => {
            const bankName = otpBankData[0]; // Bank name (e.g., "UIB")
            const bankId = otpBankData[1];  // Bank ID
            const totalOtpSend = otpBankData[2] || 0; // OTP count

            // Find matching PIN data for the same bank
            const pinData = pinsByBank.find((pinBankData) => pinBankData[1] === bankId);
            const totalPinSend = pinData ? pinData[2] || 0 : 0; // PIN count, default to 0 if not found

            // Calculate average percentages
            const averageOtpSend = totalOtps ? ((totalOtpSend / totalOtps) * 100).toFixed(2) : 0;
            const averagePinSend = totalPins ? ((totalPinSend / totalPins) * 100).toFixed(2) : 0;

            // Assign a color to each unique bank
            if (!this.colorMap[bankName]) {
                this.colorMap[bankName] = this.generateRandomColor();
            }

            return {
                bank: bankName,
                totalPinSend: totalPinSend,
                totalOtpSend: totalOtpSend,
                averageOtpSend: +averageOtpSend,
                averagePinSend: +averagePinSend
            };
        });

        // Sort by totalPinSend (or totalOtpSend if preferred)
       this.budgetDetails.sort((a, b) => b.totalPinSend - a.totalPinSend);

        this.filteredbank = [...this.budgetDetails];
        this.dataSourceBudgetDetails.data = this.budgetDetails; // Update the data source
        this.paginatesuperadmin();

        console.log('Dynamic Budget Details:', this.budgetDetails);
        console.log('Color Map:', this.colorMap);

        this.cdr.markForCheck();
    });
}

downloadBankDetailsCSV(): void {
  const headers = ['Bank Name', 'Total PINs Sent', 'Total OTPs Sent', 'Avg PIN Sent (%)', 'Avg OTP Sent (%)'];

  const rows = this.budgetDetails.map(budget => {
    return [
      `"${budget.bank}"`,
      budget.totalPinSend,
      budget.totalOtpSend,
      budget.averagePinSend.toFixed(2),
      budget.averageOtpSend.toFixed(2)
    ];
  });

  // Use semicolon as CSV separator
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bank-details-analytics.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

    
    dateForm = new FormGroup({
        dateValue: new FormControl(null),
      });
      clearDate(): void {
        this.dateValue = null;
        this.dateControl.reset(); // Reset the date picker control
        this.loadSevenDayStatistics(); // Reload data for the last 7 days or default range
    }
      // Method to handle date change from the date picker
      onDateChange(event: any): void {
        // Ensure the selected date is in UTC
        this.dateValue = new Date(Date.UTC(
            event.value.getFullYear(),
            event.value.getMonth(),
            event.value.getDate()
        ));
        
        // Trigger the data update based on selected date
        const formattedDate = this.dateValue.toISOString().split('T')[0];
        this.loadChartDataForDate(formattedDate);
    }
    
    
    loadChartDataForDate(date: string): void {
        this._projectService.getOverallStatistics().subscribe((response) => {
            // Filter and sum data for the selected date
            const pinData = response.pinsGroupedByBankAndDate
                .filter((item) => item[0] === date)
                .reduce((sum, item) => sum + item[3], 0);
            
            const otpData = response.otpsGroupedByBankAndDate
                .filter((item) => item[0] === date)
                .reduce((sum, item) => sum + item[3], 0);
            
            // Prepare chart data
            this._prepareChartData([date], [pinData], [otpData]);
        });
    }
    
    l
    
    
    
    
    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
     *
     * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
     *
     * @param element
     * @private
     */
    private _fixSvgFill(element: Element): void
    {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter(el => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) =>
            {
                const attrVal = el.getAttribute('fill');
                el.setAttribute('fill', `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`);
            });
    }

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    loadSevenDayStatistics(): void {
        this._projectService.getOverallStatistics().pipe(takeUntil(this._unsubscribeAll)).subscribe((response) => {
          const last7Days = this.getLast7Days();
          const pinData = [];
          const otpData = [];
    
          last7Days.forEach((day) => {
            const dayDataPin = response.pinsGroupedByBankAndDate
              .filter((item) => item[0] === day)
              .reduce((sum, item) => sum + item[3], 0);
            
            const dayDataOtp = response.otpsGroupedByBankAndDate
              .filter((item) => item[0] === day)
              .reduce((sum, item) => sum + item[3], 0);
    
            pinData.push(dayDataPin);
            otpData.push(dayDataOtp);
          });
    
          this._prepareChartData(last7Days, pinData, otpData);
          this.cdr.markForCheck();
        });
      }
      getLast7Days(): string[] {
        const dates = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    }
    
    private _prepareChartData(dates: string[], pinData: number[], otpData: number[]): void {
    this.dates = dates;
    this.pinData = pinData;
    this.otpData = otpData;

    this.chartGithubIssues = {
      chart: {
        type: 'line',
        height: '100%',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 300
        },
        toolbar: {
          show: false
        },
        fontFamily: 'Inter, sans-serif'
      },
      colors: ['#cae4ceff', '#878b8431'],
      dataLabels: {
        enabled: true,
        background: {
          enabled: true,
          foreColor: '#f8fcfdff',
          padding: 4,
          borderRadius: 8,
          borderWidth: 0,
          opacity: 1
        },
        style: {
          fontSize: '10px',
          fontWeight: 700,
          colors: ['#228022ff', '#dd0808ff']
        }
      },
      stroke: {
        curve: 'smooth',
        width: [5, 0],
        lineCap: 'round'
      },
      series: [
        {
          name: 'Pin',
          type: 'line',
          data: pinData
        },
        {
          name: 'OTP',
          type: 'bar',
          data: otpData
        }
      ],
      xaxis: {
        categories: dates,
        labels: {
          style: {
            colors: '#4B5563',
            fontSize: '11px',
            fontWeight: 600
          },
          rotate: -45,
          rotateAlways: true
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#5a634bff',
            fontSize: '11px',
            fontWeight: 600
          },
          formatter: (val: number) => val.toLocaleString()
        }
      },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '10px',
          fontFamily: 'Inter, sans-serif'
        },
        x: {
          show: true,
          formatter: (value) => `Date: ${value}`
        },
        y: {
          formatter: (val: number) => val.toLocaleString()
        },
        marker: {
          show: true
        }
      },
      grid: {
        borderColor: '#D1D5DB',
        strokeDashArray: 3,
        padding: {
          top: 0,
          right: 10,
          bottom: 0,
          left: 10
        }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '11px',
        fontWeight: 700,
        labels: {
          colors: '#111827'
        },
        markers: {
          width: 8,
          height: 8,
          radius: 8
        }
      }
    };
  }

downloadChartCSV(): void {
    this._projectService.getOverallStatistics()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response) => {
            const allDatesSet = new Set<string>();
            response.pinsGroupedByBankAndDate.forEach((item: any[]) => allDatesSet.add(item[0]));
            response.otpsGroupedByBankAndDate.forEach((item: any[]) => allDatesSet.add(item[0]));

            const allDates = Array.from(allDatesSet).sort(); // tri croissant

            const headers = ['Date', 'PIN Count', 'OTP Count'];
            const rows = allDates.map((date) => {
                const pinCount = response.pinsGroupedByBankAndDate
                    .filter((item) => item[0] === date)
                    .reduce((sum, item) => sum + item[3], 0);

                const otpCount = response.otpsGroupedByBankAndDate
                    .filter((item) => item[0] === date)
                    .reduce((sum, item) => sum + item[3], 0);

                return [`"${date}"`, pinCount, otpCount];
            });

            const csvContent = [
                headers.join(';'),
                ...rows.map(row => row.join(';'))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pin-otp-kpi.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        });
}


    formatNumber(value: number): string | null {
        return this.decimalPipe.transform(value, '1.0-0'); // Format with thousands separators
    }
    
    
    // Method to handle date change from the date picker for Agent
onDateChangeAgent(event: any): void {
    this.dateValueAgent = new Date(Date.UTC(
        event.value.getFullYear(),
        event.value.getMonth(),
        event.value.getDate()
    ));
    const formattedDate = this.dateValueAgent.toISOString().split('T')[0];
    this.loadChartDataForDateAgent(formattedDate);
}

// Method to clear the date selection for Agent
clearDateAgent(): void {
    this.dateValueAgent = null;
    this.dateControlAgent.reset();
    // Reload data for the last 7 days
    this.loadChartDataForLastSevenDaysAgent();
}

// Load chart data for a specific date for Agent
loadChartDataForDateAgent(date: string): void {
    const pinItem = this.pinsByDateAgent.find((item) => item[0] === date);
    const otpItem = this.otpsByDateAgent.find((item) => item[0] === date);
    const pinData = [pinItem ? pinItem[1] : 0];
    const otpData = [otpItem ? otpItem[1] : 0];
    this._prepareAgentChartData([date], pinData, otpData);
}
// Load chart data for the last seven days for Agent
loadChartDataForLastSevenDaysAgent(): void {
    const last7Days = this.getLast7Days();
    const pinData = last7Days.map((day) => {
        const pinItem = this.pinsByDateAgent.find((item) => item[0] === day);
        return pinItem ? pinItem[1] : 0;
    });
    const otpData = last7Days.map((day) => {
        const otpItem = this.otpsByDateAgent.find((item) => item[0] === day);
        return otpItem ? otpItem[1] : 0;
    });
    this._prepareAgentChartData(last7Days, pinData, otpData);
}

// Prepare chart data for the Agent
private _prepareAgentChartData(dates: string[], pinData: number[], otpData: number[]): void {
    this.dates = dates;
    this.pinData = pinData;
    this.otpData = otpData;

    this.chartAgentIssues = {
        chart: {
            type: 'line',
            height: '100%',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 300
            },
            toolbar: {
                show: false
            },
            fontFamily: 'Inter, sans-serif'
        },
         colors: ['#cae4ceff', '#878b8431'],
      dataLabels: {
        enabled: true,
        background: {
          enabled: true,
          foreColor: '#f8fcfdff',
          padding: 4,
          borderRadius: 8,
          borderWidth: 0,
          opacity: 1
        },
        style: {
          fontSize: '10px',
          fontWeight: 700,
          colors: ['#228022ff', '#dd0808ff']
        }
        },
        stroke: {
            curve: 'smooth',
            width: [5, 0],
            lineCap: 'round'
        },
        series: [
            {
                name: 'Pin',
                type: 'line',
                data: pinData
            },
            {
                name: 'OTP',
                type: 'bar',
                data: otpData
            }
        ],
        xaxis: {
            categories: dates,
            labels: {
                style: {
                    colors: '#4B5563',
                    fontSize: '11px',
                    fontWeight: 600
                },
                rotate: -45,
                rotateAlways: true
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#4B5563',
                    fontSize: '11px',
                    fontWeight: 600
                },
                formatter: (val: number) => val.toLocaleString()
            }
        },
        tooltip: {
            theme: 'light',
            style: {
                fontSize: '10px',
                fontFamily: 'Inter, sans-serif'
            },
            x: {
                show: true,
                formatter: (value) => `Date: ${value}`
            },
            y: {
                formatter: (val: number) => val.toLocaleString()
            },
            marker: {
                show: true
            }
        },
        grid: {
            borderColor: '#D1D5DB',
            strokeDashArray: 3,
            padding: {
                top: 0,
                right: 10,
                bottom: 0,
                left: 10
            }
        },
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '11px',
            fontWeight: 700,
            labels: {
                colors: '#111827'
            },
            markers: {
                width: 8,
                height: 8,
                radius: 8
            }
        }
    };
}
private generateRandomColor(): string {
    const colors = [
        // Blues
        'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800',
        // Reds
        'bg-red-400', 'bg-red-500', 'bg-red-600', 'bg-red-700', 'bg-red-800',
        // Greens
        'bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-green-700', 'bg-green-800',
        // Ambers/Oranges
        'bg-amber-400', 'bg-amber-500', 'bg-amber-600', 'bg-amber-700', 'bg-amber-800',
        'bg-orange-400', 'bg-orange-500', 'bg-orange-600', 'bg-orange-700', 'bg-orange-800',
        // Indigos
        'bg-indigo-400', 'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-700', 'bg-indigo-800',
        // Purples
        'bg-purple-400', 'bg-purple-500', 'bg-purple-600', 'bg-purple-700', 'bg-purple-800',
        // Pinks
        'bg-pink-400', 'bg-pink-500', 'bg-pink-600', 'bg-pink-700', 'bg-pink-800',
        // Teals/Cyans
        'bg-teal-400', 'bg-teal-500', 'bg-teal-600', 'bg-teal-700', 'bg-teal-800',
        'bg-cyan-400', 'bg-cyan-500', 'bg-cyan-600', 'bg-cyan-700', 'bg-cyan-800',
        // Limes/Yellows
        'bg-lime-400', 'bg-lime-500', 'bg-lime-600', 'bg-lime-700', 'bg-lime-800',
        'bg-yellow-400', 'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700', 'bg-yellow-800',
        // Others
        'bg-rose-400', 'bg-rose-500', 'bg-rose-600', 'bg-rose-700', 'bg-rose-800',
        'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600', 'bg-emerald-700', 'bg-emerald-800',
        'bg-sky-400', 'bg-sky-500', 'bg-sky-600', 'bg-sky-700', 'bg-sky-800',
        'bg-violet-400', 'bg-violet-500', 'bg-violet-600', 'bg-violet-700', 'bg-violet-800',
        'bg-fuchsia-400', 'bg-fuchsia-500', 'bg-fuchsia-600', 'bg-fuchsia-700', 'bg-fuchsia-800',
        // Neutrals (subtils)
        'bg-slate-400', 'bg-slate-500', 'bg-slate-600', 'bg-slate-700',
        'bg-zinc-400', 'bg-zinc-500', 'bg-zinc-600', 'bg-zinc-700',
        'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}
loadAgentStatistics(agentId: string): void {
    this._projectService.getAgentStatistics(agentId).subscribe(
        response => {
            console.log('Agent statistics response:', response);

            // Set overall total values
            this.overallPinsAgent = response.totalPins;
            this.overallOtpsAgent = response.totalOtps;

           
        
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayDate = yesterday.toISOString().split('T')[0];
            // Calculate today's total PIN sends
            this.todayPinsAgent = response.pinsByDate
                .filter(item => item[0] === yesterdayDate)
                .reduce((sum, item) => sum + item[1], 0);

            // Calculate today's total OTP sends
            this.todayOtpsAgent = response.otpsByDate
                .filter(item => item[0] === yesterdayDate)
                .reduce((sum, item) => sum + item[1], 0);

            console.log('Today’s total Pins for Agent:', this.todayPinsAgent);
            console.log('Today’s total OTPs for Agent:', this.todayOtpsAgent);

            // Store pinsByDate and otpsByDate for chart data
            this.pinsByDateAgent = response.pinsByDate;
            this.otpsByDateAgent = response.otpsByDate;

            // Load chart data for the last seven days
            this.loadChartDataForLastSevenDaysAgent();

            // Trigger change detection manually if using OnPush strategy
            this.cdr.markForCheck();
        },
        error => console.error('Error fetching agent statistics:', error)
    );
}

paginatesuperadmin(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    
  }

  paginateadmin(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    
  }
downloadChartCSVagnecy(): void {
    this._projectService.getStatisticsForBank(this.bankId)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response) => {
            const allDatesSet = new Set<string>();
            response.pinsByDate.forEach((item: [string, number]) => allDatesSet.add(item[0]));
            response.otpsByDate.forEach((item: [string, number]) => allDatesSet.add(item[0]));

            const allDates = Array.from(allDatesSet).sort(); // Sort dates in ascending order

            const headers = ['Date', 'PIN Count', 'OTP Count'];
            const rows = allDates.map((date) => {
                const pinCount = response.pinsByDate
                    .filter((item) => item[0] === date)
                    .reduce((sum, item) => sum + item[1], 0);

                const otpCount = response.otpsByDate
                    .filter((item) => item[0] === date)
                    .reduce((sum, item) => sum + item[1], 0);

                return [`"${date}"`, pinCount, otpCount];
            });

            const csvContent = [
                headers.join(';'),
                ...rows.map(row => row.join(';'))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'agency-pin-otp-kpi.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, (error) => {
            console.error('Error fetching statistics for CSV export:', error);
        });
}

downloadAgencyDetailsCSV(): void {
  const headers = ['Agency Name', 'Total PINs Sent', 'Total OTPs Sent', 'Avg PIN Sent (%)', 'Avg OTP Sent (%)'];

  const rows = this.budgetDetailsadmin.map(budget => {
    return [
      `"${budget.agency}"`,
      budget.totalPinSend,
      budget.totalOtpSend,
      budget.averagePinSend.toFixed(2),
      budget.averageOtpSend.toFixed(2)
    ];
  });

  // Use semicolon as CSV separator
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'agency-details-analytics.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}



downloadUserSummaryCSV(): void {
        try {
            const headers = ['Date', 'PIN Count', 'OTP Count'];

            const allDatesSet = new Set<string>();
            this.pinsByDateAgent.forEach((item: [string, number]) => allDatesSet.add(item[0]));
            this.otpsByDateAgent.forEach((item: [string, number]) => allDatesSet.add(item[0]));

            const allDates = Array.from(allDatesSet).sort(); // Sort dates in ascending order

            const rows = allDates.map((date) => {
                const pinCount = this.pinsByDateAgent
                    .filter((item) => item[0] === date)
                    .reduce((sum, item) => sum + item[1], 0);

                const otpCount = this.otpsByDateAgent
                    .filter((item) => item[0] === date)
                    .reduce((sum, item) => sum + item[1], 0);

                return [`"${date}"`, pinCount, otpCount];
            });

            const csvContent = [
                headers.join(';'),
                ...rows.map(row => row.join(';'))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'agent-summary-analytics.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating user summary CSV:', error);
        }
    }

}
