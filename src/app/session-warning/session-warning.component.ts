import { Component } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { SessionService } from '../core-custom/services/session.service';

@Component({
  selector: 'app-session-warning',
  templateUrl: './session-warning.component.html',
  styleUrls: ['./session-warning.component.css']
})
export class SessionWarningComponent {
  /*show = false;
  countdown = 60;
  private sub!: Subscription;

  constructor(private sessionService: SessionService) { }

  ngOnInit() {
    this.sessionService.onSessionWarning.subscribe((secondsLeft) => {
      this.countdown = secondsLeft;
      this.show = true;
      this.startCountdown();
    });
  }

  startCountdown() {
    this.sub = interval(1000).subscribe(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.show = false;
        this.sub.unsubscribe();
      }
    });
  }

  extend() {
    this.sessionService.resetWarning();
    this.show = false;
    this.sub.unsubscribe();
    // Ici tu pourrais faire une requête pour rafraîchir le token s'il y a un refresh token
  }*/
}
