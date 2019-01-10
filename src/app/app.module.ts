import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {RouterModule, Routes} from '@angular/router';
import {AutocompletePageComponent} from './components/autocomplete-page/autocompletePage.component';
import {HomeComponent} from './components/home/home.component';

const routes: Routes = [
  { path: '',
    component: AppComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'autocomplete', component: AutocompletePageComponent }
    ]
  }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AutocompletePageComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      routes
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
