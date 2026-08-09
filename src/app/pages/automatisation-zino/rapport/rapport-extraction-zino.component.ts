import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import {
  RapportExtractionZinoService,
  RapportExtractionResponse,
  RapportFichierDto,
  RapportFactureDto
} from '../services/rapport-extraction-zino.service';

@Component({
  selector: 'app-rapport-extraction-zino',
  templateUrl: './rapport-extraction-zino.component.html',
  styleUrls: ['./rapport-extraction-zino.component.scss']
})
export class RapportExtractionZinoComponent implements OnInit {
  filtresForm: FormGroup;
  mailForm: FormGroup;

  loading = false;
  loadingExport = false;
  loadingMail = false;
  errorMessage = '';
  mailSuccessMessage = '';
  mailErrorMessage = '';

  rapport: RapportExtractionResponse | null = null;
  fichiers: RapportFichierDto[] = [];
  factures: RapportFactureDto[] = [];

  loadingFactures = false;
  currentPage = 0;
  totalPages = 0;
  totalItems = 0;
  pageSize = environment.pageSize || 10;

  afficherFormulaireMail = false;

  listeStatuts = [
    { id: null, label: 'Tous les statuts' },
    { id: 'PENDING', label: 'En attente' },
    { id: 'SENT', label: 'Envoyé avec succès' },
    { id: 'ERROR', label: 'En erreur' },
    { id: 'ECHEC_DEFINITIF', label: 'Échec définitif' },
  ];

  constructor(
    private fb: FormBuilder,
    private rapportService: RapportExtractionZinoService,
  ) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    this.filtresForm = this.fb.group({
      dateDebut: [this.toDateInputValue(firstDay), Validators.required],
      dateFin: [this.toDateInputValue(now), Validators.required],
      statut: [null],
    });

    this.mailForm = this.fb.group({
      destinataire: ['', [Validators.required, Validators.email]],
      format: ['excel', Validators.required],
    });
  }

  ngOnInit(): void {
    this.rechercher();
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private buildRequest() {
    return {
      dateDebut: this.filtresForm.value.dateDebut,
      dateFin: this.filtresForm.value.dateFin,
      statut: this.filtresForm.value.statut,
    };
  }

  rechercher(): void {
    if (this.filtresForm.invalid) {
      this.filtresForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.mailSuccessMessage = '';
    this.mailErrorMessage = '';

    this.rapportService.getRapport(this.buildRequest()).subscribe({
      next: (response) => {
        this.rapport = response.data;
        this.fichiers = response.data?.fichiers || [];
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Erreur lors du chargement du rapport. Vérifiez votre connexion ou les paramètres.';
        console.error('Erreur API rapport extraction Zino:', error);
        this.rapport = null;
        this.fichiers = [];
      }
    });

    this.chargerFactures(0);
  }

  private chargerFactures(page: number): void {
    if (this.filtresForm.invalid) { return; }

    this.loadingFactures = true;

    this.rapportService.getFacturesPaginees(this.buildRequest(), page, this.pageSize).subscribe({
      next: (response) => {
        this.factures = response.data || [];
        this.currentPage = response.current_page || 0;
        this.totalPages = response.total_pages || 0;
        this.totalItems = response.total_items || 0;
        this.pageSize = response.page_size || this.pageSize;
        this.loadingFactures = false;
      },
      error: (error) => {
        this.loadingFactures = false;
        this.errorMessage = 'Erreur lors du chargement des factures.';
        console.error('Erreur API factures rapport extraction Zino:', error);
        this.factures = [];
        this.currentPage = 0;
        this.totalPages = 0;
        this.totalItems = 0;
      }
    });
  }

  changePage(newPage: number | string): void {
    let page = this.currentPage;
    if (newPage === 'prev') {
      page = Math.max(0, this.currentPage - 1);
    } else if (newPage === 'next') {
      page = this.currentPage + 1 >= this.totalPages ? this.currentPage : this.currentPage + 1;
    } else if (typeof newPage === 'number') {
      page = newPage;
    }
    this.chargerFactures(page);
  }

  statutClass(statut: string): string {
    switch (statut) {
      case 'SENT': return 'badge bg-success';
      case 'ERROR': return 'badge bg-danger';
      case 'ECHEC_DEFINITIF': return 'badge bg-dark';
      case 'PENDING': return 'badge bg-warning text-dark';
      default: return 'badge bg-secondary';
    }
  }

  private telechargerBlob(blob: Blob, filename: string): void {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
  }

  private suffixeFichier(): string {
    const v = this.filtresForm.value;
    return `${v.dateDebut}_${v.dateFin}`;
  }

  exportExcel(): void {
    if (this.filtresForm.invalid) { return; }
    this.loadingExport = true;
    this.rapportService.exportExcel(this.buildRequest()).subscribe({
      next: (blob) => {
        this.telechargerBlob(blob, `rapport_extraction_zino_${this.suffixeFichier()}.xlsx`);
        this.loadingExport = false;
      },
      error: (error) => {
        this.loadingExport = false;
        this.errorMessage = "Erreur lors de l'export Excel.";
        console.error('Erreur export excel rapport zino:', error);
      }
    });
  }

  exportPdf(): void {
    if (this.filtresForm.invalid) { return; }
    this.loadingExport = true;
    this.rapportService.exportPdf(this.buildRequest()).subscribe({
      next: (blob) => {
        this.telechargerBlob(blob, `rapport_extraction_zino_${this.suffixeFichier()}.pdf`);
        this.loadingExport = false;
      },
      error: (error) => {
        this.loadingExport = false;
        this.errorMessage = "Erreur lors de l'export PDF.";
        console.error('Erreur export pdf rapport zino:', error);
      }
    });
  }

  exportWord(): void {
    if (this.filtresForm.invalid) { return; }
    this.loadingExport = true;
    this.rapportService.exportWord(this.buildRequest()).subscribe({
      next: (blob) => {
        this.telechargerBlob(blob, `rapport_extraction_zino_${this.suffixeFichier()}.docx`);
        this.loadingExport = false;
      },
      error: (error) => {
        this.loadingExport = false;
        this.errorMessage = "Erreur lors de l'export Word.";
        console.error('Erreur export word rapport zino:', error);
      }
    });
  }

  toggleFormulaireMail(): void {
    this.afficherFormulaireMail = !this.afficherFormulaireMail;
    this.mailSuccessMessage = '';
    this.mailErrorMessage = '';
  }

  envoyerParMail(): void {
    if (this.mailForm.invalid || this.filtresForm.invalid) {
      this.mailForm.markAllAsTouched();
      return;
    }

    this.loadingMail = true;
    this.mailSuccessMessage = '';
    this.mailErrorMessage = '';

    const { destinataire, format } = this.mailForm.value;

    this.rapportService.envoyerParMail(this.buildRequest(), destinataire, format).subscribe({
      next: () => {
        this.loadingMail = false;
        this.mailSuccessMessage = `Rapport envoyé avec succès à ${destinataire}.`;
      },
      error: (error) => {
        this.loadingMail = false;
        this.mailErrorMessage = "Erreur lors de l'envoi du rapport par mail.";
        console.error('Erreur envoi mail rapport zino:', error);
      }
    });
  }
}
