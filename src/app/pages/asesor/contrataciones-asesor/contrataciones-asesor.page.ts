import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-contrataciones-asesor',
  templateUrl: './contrataciones-asesor.page.html',
  styleUrls: ['./contrataciones-asesor.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ContratacionesAsesorPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
