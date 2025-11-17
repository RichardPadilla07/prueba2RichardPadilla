import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButton, IonButtons, IonBackButton, IonIcon, IonSpinner, IonItem, IonTextarea, IonLabel, IonChip } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sendOutline, personCircleOutline } from 'ionicons/icons';
import { ChatService } from '../../services/chat.service';
import { ContratacionesService } from '../../services/contrataciones.service';
import { AuthService } from '../../services/auth.service';
import { MensajeChat, Contratacion } from '../../models/database.types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonFooter, IonButton, IonButtons, IonBackButton, IonIcon, IonSpinner, IonItem, IonTextarea, IonLabel, IonChip]
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content?: IonContent;
  
  mensajes: MensajeChat[] = [];
  nuevoMensaje = '';
  loading = true;
  sending = false;
  contratacionId?: string;
  contratacion?: Contratacion;
  currentUserId?: string;
  private mensajesSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private contratacionesService: ContratacionesService,
    private authService: AuthService
  ) {
    addIcons({ sendOutline, personCircleOutline });
  }

  async ngOnInit() {
    this.currentUserId = this.authService.getCurrentProfile()?.id;
    this.contratacionId = this.route.snapshot.paramMap.get('id') || undefined;
    
    if (this.contratacionId) {
      await this.loadContratacion(this.contratacionId);
      this.chatService.subscribeToChat(this.contratacionId);
      this.subscribeToChatMessages();
      await this.chatService.markAsRead(this.contratacionId);
    }
    
    this.loading = false;
  }

  ngOnDestroy() {
    if (this.mensajesSubscription) {
      this.mensajesSubscription.unsubscribe();
    }
    this.chatService.unsubscribe();
  }

  async loadContratacion(id: string) {
    this.contratacion = await this.contratacionesService.getContratacionById(id);
  }

  subscribeToChatMessages() {
    this.mensajesSubscription = this.chatService.mensajes$.subscribe(mensajes => {
      this.mensajes = mensajes;
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
      
      if (this.contratacionId) {
        this.chatService.markAsRead(this.contratacionId);
      }
    });
  }

  async enviarMensaje() {
    if (!this.nuevoMensaje.trim() || !this.contratacionId) return;

    this.sending = true;
    const mensaje = this.nuevoMensaje.trim();
    this.nuevoMensaje = '';

    const result = await this.chatService.sendMensaje(this.contratacionId, mensaje);
    this.sending = false;

    if (!result.success) {
      this.nuevoMensaje = mensaje; // Restaurar mensaje si falló
    }
  }

  isMiMensaje(mensaje: MensajeChat): boolean {
    return mensaje.emisor_id === this.currentUserId;
  }

  scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }
}
