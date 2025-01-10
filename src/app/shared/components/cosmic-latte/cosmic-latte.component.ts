import { Component, Injectable, OnInit, resource, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'cosmic-latte',
  imports: [CommonModule,MatIconModule,MatButtonModule,MatProgressSpinnerModule],
  templateUrl: './cosmic-latte.component.html',
  styleUrl: './cosmic-latte.component.css',
})
export class CosmicLatteComponent implements OnInit {

  request = signal<string>('');
  private apiUrl = environment.apiUrl;
  healthStatus = resource({
    request:()=> ({
      request: this.request()
    }),
    loader: async () => {
      const response = await 
      fetch (this.apiUrl+'/cosmic-latte/status',{method: 'OPTIONS'})
      const json = await response.json();
      console.log(JSON.stringify(json));
      return json;
    }
  })
  ngOnInit(): void {
    this.request();
  }
}