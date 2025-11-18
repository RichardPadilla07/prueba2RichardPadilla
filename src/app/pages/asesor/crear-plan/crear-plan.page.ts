import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonBackButton, IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonToggle, IonSpinner, IonIcon, LoadingController, ToastController } from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { imageOutline, addCircleOutline } from 'ionicons/icons';
import { PlanesService } from '../../../services/planes.service';
import { PlanMovil } from '../../../models/database.types';

@Component({
  selector: 'app-crear-plan',
  templateUrl: './crear-plan.page.html',
  styleUrls: ['./crear-plan.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ReactiveFormsModule, IonButton, IonButtons, IonBackButton, IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonToggle, IonSpinner, IonIcon]
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
    addIcons({ imageOutline, addCircleOutline });
    this.planForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      segmento: ['', Validators.required],
      publico_objetivo: ['', Validators.required],
      datos: ['', Validators.required],
      minutos: ['', Validators.required],
      sms: ['', Validators.required],
      velocidad: ['', Validators.required],
      redes_sociales: ['', Validators.required],
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
        activo: plan.activo
      });
      if (plan.imagen_url) {
        this.previewUrl = plan.imagen_url;
      }
    }
    this.loading = false;
  }

  async seleccionarImagen() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos // Solo galería
      });

      if (image.dataUrl) {
        this.previewUrl = image.dataUrl;
        
        // Convertir DataUrl a File para subir
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        this.selectedFile = new File([blob], 'plan-image.jpg', { type: 'image/jpeg' });
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      const toast = await this.toastCtrl.create({
        message: 'Error al seleccionar la imagen',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
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

    // Validar que se haya seleccionado una imagen (solo para crear nuevo)
    if (!this.isEditMode && !this.selectedFile && !this.previewUrl) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor selecciona una imagen para el plan',
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
        } else {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({
            message: 'Error al subir la imagen',
            duration: 3000,
            color: 'danger'
          });
          await toast.present();
          return;
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
        // Esperar un momento para que la base de datos se actualice
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Forzar recarga de todos los planes
        await this.planesService.getAllPlanes(true);
        
        const toast = await this.toastCtrl.create({
          message: this.isEditMode ? 'Plan actualizado correctamente' : 'Plan creado correctamente',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        
        // Navegar al dashboard
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
