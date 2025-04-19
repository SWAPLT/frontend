import { Component, HostListener } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  dropdownOpen = false;
  mobileMenuOpen = false;
  isMobileView = false;
  footerVisible = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkViewport();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.checkFooterVisibility();
  }

  checkViewport() {
    this.isMobileView = window.innerWidth < 992;
    if (!this.isMobileView) {
      this.mobileMenuOpen = false;
      this.dropdownOpen = false;
    }
  }

  checkFooterVisibility() {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    this.footerVisible = scrollPosition >= documentHeight;
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

  navigateToHome() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/catalogo']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
