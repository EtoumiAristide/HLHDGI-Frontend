import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  public isLoading = new BehaviorSubject(false);
  private activeRequests = 0;
    
  constructor() { }

  startLoading(): void {
    this.activeRequests++;
    this.isLoading.next(true);
  }

  stopLoading(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.isLoading.next(this.activeRequests > 0);
  }
}
