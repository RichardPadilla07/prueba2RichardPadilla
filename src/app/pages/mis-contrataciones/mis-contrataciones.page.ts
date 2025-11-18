import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonSpinner, IonChip, IonLabel, IonRefresher, IonRefresherContent, IonIcon, IonBadge, AlertController, LoadingController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubbleOutline, timeOutline, checkmarkCircleOutline, closeCircleOutline, trashOutline, banOutline } from 'ionicons/icons';
import { ContratacionesService } from '../../services/contrataciones.service';
import { AuthService } from '../../services/auth.service';
import { Contratacion } from '../../models/database.types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mis-contrataciones',
  templateUrl: './mis-contrataciones.page.html',
  styleUrls: ['./mis-contrataciones.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonSpinner, IonChip, IonLabel, IonRefresher, IonRefresherContent, IonIcon, RouterLink]
})
export class MisContratacionesPage implements OnInit, OnDestroy {
  contrataciones: Contratacion[] = [];
  loading = false;
  private contratacionesSubscription?: Subscription;

  constructor(
    private contratacionesService: ContratacionesService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ chatbubbleOutline, timeOutline, checkmarkCircleOutline, closeCircleOutline, trashOutline, banOutline });
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
      // Filtrar solo las contrataciones del usuario actual
      const userId = this.authService.getCurrentProfile()?.user_id;
      if (userId) {
        this.contrataciones = contrataciones.filter(c => c.usuario_id === userId);
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
      case 'cancelado':
        return 'medium';
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
      case 'cancelado':
        return 'ban-outline';
      default:
        return 'time-outline';
    }
  }

  abrirChat(contratacionId: number) {
    this.router.navigate(['/pages/chat', contratacionId]);
  }

  async eliminarContrato(contratacion: Contratacion) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Contrato',
      message: `¿Estás seguro de cancelar la contratación de "${contratacion.planes_moviles?.nombre}"?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.procesarEliminacion(contratacion.id);
          }
        }
      ]
    });
    await alert.present();
  }

  async procesarEliminacion(contratacionId: number) {
    const loading = await this.loadingCtrl.create({
      message: 'Cancelando contratación...'
    });
    await loading.present();

    const result = await this.contratacionesService.cancelarContratacion(contratacionId);
    await loading.dismiss();

    if (result.success) {
      // Actualizar localmente el estado
      const contratacion = this.contrataciones.find(c => c.id === contratacionId);
      if (contratacion) {
        contratacion.estado = 'cancelado';
      }

      const toast = await this.toastCtrl.create({
        message: 'Contrato cancelado exitosamente',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      // Recargar contrataciones
      await this.loadContrataciones();
    } else {
      const toast = await this.toastCtrl.create({
        message: result.error || 'Error al cancelar',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async doRefresh(event: any) {
    await this.loadContrataciones();
    event.target.complete();
  }
}
