import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonSpinner, IonChip, IonLabel, IonRefresher, IonRefresherContent, IonIcon, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubbleOutline, timeOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { ContratacionesService } from '../../services/contrataciones.service';
import { Contratacion } from '../../models/database.types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mis-contrataciones',
  templateUrl: './mis-contrataciones.page.html',
  styleUrls: ['./mis-contrataciones.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonSpinner, IonChip, IonLabel, IonRefresher, IonRefresherContent, IonIcon]
})
export class MisContratacionesPage implements OnInit, OnDestroy {
  contrataciones: Contratacion[] = [];
  loading = false;
  private contratacionesSubscription?: Subscription;

  constructor(
    private contratacionesService: ContratacionesService,
    private router: Router
  ) {
    addIcons({ chatbubbleOutline, timeOutline, checkmarkCircleOutline, closeCircleOutline });
  }

  ngOnInit() {
    this.loadContrataciones();
    this.subscribeToContratacionesChanges();
  }

  ngOnDestroy() {
    if (this.contratacionesSubscription) {
      this.contratacionesSubscription.unsubscribe();
    }
  }

  async loadContrataciones() {
    this.loading = true;
    this.contrataciones = await this.contratacionesService.getMisContrataciones();
    this.loading = false;
  }

  subscribeToContratacionesChanges() {
    this.contratacionesSubscription = this.contratacionesService.contrataciones$.subscribe(contrataciones => {
      if (contrataciones.length > 0) {
        this.contrataciones = contrataciones;
      }
    });
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'warning';
      case 'aceptado':
        return 'success';
      case 'rechazado':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'time-outline';
      case 'aceptado':
        return 'checkmark-circle-outline';
      case 'rechazado':
        return 'close-circle-outline';
      default:
        return 'time-outline';
    }
  }

  abrirChat(contratacionId: number) {
    this.router.navigate(['/pages/chat', contratacionId]);
  }

  async doRefresh(event: any) {
    await this.loadContrataciones();
    event.target.complete();
  }
}
