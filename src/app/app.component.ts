import { Component, OnInit } from '@angular/core';
import { SessionService } from './core-custom/services/session.service';
import { LoaderService } from './core/services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(public loaderService: LoaderService) { }

  // constructor(private sessionService: SessionService) { }

  ngOnInit() {
    // this.sessionService.startTokenWatcher();
  }
}
