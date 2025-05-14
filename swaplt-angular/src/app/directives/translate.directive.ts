import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { TranslationEventsService } from '../services/translation-events.service';
import { Subscription, timeout, catchError, of, finalize } from 'rxjs';

@Directive({
  selector: '[appTranslate]'
})
export class TranslateDirective implements OnInit, OnDestroy {
  @Input('appTranslate') key: string = '';
  @Input() translateParams: any = {};
  
  private originalText: string = '';
  private translationSubscription: Subscription | null = null;
  private eventSubscription: Subscription | null = null;
  private isTranslating: boolean = false;
  private currentLanguage: string = '';
  
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private translationService: TranslationService,
    private translationEventsService: TranslationEventsService
  ) {}
  
  ngOnInit() {
    // Guardar el texto original
    this.originalText = this.el.nativeElement.textContent.trim();
    
    // Marcar este elemento para que no sea procesado por el método general de traducción
    this.renderer.setAttribute(this.el.nativeElement, 'appTranslate', '');
    
    // Guardar el texto original como atributo
    this.renderer.setAttribute(this.el.nativeElement, 'data-original-text', this.originalText);
    
    // Mostrar un indicador visual mientras se está traduciendo
    const loadingIndicator = this.renderer.createElement('span');
    this.renderer.addClass(loadingIndicator, 'translation-loading');
    this.renderer.setStyle(loadingIndicator, 'display', 'none');
    this.renderer.appendChild(this.el.nativeElement, loadingIndicator);
    
    // Obtener el idioma guardado en localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage');
    
    // Si hay un idioma seleccionado diferente del español, traducir
    if (savedLanguage && savedLanguage !== 'es') {
      this.currentLanguage = savedLanguage;
      // Pequeño retraso para evitar demasiadas solicitudes simultáneas
      setTimeout(() => {
        this.translateElement(savedLanguage);
      }, 50 + Math.random() * 200); // Retraso aleatorio para distribuir peticiones
    }
    
    // Suscribirse a cambios de idioma
    this.eventSubscription = this.translationEventsService.onLanguageChange()
      .subscribe(event => {
        // Si el idioma no ha cambiado, no hacer nada
        if (this.currentLanguage === event.language) {
          return;
        }
        
        this.currentLanguage = event.language;
        
        // Evitar traducir si ya estamos traduciendo
        if (!this.isTranslating) {
          this.translateElement(event.language);
        }
      });
  }
  
  translateElement(targetLang: string) {
    // Si el idioma es español, mostrar el texto original
    if (targetLang === 'es') {
      this.renderer.setProperty(this.el.nativeElement, 'textContent', this.originalText);
      return;
    }
    
    // No traducir si el texto está vacío o es muy corto
    if (!this.originalText || this.originalText.length < 2) {
      return;
    }
    
    // Marcar como en proceso de traducción
    this.isTranslating = true;
    
    // Mostrar el indicador de carga
    const loadingIndicator = this.el.nativeElement.querySelector('.translation-loading');
    if (loadingIndicator) {
      this.renderer.setStyle(loadingIndicator, 'display', 'inline-block');
    }
    
    // Cancelar traducción previa si existe
    if (this.translationSubscription) {
      this.translationSubscription.unsubscribe();
      this.translationSubscription = null;
    }
    
    // Traducir el texto
    this.translationSubscription = this.translationService.translateText(
      this.originalText, 
      targetLang, 
      'es' // Asumimos que el idioma original es español
    )
    .pipe(
      timeout(10000), // Agregar un timeout de 10 segundos para evitar bloqueos
      catchError(error => {
        console.error('Error al traducir:', error);
        this.isTranslating = false;
        
        // Ocultar el indicador de carga
        if (loadingIndicator) {
          this.renderer.setStyle(loadingIndicator, 'display', 'none');
        }
        
        // En caso de error, mostrar el texto original
        return of(this.originalText);
      }),
      finalize(() => {
        // Ocultar el indicador de carga al finalizar
        if (loadingIndicator) {
          this.renderer.setStyle(loadingIndicator, 'display', 'none');
        }
        
        this.isTranslating = false;
      })
    )
    .subscribe({
      next: translatedText => {
        // Actualizar el contenido del elemento con el texto traducido
        this.renderer.setProperty(this.el.nativeElement, 'textContent', translatedText);
        
        // Volver a añadir el indicador de carga (que se eliminó al cambiar el textContent)
        if (loadingIndicator) {
          this.renderer.appendChild(this.el.nativeElement, loadingIndicator);
          this.renderer.setStyle(loadingIndicator, 'display', 'none');
        }
      },
      error: error => {
        console.error('Error en suscripción de traducción:', error);
        this.renderer.setProperty(this.el.nativeElement, 'textContent', this.originalText);
      }
    });
  }
  
  ngOnDestroy() {
    // Limpiar suscripciones al destruir la directiva
    if (this.translationSubscription) {
      this.translationSubscription.unsubscribe();
    }
    
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }
} 