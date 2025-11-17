import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonItem, IonLabel, IonInput, IonIcon, IonChip, IonSpinner, LoadingController, ToastController, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline, mailOutline, callOutline, logOutOutline, saveOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { Perfil } from '../../models/database.types';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ReactiveFormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonItem, IonLabel, IonInput, IonIcon, IonChip, IonSpinner]
})
export class PerfilPage implements OnInit {
  perfilForm: FormGroup;
  perfil?: Perfil;
  loading = true;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ personCircleOutline, mailOutline, callOutline, logOutOutline, saveOutline });
    
    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  async ngOnInit() {
    const currentProfile = this.authService.getCurrentProfile();
    this.perfil = currentProfile || undefined;
    if (this.perfil) {
      this.perfilForm.patchValue({
        nombre: this.perfil.nombre,
        telefono: this.perfil.telefono || ''
      });
    }
    this.loading = false;
    this.perfilForm.disable();
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.perfilForm.enable();
    } else {
      this.perfilForm.disable();
      if (this.perfil) {
        this.perfilForm.patchValue({
          nombre: this.perfil.nombre,
          telefono: this.perfil.telefono || ''
        });
      }
    }
  }

  async guardarCambios() {
    if (!this.perfilForm.valid) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa los campos correctamente',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Guardando cambios...'
    });
    await loading.present();

    const updates = {
      nombre: this.perfilForm.value.nombre,
      telefono: this.perfilForm.value.telefono || null
    };

    const result = await this.authService.updateProfile(updates);
    await loading.dismiss();

    if (result.success) {
      const currentProfile = this.authService.getCurrentProfile();
      this.perfil = currentProfile || undefined;
      this.editMode = false;
      this.perfilForm.disable();
      
      const toast = await this.toastCtrl.create({
        message: 'Perfil actualizado correctamente',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } else {
      const toast = await this.toastCtrl.create({
        message: result.error || 'Error al actualizar el perfil',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async confirmarCerrarSesion() {
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
          handler: () => {
            this.cerrarSesion();
          }
        }
      ]
    });
    await alert.present();
  }

  async cerrarSesion() {
    await this.authService.logout();
  }

  getRolLabel(rol: string): string {
    switch (rol) {
      case 'usuario_registrado':
        return 'Usuario Registrado';
      case 'asesor_comercial':
        return 'Asesor Comercial';
      case 'invitado':
        return 'Invitado';
      default:
        return rol;
    }
  }

  getRolColor(rol: string): string {
    switch (rol) {
      case 'asesor_comercial':
        return 'primary';
      case 'usuario_registrado':
        return 'success';
      default:
        return 'medium';
    }
  }
}
