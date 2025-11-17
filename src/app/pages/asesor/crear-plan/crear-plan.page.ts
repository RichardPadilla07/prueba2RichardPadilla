import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonBackButton, IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonToggle, IonSpinner, LoadingController, ToastController } from '@ionic/angular/standalone';
import { PlanesService } from '../../../services/planes.service';
import { PlanMovil } from '../../../models/database.types';

@Component({
  selector: 'app-crear-plan',
  templateUrl: './crear-plan.page.html',
  styleUrls: ['./crear-plan.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ReactiveFormsModule, IonButton, IonButtons, IonBackButton, IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonToggle, IonSpinner]
})
export class CrearPlanPage implements OnInit {
  planForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isEditMode = false;
  planId?: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private planesService: PlanesService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.planForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      segmento: [''],
      publico_objetivo: [''],
      datos: [''],
      minutos: [''],
      sms: [''],
      velocidad: [''],
      redes_sociales: [''],
      llamadas_internacionales: [''],
      roaming: [''],
      activo: [true]
    });
  }

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.planId = parseInt(idParam, 10);
      this.isEditMode = true;
      await this.loadPlan(this.planId);
    }
  }

  async loadPlan(id: number) {
    this.loading = true;
    const plan = await this.planesService.getPlanById(id);
    if (plan) {
      this.planForm.patchValue({
        nombre: plan.nombre,
        precio: plan.precio,
        segmento: plan.segmento,
        publico_objetivo: plan.publico_objetivo,
        datos: plan.datos,
        minutos: plan.minutos,
        sms: plan.sms,
        velocidad: plan.velocidad,
        redes_sociales: plan.redes_sociales,
        llamadas_internacionales: plan.llamadas_internacionales,
        roaming: plan.roaming,
        activo: plan.activo
      });
      if (plan.imagen_url) {
        this.previewUrl = plan.imagen_url;
      }
    }
    this.loading = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async guardarPlan() {
    if (!this.planForm.valid) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa todos los campos requeridos',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: this.isEditMode ? 'Actualizando plan...' : 'Creando plan...'
    });
    await loading.present();

    try {
      let imageUrl = this.previewUrl;

      // Subir imagen si hay una nueva seleccionada
      if (this.selectedFile) {
        const tempId: number = this.planId || Date.now();
        const uploadResult = await this.planesService.uploadImage(this.selectedFile, tempId);
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      }

      const planData = {
        ...this.planForm.value,
        imagen_url: imageUrl
      };

      let result;
      if (this.isEditMode && this.planId) {
        result = await this.planesService.updatePlan(this.planId, planData);
      } else {
        result = await this.planesService.createPlan(planData);
      }

      await loading.dismiss();

      if (result.success) {
        const toast = await this.toastCtrl.create({
          message: this.isEditMode ? 'Plan actualizado correctamente' : 'Plan creado correctamente',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.router.navigate(['/pages/asesor/dashboard']);
      } else {
        const toast = await this.toastCtrl.create({
          message: result.error || 'Error al guardar el plan',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    } catch (error: any) {
      await loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: error.message || 'Error inesperado',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }
}
