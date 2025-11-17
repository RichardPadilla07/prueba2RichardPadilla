import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonSpinner, IonRefresher, IonRefresherContent, IonGrid, IonRow, IonCol, IonIcon, IonChip, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { phonePortraitOutline, wifiOutline, callOutline, chatbubbleOutline } from 'ionicons/icons';
import { PlanesService } from '../../services/planes.service';
import { AuthService } from '../../services/auth.service';
import { PlanMovil } from '../../models/database.types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonSpinner, IonRefresher, IonRefresherContent, IonGrid, IonRow, IonCol, IonIcon, IonChip, IonLabel]
})
export class CatalogoPage implements OnInit, OnDestroy {
  planes: PlanMovil[] = [];
  loading = false;
  isAuthenticated = false;
  private planesSubscription?: Subscription;

  constructor(
    private planesService: PlanesService,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ phonePortraitOutline, wifiOutline, callOutline, chatbubbleOutline });
  }

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
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
    this.planes = await this.planesService.getAllPlanes();
    this.loading = false;
  }

  subscribeToPlanesChanges() {
    this.planesSubscription = this.planesService.planes$.subscribe(planes => {
      this.planes = planes;
    });
  }

  verDetalle(planId: string) {
    this.router.navigate(['/pages/detalle-plan', planId]);
  }

  goToLogin() {
    this.router.navigate(['/pages/login']);
  }

  async doRefresh(event: any) {
    await this.loadPlanes();
    event.target.complete();
  }
}
