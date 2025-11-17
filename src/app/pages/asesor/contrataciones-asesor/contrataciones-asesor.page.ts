import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonSpinner, IonChip, IonLabel, IonRefresher, IonRefresherContent, IonIcon, IonSegment, IonSegmentButton, IonButtons, IonBackButton, LoadingController, ToastController, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubbleOutline, timeOutline, checkmarkCircleOutline, closeCircleOutline, personOutline, callOutline } from 'ionicons/icons';
import { ContratacionesService } from '../../../services/contrataciones.service';
import { Contratacion, ContratoEstado } from '../../../models/database.types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contrataciones-asesor',
  templateUrl: './contrataciones-asesor.page.html',
  styleUrls: ['./contrataciones-asesor.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonSpinner, IonChip, IonLabel, IonRefresher, IonRefresherContent, IonIcon, IonSegment, IonSegmentButton, IonButtons, IonBackButton]
})
export class ContratacionesAsesorPage implements OnInit, OnDestroy {
  contrataciones: Contratacion[] = [];
  contratacionesFiltradas: Contratacion[] = [];
  loading = false;
  filtroEstado: string = 'todas';
  private contratacionesSubscription?: Subscription;

  constructor(
    private contratacionesService: ContratacionesService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ chatbubbleOutline, timeOutline, checkmarkCircleOutline, closeCircleOutline, personOutline, callOutline });
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
    this.contrataciones = await this.contratacionesService.getAllContrataciones();
    this.aplicarFiltro();
    this.loading = false;
  }

  subscribeToContratacionesChanges() {
    this.contratacionesSubscription = this.contratacionesService.contrataciones$.subscribe(contrataciones => {
      if (contrataciones.length > 0) {
        this.contrataciones = contrataciones;
        this.aplicarFiltro();
      }
    });
  }

  onFiltroChange(event: any) {
    this.filtroEstado = event.detail.value;
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    if (this.filtroEstado === 'todas') {
      this.contratacionesFiltradas = this.contrataciones;
    } else {
      this.contratacionesFiltradas = this.contrataciones.filter(
        c => c.estado === this.filtroEstado
      );
    }
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

  async cambiarEstado(contratacion: Contratacion, nuevoEstado: ContratoEstado) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar acción',
      message: `¿Deseas ${nuevoEstado === 'aceptado' ? 'aceptar' : 'rechazar'} esta contratación?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            await this.procesarCambioEstado(contratacion.id, nuevoEstado);
          }
        }
      ]
    });
    await alert.present();
  }

  async procesarCambioEstado(contratacionId: number, nuevoEstado: ContratoEstado) {
    const loading = await this.loadingCtrl.create({
      message: 'Actualizando...'
    });
    await loading.present();

    const result = await this.contratacionesService.updateEstado(contratacionId, nuevoEstado);
    await loading.dismiss();

    if (result.success) {
      // Actualizar localmente el estado en las listas
      const contratacion = this.contrataciones.find(c => c.id === contratacionId);
      if (contratacion) {
        contratacion.estado = nuevoEstado;
      }
      
      const contratacionFiltrada = this.contratacionesFiltradas.find(c => c.id === contratacionId);
      if (contratacionFiltrada) {
        contratacionFiltrada.estado = nuevoEstado;
      }
      
      // Volver a aplicar el filtro para que se mueva a la pestaña correcta
      this.aplicarFiltro();
      
      const toast = await this.toastCtrl.create({
        message: 'Estado actualizado correctamente',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      // Recargar después de un momento para sincronizar
      setTimeout(() => {
        this.loadContrataciones();
      }, 500);
    } else {
      const toast = await this.toastCtrl.create({
        message: result.error || 'Error al actualizar',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
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
