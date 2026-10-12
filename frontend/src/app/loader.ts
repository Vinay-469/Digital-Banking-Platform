import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private requestCount = 0;
  private _loading = new BehaviorSubject<boolean>(false);
  loading$ = this._loading.asObservable();

  show() {
    this.requestCount++;
    this._loading.next(true);
  }

  hide() {
    this.requestCount--;

    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this._loading.next(false);
    }
  }
}