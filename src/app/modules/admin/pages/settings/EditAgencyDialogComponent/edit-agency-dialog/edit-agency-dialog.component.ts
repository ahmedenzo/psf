import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AgencyService } from 'app/core/services/agency-service.service';
import { Region, BizerteCities, TunisCities, NabeulCities, TozeurCities, ZaghouanCities, TataouineCities, SousseCities, SilianaCities, SidiBouzidCities, SfaxCities, MonastirCities, MedenineCities, ManoubaCities, MahdiaCities, KefCities, KebiliCities, KasserineCities, KairouanCities, JendoubaCities, GafsaCities, GabesCities, BenArousCities, BejaCities, ArianaCities } from 'app/core/Model/Agency.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 
@Component({
  selector: 'app-edit-agency-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
      MatIconModule,
  ],
  templateUrl: './edit-agency-dialog.component.html',
  styleUrls: ['./edit-agency-dialog.component.scss'],
})
export class EditAgencyDialogComponent implements OnInit {
  editAgencyForm: FormGroup;
  regions = Object.values(Region);
  availableCities: string[] = [];
  agencyId: number;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditAgencyDialogComponent>,
    private agencyService: AgencyService,
    @Inject(MAT_DIALOG_DATA) public data: any  // Receiving the passed agency data
  ) {}

  ngOnInit(): void {
    console.log('Agency ID in Dialog:', this.data.agencyId);  
    this.editAgencyForm = this.fb.group({
      name: [this.data.agencyName, Validators.required],  // Populate form with existing data
      agencyCode: [this.data.agencyCode, Validators.required],
      contactEmail: [this.data.agencyEmail, [Validators.required, Validators.email]],
      contactPhoneNumber: [this.data.agencyPhoneNumber, Validators.required],
     
      region: [this.data.region, Validators.required],
      city: [this.data.city, Validators.required]
    });

    // Listen to region changes to update available cities
    this.editAgencyForm.get('region')?.valueChanges.subscribe((region) => {
      this.updateCitiesForRegion(region);
    });

    // Preload the cities based on the existing region
    this.updateCitiesForRegion(this.data.region);
  }

  // Update the available cities based on the selected region
  updateCitiesForRegion(region: Region): void {
    switch (region) {
        case Region.Ariana:
            this.availableCities = Object.values(ArianaCities);
            break;
        case Region.Beja:
            this.availableCities = Object.values(BejaCities);
            break;
        case Region.BenArous:
            this.availableCities = Object.values(BenArousCities);
            break;
        case Region.Bizerte:
            this.availableCities = Object.values(BizerteCities);
            break;
        case Region.Gabes:
            this.availableCities = Object.values(GabesCities);
            break;
        case Region.Gafsa:
            this.availableCities = Object.values(GafsaCities);
            break;
        case Region.Jendouba:
            this.availableCities = Object.values(JendoubaCities);
            break;
        case Region.Kairouan:
            this.availableCities = Object.values(KairouanCities);
            break;
        case Region.Kasserine:
            this.availableCities = Object.values(KasserineCities);
            break;
        case Region.Kebili:
            this.availableCities = Object.values(KebiliCities);
            break;
        case Region.Kef:
            this.availableCities = Object.values(KefCities);
            break;
        case Region.Mahdia:
            this.availableCities = Object.values(MahdiaCities);
            break;
        case Region.Manouba:
            this.availableCities = Object.values(ManoubaCities);
            break;
        case Region.Medenine:
            this.availableCities = Object.values(MedenineCities);
            break;
        case Region.Monastir:
            this.availableCities = Object.values(MonastirCities);
            break;
        case Region.Nabeul:
            this.availableCities = Object.values(NabeulCities);
            break;
        case Region.Sfax:
            this.availableCities = Object.values(SfaxCities);
            break;
        case Region.SidiBouzid:
            this.availableCities = Object.values(SidiBouzidCities);
            break;
        case Region.Siliana:
            this.availableCities = Object.values(SilianaCities);
            break;
        case Region.Sousse:
            this.availableCities = Object.values(SousseCities);
            break;
        case Region.Tataouine:
            this.availableCities = Object.values(TataouineCities);
            break;
        case Region.Tozeur:
            this.availableCities = Object.values(TozeurCities);
            break;
        case Region.Tunis:
            this.availableCities = Object.values(TunisCities);
            break;
        case Region.Zaghouan:
            this.availableCities = Object.values(ZaghouanCities);
            break;
        default:
            this.availableCities = [];
            break;
    }
  }

  // Save the updated agency
  save(): void {
    if (this.editAgencyForm.valid) {
      const updatedAgency = this.editAgencyForm.value;
  
      console.log('Saving Agency with ID:', this.data.agencyId, 'and Data:', updatedAgency);  // Use agencyId
  
      this.agencyService.updateAgency(this.data.agencyId, updatedAgency).subscribe({
        next: () => {
          // Pass the updated data including the agencyId back to the parent component
          this.dialogRef.close({ ...updatedAgency, agencyId: this.data.agencyId });
        },
        error: (error) => {
          console.error('Failed to update agency:', error);
        }
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();  
  }
}
