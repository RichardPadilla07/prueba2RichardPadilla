import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonIcon, IonSpinner, IonChip, IonLabel, LoadingController, ToastController, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { wifiOutline, callOutline, chatbubbleOutline, checkmarkCircleOutline, speedometerOutline, logoInstagram, ribbonOutline, informationCircleOutline } from 'ionicons/icons';
import { PlanesService } from '../../services/planes.service';
import { ContratacionesService } from '../../services/contrataciones.service';
import { AuthService } from '../../services/auth.service';
import { PlanMovil, Contratacion } from '../../models/database.types';

@Component({
  selector: 'app-detalle-plan',
  templateUrl: './detalle-plan.page.html',
  styleUrls: ['./detalle-plan.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonSpinner, IonChip, IonLabel]
})
export class DetallePlanPage implements OnInit {
  plan?: PlanMovil;
  loading = true;
  isAuthenticated = false;
  isUsuarioRegistrado = false;
  yaContratoEstePlan = false;
  tieneContratacionActiva = false;
  contratacionActiva?: Contratacion;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planesService: PlanesService,
    private contratacionesService: ContratacionesService,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ wifiOutline, callOutline, chatbubbleOutline, checkmarkCircleOutline, speedometerOutline, logoInstagram, ribbonOutline, informationCircleOutline });
  }

  async ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isUsuarioRegistrado = this.authService.hasRole('usuario_registrado');
    
    const planId = this.route.snapshot.paramMap.get('id');
    if (planId) {
      await this.loadPlan(parseInt(planId, 10));
      
      // Verificar si ya contrató este plan o tiene contratación activa
      if (this.isUsuarioRegistrado) {
        this.yaContratoEstePlan = await this.contratacionesService.yaContratoEstePlan(parseInt(planId, 10));
        const resultado = await this.contratacionesService.tieneContratacionActiva();
        this.tieneContratacionActiva = resultado.tiene;
        this.contratacionActiva = resultado.contratacion;
      }
    }
  }

  async loadPlan(id: number) {
    this.loading = true;
    const result = await this.planesService.getPlanById(id);
    this.plan = result || undefined;
    this.loading = false;
  }

  async contratar() {
    if (!this.isAuthenticated) {
      const alert = await this.alertCtrl.create({
        header: 'Inicia Sesión',
        message: 'Debes iniciar sesión para contratar un plan',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Ir a Login',
            handler: () => {
              this.router.navigate(['/pages/login']);
            }
          }
        ]
      });
      await alert.present();
      return;
    }

    if (!this.plan) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Contratación',
      message: `¿Deseas contratar el plan ${this.plan.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Contratar',
          handler: async () => {
            await this.procesarContratacion();
          }
        }
      ]
    });
    await alert.present();
  }

  async procesarContratacion() {
    if (!this.plan) return;

    const loading = await this.loadingCtrl.create({
      message: 'Procesando contratación...'
    });
    await loading.present();

    const result = await this.contratacionesService.createContratacion(this.plan.id);
    await loading.dismiss();

    if (result.success) {
      const toast = await this.toastCtrl.create({
        message: '¡Contratación realizada! Un asesor se pondrá en contacto contigo.',
        duration: 3000,
        color: 'success',
        icon: 'checkmark-circle-outline'
      });
      await toast.present();
      this.router.navigate(['/pages/mis-contrataciones']);
    } else {
      const toast = await this.toastCtrl.create({
        message: result.error || 'Error al procesar la contratación',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  goToLogin() {
    this.router.navigate(['/pages/login']);
  }

  async cancelarContratacion() {
    if (!this.contratacionActiva) return;

    const alert = await this.alertCtrl.create({
      header: 'Cancelar Contratación',
      message: '¿Estás seguro de cancelar tu contratación actual?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, Cancelar',
          role: 'destructive',
          handler: async () => {
            await this.procesarCancelacion();
          }
        }
      ]
    });
    await alert.present();
  }

  async procesarCancelacion() {
    if (!this.contratacionActiva) return;

    const loading = await this.loadingCtrl.create({
      message: 'Cancelando contratación...'
    });
    await loading.present();

    const result = await this.contratacionesService.cancelarContratacion(this.contratacionActiva.id);
    await loading.dismiss();

    if (result.success) {
      const toast = await this.toastCtrl.create({
        message: 'Contratación cancelada exitosamente',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      // Recargar página para actualizar estado
      window.location.reload();
    } else {
      const toast = await this.toastCtrl.create({
        message: result.error || 'Error al cancelar',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }
}
