import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonIcon, IonSpinner, IonChip, IonLabel, LoadingController, ToastController, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { wifiOutline, callOutline, chatbubbleOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { PlanesService } from '../../services/planes.service';
import { ContratacionesService } from '../../services/contrataciones.service';
import { AuthService } from '../../services/auth.service';
import { PlanMovil } from '../../models/database.types';

@Component({
  selector: 'app-detalle-plan',
  templateUrl: './detalle-plan.page.html',
  styleUrls: ['./detalle-plan.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonIcon, IonSpinner, IonChip, IonLabel]
})
export class DetallePlanPage implements OnInit {
  plan?: PlanMovil;
  loading = true;
  isAuthenticated = false;
  isUsuarioRegistrado = false;

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
    addIcons({ wifiOutline, callOutline, chatbubbleOutline, checkmarkCircleOutline });
  }

  async ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isUsuarioRegistrado = this.authService.hasRole('usuario_registrado');
    
    const planId = this.route.snapshot.paramMap.get('id');
    if (planId) {
      await this.loadPlan(planId);
    }
  }

  async loadPlan(id: string) {
    this.loading = true;
    this.plan = await this.planesService.getPlanById(id);
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
      inputs: [
        {
          name: 'notas',
          type: 'textarea',
          placeholder: 'Notas adicionales (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Contratar',
          handler: async (data) => {
            await this.procesarContratacion(data.notas);
          }
        }
      ]
    });
    await alert.present();
  }

  async procesarContratacion(notas?: string) {
    if (!this.plan) return;

    const loading = await this.loadingCtrl.create({
      message: 'Procesando contratación...'
    });
    await loading.present();

    const result = await this.contratacionesService.createContratacion(this.plan.id, notas);
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
}
