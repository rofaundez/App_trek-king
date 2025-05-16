import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  constructor(private router: Router) {}


  goToAgenda(){
    this.router.navigate(['/agenda'])
  }
  goToGroups(){
    this.router.navigate(['/grupos'])
  }
  goToMyRoutes() {
    this.router.navigate(['/my-routes']);
  }
  goTohome() {
    this.router.navigate(['/home']);
  }
  goToSos() {
    this.router.navigate(['/sos']);
  }
}
