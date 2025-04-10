import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  userProfile: any = {
    photo: 'assets/img/userLogo.png',
    nombre: '',
    email: ''
  };
  isEditing: boolean = false;
  originalProfile: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userProfile = {
        ...this.userProfile,
        nombre: currentUser.nombre,
        email: currentUser.email
      };
      this.originalProfile = { ...this.userProfile };
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.originalProfile = { ...this.userProfile };
    }
  }

  cancelEdit() {
    this.userProfile = { ...this.originalProfile };
    this.isEditing = false;
  }

  async updateProfile() {
    // Here you would implement the profile update logic
    this.isEditing = false;
  }

  onPhotoSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userProfile.photo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
