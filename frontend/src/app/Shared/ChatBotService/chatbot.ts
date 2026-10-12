import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  constructor(private http: HttpClient) { }

 askBot(question: string, userName: string | undefined) {
  return this.http.post<any>(`${environment.apiBaseUrl}/api/chat/ask`, {
    question,
    userName
  },{});
}
}
