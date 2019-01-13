import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {RouterModule, Routes} from '@angular/router';
import {AutocompletePageComponent} from './components/autocomplete-page/autocompletePage.component';
import {HomeComponent} from './components/home/home.component';
import {AutocompleteComponent} from './components/autocomplete-page/autocomplete/autocomplete.component';
import {ReactiveFormsModule} from '@angular/forms';
import { ResumeComponent } from './components/resume/resume.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'resume', component: ResumeComponent },
  { path: 'autocomplete', component: AutocompletePageComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    // Pages
    HomeComponent,
    ResumeComponent,
    AutocompletePageComponent,
    // Custom components
    AutocompleteComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      routes
    ),
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
