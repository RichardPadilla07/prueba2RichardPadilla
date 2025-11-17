import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonButtons, IonIcon, IonSpinner, IonFab, IonFabButton, IonGrid, IonRow, IonCol, IonChip, IonLabel, AlertController, LoadingController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, eyeOutline, eyeOffOutline, logOutOutline } from 'ionicons/icons';
import { PlanesService } from '../../../services/planes.service';
import { AuthService } from '../../../services/auth.service';
import { PlanMovil } from '../../../models/database.types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonButtons, IonIcon, IonSpinner, IonFab, IonFabButton, IonGrid, IonRow, IonCol, IonChip, IonLabel]
})
export class DashboardPage implements OnInit, OnDestroy {
  planes: PlanMovil[] = [];
  loading = false;
  private planesSubscription?: Subscription;

  constructor(
    private planesService: PlanesService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ addOutline, createOutline, trashOutline, eyeOutline, eyeOffOutline, logOutOutline });
  }

  ngOnInit() {
    this.loadPlanes();
    this.subscribeToPlanesChanges();
  }

  ngOnDestroy() {
    if (this.planesSubscription) {
      this.planesSubscription.unsubscribe();
    }
  }

  async loadPlanes() {
    this.loading = true;
    this.planes = await this.planesService.getAllPlanes(true);
    this.loading = false;
  }

  subscribeToPlanesChanges() {
    this.planesSubscription = this.planesService.planes$.subscribe(planes => {
      this.planes = planes;
    });
  }

  crearPlan() {
    this.router.navigate(['/pages/asesor/crear-plan']);
  }

  verDetalle(planId: number) {
    this.router.navigate(['/pages/detalle-plan', planId]);
  }

  editarPlan(planId: number) {
    this.router.navigate(['/pages/asesor/crear-plan', planId]);
  }

  async toggleActivo(plan: PlanMovil) {
    const loading = await this.loadingCtrl.create({
      message: plan.activo ? 'Desactivando plan...' : 'Activando plan...'
    });
    await loading.present();

    const result = await this.planesService.toggleActivo(plan.id, !plan.activo);
    await loading.dismiss();

    if (result.success) {
      // Actualizar localmente
      plan.activo = !plan.activo;
      
      const toast = await this.toastCtrl.create({
        message: plan.activo ? 'Plan activado' : 'Plan desactivado',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Error al cambiar el estado',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async eliminarPlan(plan: PlanMovil) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar el plan "${plan.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.procesarEliminacion(plan);
          }
        }
      ]
    });
    await alert.present();
  }

  async procesarEliminacion(plan: PlanMovil) {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando plan...'
    });
    await loading.present();

    // Eliminar imagen si existe
    if (plan.imagen_url) {
      await this.planesService.deleteImage(plan.imagen_url);
    }

    const result = await this.planesService.deletePlan(plan.id);
    await loading.dismiss();

    if (result.success) {
      // Eliminar el plan de la lista local inmediatamente
      this.planes = this.planes.filter(p => p.id !== plan.id);
      
      const toast = await this.toastCtrl.create({
        message: 'Plan eliminado correctamente',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } else {
      const toast = await this.toastCtrl.create({
        message: result.error || 'Error al eliminar el plan',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  verContrataciones() {
    this.router.navigate(['/pages/asesor/contrataciones-asesor']);
  }

  async cerrarSesion() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          handler: async () => {
            // Limpiar localStorage
            localStorage.clear();
            
            // Cerrar sesión en Supabase
            await this.authService.logout();
          }
        }
      ]
    });
    await alert.present();
  }
}
