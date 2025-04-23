import { Component } from '@angular/core';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button class="theme-toggle" (click)="toggleTheme()">
      <i [class]="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>
  `,
  styles: []
})
export class ThemeToggleComponent {
  isDarkMode = false;

  constructor(private themeService: ThemeService) {
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }
} 