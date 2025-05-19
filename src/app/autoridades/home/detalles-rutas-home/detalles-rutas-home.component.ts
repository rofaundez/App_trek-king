import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from 'src/app/components/header/header.component';

@Component({
  selector: 'app-detalles-rutas-home',
  templateUrl: './detalles-rutas-home.component.html',
  styleUrls: ['./detalles-rutas-home.component.scss'],
  imports: [HeaderComponent],
})
export class DetallesRutasHomeComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
