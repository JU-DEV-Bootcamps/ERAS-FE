import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleAuthComponent } from './shared/components/google-auth/google-auth.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GoogleAuthComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'ERAS-FE';
}
