import { Component, HostListener } from '@angular/core';
  import { AuthService } from './services/auth.service';

  @Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
  })
  export class AppComponent {
    dropdownOpen = false;
    mobileMenuOpen = false;
    isMobileView = false;

    constructor(private authService: AuthService) {}

    @HostListener('window:resize', ['$event'])
    onResize() {
      this.checkViewport();
    }

    checkViewport() {
      this.isMobileView = window.innerWidth < 992;
      if (!this.isMobileView) {
        this.mobileMenuOpen = false;
        this.dropdownOpen = false;
      }
    }

    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    }

    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      if (!this.mobileMenuOpen) {
        this.dropdownOpen = false;
      }
    }

    logOut() {
      this.authService.logout();
    }
  }
