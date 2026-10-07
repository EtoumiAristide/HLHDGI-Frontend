import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImpressionAdminApiService } from '../services/impression-admin-api.service';

@Component({
  selector: 'app-impression-admin-api-config',
  templateUrl: './impression-admin-api-config.component.html',
  styleUrls: ['./impression-admin-api-config.component.scss']
})
export class ImpressionAdminApiConfigComponent implements OnInit {
  form: FormGroup;
  agents: any[] = [];
  loading = false;
  message = '';
  errorMessage = '';
  showApiKeyModal = false;
  generatedApiKeyInfo: any = null;
  copySuccess = false;

  constructor(
    private fb: FormBuilder,
    private impressionService: ImpressionAdminApiService
  ) {
    this.form = this.fb.group({
      agentId: ['', Validators.required],
      codeEtablissement: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAgents();
  }

  private handleSuccessfulApiKeyResponse(response: any): void {
    const payload = response?.data ?? response ?? {};
    const apiKey = payload.apiKey || payload.api_key || '';

    if (apiKey) {
      this.generatedApiKeyInfo = {
        agentId: payload.agentId || payload.agent_id || this.form.value.agentId,
        codeEtablissement: payload.codeEtablissement || payload.code_etablissement || this.form.value.codeEtablissement,
        apiKey,
        avertissement: payload.avertissement || "Cette clé n'est affichée qu'une seule fois : à reporter dans la configuration du poste."
      };
      this.showApiKeyModal = true;
      this.copySuccess = false;
    } else {
      this.message = 'Opération réussie.';
    }
  }

  loadAgents(): void {
    this.loading = true;
    this.impressionService.getAgents().subscribe({
      next: (response) => {
        this.agents = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement agents impression:', error);
        this.agents = [];
        this.loading = false;
      }
    });
  }

  createAgent(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.message = '';
    this.errorMessage = '';
    this.showApiKeyModal = false;
    this.generatedApiKeyInfo = null;

    this.impressionService.createAgent(this.form.value).subscribe({
      next: (response) => {
        this.handleSuccessfulApiKeyResponse(response);
        this.form.reset();
        this.loadAgents();
      },
      error: (error) => {
        console.error('Erreur création agent impression:', error);
        this.errorMessage = 'Erreur lors de la création de l’agent impression.';
      }
    });
  }

  rotateKey(agentId: string): void {
    if (!agentId) { return; }

    this.message = '';
    this.errorMessage = '';
    this.showApiKeyModal = false;
    this.generatedApiKeyInfo = null;
    this.impressionService.rotateAgentKey(agentId).subscribe({
      next: (response) => {
        this.handleSuccessfulApiKeyResponse(response);
        this.loadAgents();
      },
      error: (error) => {
        console.error('Erreur rotation clé impression:', error);
        this.errorMessage = 'Erreur lors de la régénération de la clé.';
      }
    });
  }

  revokeAgent(agentId: string): void {
    if (!agentId) { return; }

    this.message = '';
    this.errorMessage = '';
    this.impressionService.revokeAgent(agentId).subscribe({
      next: () => {
        this.message = 'L’agent a été révoqué avec succès.';
        this.loadAgents();
      },
      error: (error) => {
        console.error('Erreur révocation agent impression:', error);
        this.errorMessage = 'Erreur lors de la révocation de l’agent.';
      }
    });
  }

  closeApiKeyModal(): void {
    this.showApiKeyModal = false;
    this.generatedApiKeyInfo = null;
    this.copySuccess = false;
  }

  async copyApiKey(): Promise<void> {
    if (!this.generatedApiKeyInfo?.apiKey) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.generatedApiKeyInfo.apiKey);
      this.copySuccess = true;
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = this.generatedApiKeyInfo.apiKey;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.copySuccess = true;
    }
  }
}
