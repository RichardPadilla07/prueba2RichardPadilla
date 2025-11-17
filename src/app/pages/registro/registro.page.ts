import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput, IonItem, IonLabel, IonText, IonSpinner, IonBackButton, IonButtons, LoadingController, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ReactiveFormsModule, IonButton, IonInput, IonItem, IonLabel, IonText, IonSpinner, IonBackButton, IonButtons]
})
export class RegistroPage implements OnInit {
  registroForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {}

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  async onRegister() {
    if (this.registroForm.valid) {
      const loading = await this.loadingCtrl.create({
        message: 'Creando cuenta...'
      });
      await loading.present();

      const { nombre, email, telefono, password } = this.registroForm.value;
      const result = await this.authService.register(email, password, nombre, telefono);

      await loading.dismiss();

      if (result.success) {
        const toast = await this.toastCtrl.create({
          message: '¡Cuenta creada exitosamente! Por favor inicia sesión.',
          duration: 3000,
          color: 'success'
        });
        await toast.present();

        this.router.navigate(['/pages/login']);
      } else {
        const toast = await this.toastCtrl.create({
          message: result.error || 'Error al crear la cuenta',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    }
  }

  goToLogin() {
    this.router.navigate(['/pages/login']);
  }
}
