import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput, IonItem, IonLabel, IonText, IonSpinner, LoadingController, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ReactiveFormsModule, IonButton, IonInput, IonItem, IonLabel, IonText, IonSpinner]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Verificar si ya está autenticado
    if (this.authService.isAuthenticated()) {
      this.redirectByRole();
    }
  }

  async onLogin() {
    if (this.loginForm.valid) {
      const loading = await this.loadingCtrl.create({
        message: 'Iniciando sesión...'
      });
      await loading.present();

      const { email, password } = this.loginForm.value;
      const result = await this.authService.login(email, password);

      await loading.dismiss();

      if (result.success) {
        const toast = await this.toastCtrl.create({
          message: '¡Bienvenido!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();

        this.redirectByRole();
      } else {
        const toast = await this.toastCtrl.create({
          message: result.error || 'Error al iniciar sesión',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    }
  }

  private redirectByRole() {
    const role = this.authService.getCurrentRole();
    if (role === 'asesor_comercial') {
      this.router.navigate(['/pages/asesor/dashboard']);
    } else {
      this.router.navigate(['/tabs']);
    }
  }

  goToRegister() {
    this.router.navigate(['/pages/registro']);
  }

  goToCatalogo() {
    this.router.navigate(['/pages/catalogo']);
  }
}
