import * as signalR from '@microsoft/signalr';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hub!: signalR.HubConnection;

  start(userId: number|null) {
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiBaseUrl}/transactionHub?userId=${userId}`)
      .withAutomaticReconnect()
      .build();

    this.hub.start()
      .then(() => console.log('✅ SignalR Connected'))
      .catch(err => console.error(err));
  }

  onTransaction(cb: any) {
    this.hub.on('ReceiveTransaction', cb);
  }

  onNotification(cb: any) {
    this.hub.on('ReceiveNotification', cb);
  }
}
