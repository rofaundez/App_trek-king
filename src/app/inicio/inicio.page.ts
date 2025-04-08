import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonButton, IonLabel, IonItem, IonList } from '@ionic/angular/standalone';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonLabel, IonItem, IonList],
})
export class InicioPage implements OnInit {

  email = '';
  password = '';
  username = '';

  comparar(contraseña1 = "string", contraseña2 = "string"){
    if(contraseña1 === contraseña2){
      return true
    }
  }

  register() {
    // Aquí iría la lógica para enviar los datos de registro a tu backend
    console.log('Registrando:', this.email, this.password, this.username);
  }
  forgotPassword() {
    // Aquí iría la lógica para redirigir a la página de "Olvidé mi contraseña"
    console.log('Olvidé mi contraseña');
  }

  ngOnInit() {
  }

}
