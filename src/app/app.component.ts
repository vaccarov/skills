import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public sideMenuClosed = false;

  toggleSideMenu() {
    this.sideMenuClosed = !this.sideMenuClosed;
  }
}
