import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public sideMenuOpen = false;
  
  toggleSideMenu(open?: boolean) {
    this.sideMenuOpen = (open === false ? false : !this.sideMenuOpen);
  }
}
