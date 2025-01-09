import { Component, OnInit, resource, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cosmic-latte',
  imports: [CommonModule],
  templateUrl: './cosmic-latte.component.html',
  styleUrl: './cosmic-latte.component.css',
})
export class CosmicLatteComponent implements OnInit {

  request = signal<string>('');

  healthStatus = resource({
    request:()=> ({
      request: this.request()
    }),
    loader: async () => {
      const response = await 
      fetch ('http://localhost:5074/cosmic-latte/status',{method: 'OPTIONS'})
      const json = await response.json();
      return json;
    }
  })
  ngOnInit(): void {
    this.request();
  }
}