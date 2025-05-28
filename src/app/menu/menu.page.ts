import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../components/header/header.component';
import { IonContent, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [IonContent, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MenuPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
