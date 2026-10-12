import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Loader {

  private requestCount = 0;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  show() {
    this.requestCount++;

    // debounce to avoid flicker
    setTimeout(() => {
      if (this.requestCount > 0) {
        this.loadingSubject.next(true);
      }
    }, 200);
  }

  hide() {
    this.requestCount--;

    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loadingSubject.next(false);
    }
  }
}