import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Declaración de tipos para window.adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

@Component({
  selector: 'app-google-ads',
  templateUrl: './google-ads.component.html',
  styleUrls: ['./google-ads.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class GoogleAdsComponent implements OnInit {
  // ID de cliente de Google Ads - Reemplazar con tu ID real
  readonly GOOGLE_ADS_CLIENT_ID = '5066584817244936';
  
  @Input() adSlot: string = '5065389724'; // ID del slot de anuncio (ejemplo: '1234567890')
  @Input() adFormat: string = 'auto';
  @Input() adStyle: string = 'display:block';

  constructor() { }

  ngOnInit(): void {
    // Cargar el script de Google Ads si no está cargado
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${this.GOOGLE_ADS_CLIENT_ID}`;
      script.crossOrigin = "anonymous";
      script.async = true;
      document.head.appendChild(script);
    }
  }

  ngAfterViewInit() {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Error al cargar el anuncio:', e);
    }
  }
}
