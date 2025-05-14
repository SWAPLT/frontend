import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { TranslationEventsService } from '../../services/translation-events.service';
import { Subscription, timeout, catchError, of, finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

interface Language {
  code: string;
  name: string;
  flag?: string;
}

// Interfaces para los diccionarios de traducción
interface TranslationDict {
  [key: string]: string;
}

interface TranslationLanguages {
  [languageCode: string]: TranslationDict;
}

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
  languages: Language[] = [
    { code: 'es', name: 'Español', flag: 'es' },
    { code: 'en', name: 'English', flag: 'gb' },
    { code: 'fr', name: 'Français', flag: 'fr' },
    { code: 'de', name: 'Deutsch', flag: 'de' },
    { code: 'it', name: 'Italiano', flag: 'it' },
    { code: 'pt', name: 'Português', flag: 'pt' }
  ];
  
  selectedLanguage: Language;
  currentPageTexts: string[] = [];
  translatedTexts: string[] = [];
  
  // Control de estado para evitar bloqueos
  isTranslating: boolean = false;
  isOfflineMode: boolean = false;
  private subscription: Subscription | null = null;
  
  constructor(
    private translationService: TranslationService,
    private translationEventsService: TranslationEventsService,
    private toastr: ToastrService
  ) {
    // Por defecto, seleccionar español
    this.selectedLanguage = this.languages[0];
    console.log('LanguageSelectorComponent inicializado');
    
    // Verificar si estamos en modo offline o online basado en la configuración del servicio
    setTimeout(() => {
      // Verificamos el estado del servicio después de que se haya inicializado completamente
      this.isOfflineMode = this.translationService.isOfflineModeEnabled();
      
      if (this.isOfflineMode) {
        console.log('Modo offline activado basado en configuración del servicio');
      } else {
        console.log('Modo online disponible');
      }
    }, 0);
  }

  ngOnInit(): void {
    // Al iniciar el componente, verificar si hay un idioma guardado en localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage');
    console.log('Idioma guardado:', savedLanguage);
    
    if (savedLanguage) {
      const langObj = this.languages.find(lang => lang.code === savedLanguage);
      if (langObj) {
        this.selectedLanguage = langObj;
        console.log('Idioma seleccionado:', this.selectedLanguage.name);
        
        // Emitir evento de cambio de idioma con un pequeño retraso para asegurar que la aplicación esté lista
        setTimeout(() => {
          this.translationEventsService.emitLanguageChange(this.selectedLanguage.code);
        }, 300);
      }
    }
  }

  /**
   * Cambia el idioma de la aplicación
   */
  changeLanguage(language: Language): void {
    // Evitar cambios de idioma mientras está procesando una traducción
    if (this.isTranslating) {
      this.toastr.info('Por favor espera, estamos procesando una traducción');
      return;
    }

    // Si se selecciona el mismo idioma, no hacer nada
    if (this.selectedLanguage.code === language.code) {
      return;
    }

    console.log(`Cambiando idioma de ${this.selectedLanguage.code} a ${language.code}`);
    
    // Cancelar cualquier traducción anterior
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    
    // Guardar referencia del idioma anterior
    const previousLanguage = this.selectedLanguage;
    
    // Actualizar el idioma seleccionado
    this.selectedLanguage = { ...language }; // Crear copia para evitar problemas de referencia
    
    // Guardar la selección en localStorage
    localStorage.setItem('selectedLanguage', language.code);
    
    // Limpiar elementos previamente marcados para traducción
    this.cleanPreviousMarkedElements();
    
    // Mostrar mensaje de inicio de traducción
    this.toastr.info(`Cambiando idioma a ${language.name}`, '', { timeOut: 2000 });
    
    // Ejecutar traducción con pequeño retraso para permitir actualización de UI
    setTimeout(() => {
      try {
        this.applyTranslation();
      } catch (error) {
        console.error('Error al aplicar la traducción:', error);
        this.isTranslating = false;
        this.toastr.error('Error al cambiar el idioma');
        // Si hay un error, revertir al idioma anterior
        this.selectedLanguage = previousLanguage;
      }
    }, 200);
  }

  /**
   * Limpia elementos marcados para traducción de intentos anteriores
   */
  private cleanPreviousMarkedElements(): void {
    const elementsToClean = document.querySelectorAll('[data-translate-index]');
    elementsToClean.forEach(el => {
      el.removeAttribute('data-translate-index');
    });
  }

  /**
   * Aplica la traducción a los elementos de texto de la página actual
   * que no usan la directiva appTranslate
   */
  applyTranslation(): void {
    // Emitir evento de cambio de idioma
    this.translationEventsService.emitLanguageChange(this.selectedLanguage.code);
    
    // Si el idioma seleccionado es español (idioma por defecto), restaurar textos originales
    if (this.selectedLanguage.code === 'es') {
      this.restoreOriginalTexts();
      this.toastr.success(`Idioma cambiado a ${this.selectedLanguage.name}`);
      return;
    }

    this.isTranslating = true;
    
    // Capturar todos los textos visibles de la página que no tengan la directiva
    this.collectPageTexts();
    console.log(`Textos recopilados para traducir: ${this.currentPageTexts.length}`);

    // Si no hay textos para traducir, finalizar
    if (this.currentPageTexts.length === 0) {
      this.isTranslating = false;
      this.toastr.success(`Idioma cambiado a ${this.selectedLanguage.name}`);
      return;
    }

    // Dividir los textos en bloques para no sobrecargar la API
    const chunkSize = 30; // Tamaño reducido para evitar problemas
    const chunks = this.chunkArray(this.currentPageTexts, chunkSize);
    console.log(`Dividiendo ${this.currentPageTexts.length} textos en ${chunks.length} bloques`);
    
    // Inicializar array de traducciones con mismo tamaño que los textos originales
    this.translatedTexts = new Array(this.currentPageTexts.length).fill('');
    
    // Empezar el procesamiento asíncrono con un pequeño retraso
    setTimeout(() => {
      this.processNextChunk(chunks, 0, 'es', this.selectedLanguage.code, this.translatedTexts, 0);
    }, 100);
    
    // Mostrar mensaje indicando modo de traducción
    if (this.isOfflineMode) {
      this.toastr.info(`Usando traducciones locales en ${this.selectedLanguage.name}`, 'Modo Offline Activo');
    }
  }
  
  /**
   * Procesa el siguiente bloque de textos para traducir
   */
  private processNextChunk(
    chunks: string[][],
    index: number,
    sourceLang: string,
    targetLang: string,
    allTranslations: string[],
    processedChunks: number
  ): void {
    if (index >= chunks.length) {
      // Todos los bloques procesados
      this.translatedTexts = [...allTranslations];
      
      // Actualizar la UI
      this.updatePageTexts();
      
      // Resetear estado
      this.isTranslating = false;
      
      // Mostrar mensaje de éxito
      this.toastr.success(`Traducción al ${this.selectedLanguage.name} completada`);
      return;
    }
    
    const currentChunk = chunks[index];
    const startIndex = index * (chunks[0] ? chunks[0].length : 0);
    
    // Usar setTimeout para evitar recursión profunda y bloqueos
    setTimeout(() => {
      // Cancelar suscripción previa si existe
      if (this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = null;
      }
      
      // Protección contra errores
      if (!currentChunk || currentChunk.length === 0) {
        // Pasar al siguiente bloque
        this.processNextChunk(chunks, index + 1, sourceLang, targetLang, allTranslations, processedChunks);
        return;
      }
      
      // Crear nueva suscripción
      this.subscription = this.translationService.translateTexts(
        currentChunk, 
        targetLang, 
        sourceLang
      )
      .pipe(
        timeout(15000),
        catchError(error => {
          console.warn(`Error al traducir bloque ${index + 1}/${chunks.length}:`, error);
          
          // Usar traducciones offline como fallback
          return of(currentChunk.map(text => {
            const offlineTranslation = this.getBasicTranslation(text, targetLang);
            return offlineTranslation || text;
          }));
        }),
        finalize(() => {
          processedChunks++;
          console.log(`Progreso de traducción: ${Math.floor((processedChunks / chunks.length) * 100)}%`);
        })
      )
      .subscribe({
        next: translations => {
          // Procesar traducciones recibidas
          translations.forEach((translation, i) => {
            const originalIndex = startIndex + i;
            if (originalIndex < allTranslations.length) {
              allTranslations[originalIndex] = translation;
            }
          });
          
          // Actualizar la interfaz con las traducciones que tenemos hasta ahora
          if (index % 2 === 0 || index === chunks.length - 1) {
            this.translatedTexts = [...allTranslations];
            this.updatePageTexts();
          }
          
          // Limpiar la suscripción actual
          if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
          }
          
          // Continuar con el siguiente bloque usando setTimeout
          setTimeout(() => {
            this.processNextChunk(chunks, index + 1, sourceLang, targetLang, allTranslations, processedChunks);
          }, 100);
        },
        error: error => {
          console.error(`Error grave en traducción:`, error);
          this.isTranslating = false;
          
          // Mostrar lo que tenemos hasta ahora
          this.translatedTexts = [...allTranslations];
          this.updatePageTexts();
          this.toastr.warning('Traducción parcial completada con errores');
          
          // Limpiar suscripción
          if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
          }
        }
      });
    }, 100); // Pequeño retraso para no bloquear el UI thread
  }
  
  /**
   * Traducciones básicas para el modo offline
   */
  private getBasicTranslation(text: string, targetLang: string): string | null {
    const translations: TranslationLanguages = {
      en: {
        'Catálogo': 'Catalog',
        'Favoritos': 'Favorites',
        'Mensajes': 'Messages',
        'Vender': 'Sell',
        'Ver Perfil': 'View Profile',
        'LogOut': 'Log Out'
      },
      fr: {
        'Catálogo': 'Catalogue',
        'Favoritos': 'Favoris',
        'Mensajes': 'Messages',
        'Vender': 'Vendre',
        'Ver Perfil': 'Voir Profil',
        'LogOut': 'Déconnexion'
      },
      de: {
        'Catálogo': 'Katalog',
        'Favoritos': 'Favoriten',
        'Mensajes': 'Nachrichten',
        'Vender': 'Verkaufen',
        'Ver Perfil': 'Profil anzeigen',
        'LogOut': 'Abmelden'
      },
      it: {
        'Catálogo': 'Catalogo',
        'Favoritos': 'Preferiti',
        'Mensajes': 'Messaggi',
        'Vender': 'Vendere',
        'Ver Perfil': 'Visualizza Profilo',
        'LogOut': 'Disconnettersi'
      },
      pt: {
        'Catálogo': 'Catálogo',
        'Favoritos': 'Favoritos',
        'Mensajes': 'Mensagens',
        'Vender': 'Vender',
        'Ver Perfil': 'Ver Perfil',
        'LogOut': 'Sair'
      }
    };
    
    if (!translations[targetLang]) return null;
    return translations[targetLang][text] || null;
  }
  
  /**
   * Divide un array en bloques más pequeños
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Restaura los textos originales cuando se vuelve al idioma español
   */
  private restoreOriginalTexts(): void {
    console.log('Restaurando textos originales');
    const elementsToRestore = document.querySelectorAll('[data-original-text]');
    elementsToRestore.forEach(el => {
      const originalText = el.getAttribute('data-original-text');
      if (originalText) {
        el.textContent = originalText;
      }
    });
  }

  /**
   * Recopila todos los textos visibles de la página actual
   * que no tienen la directiva appTranslate
   */
  private collectPageTexts(): void {
    // Elementos que queremos traducir (excluimos script, style, etc.)
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, span, label, li, td, th');
    
    this.currentPageTexts = [];
    
    // Primero limpiar índices anteriores para evitar problemas
    this.cleanPreviousMarkedElements();
    
    // Recopilamos y filtramos los textos
    elements.forEach(el => {
      // Excluir explícitamente elementos del selector de idiomas para evitar ciclos
      if (el.closest('.language-selector')) {
        return; // Ignorar elementos dentro del selector de idiomas
      }
      
      // Verificar si el elemento no tiene la directiva appTranslate
      if (el.textContent && 
          el.textContent.trim() !== '' && 
          !el.hasAttribute('data-no-translate') &&
          !el.hasAttribute('appTranslate')) {
        
        const text = el.textContent.trim();
        
        // Solo traducir textos con palabras reales (no solo números o símbolos)
        if (/[a-zA-Z\u00C0-\u017F]{2,}/.test(text)) {
          this.currentPageTexts.push(text);
          
          // Guardar texto original si aún no se ha hecho
          if (!el.hasAttribute('data-original-text')) {
            el.setAttribute('data-original-text', text);
          }
          
          // Marcamos el elemento para poder actualizarlo después
          el.setAttribute('data-translate-index', (this.currentPageTexts.length - 1).toString());
        }
      }
    });
  }

  /**
   * Actualiza los textos de la página con las traducciones
   */
  private updatePageTexts(): void {
    // Seleccionamos elementos que marcamos para traducir
    const elementsToTranslate = document.querySelectorAll('[data-translate-index]');
    
    // Primero verificar que no estamos tratando de traducir elementos del selector
    elementsToTranslate.forEach(el => {
      if (el.closest('.language-selector')) {
        // Quitar el índice para evitar traducir elementos del selector
        el.removeAttribute('data-translate-index');
        return;
      }
      
      const index = parseInt(el.getAttribute('data-translate-index') || '-1', 10);
      if (index >= 0 && index < this.translatedTexts.length) {
        el.textContent = this.translatedTexts[index];
      }
    });
  }
  
  /**
   * Alternar entre modo online y offline
   * @param event Evento opcional para prevenir la propagación
   */
  toggleOfflineMode(event?: Event): void {
    // Detener la propagación del evento para evitar cerrar el dropdown
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Si está en proceso de traducción, esperar
    if (this.isTranslating) {
      this.toastr.info('Por favor espera a que termine la traducción actual');
      return;
    }
    
    if (this.isOfflineMode) {
      // Intentar cambiar a modo online
      this.translationService.tryOnlineMode();
      this.isOfflineMode = false;
      this.toastr.info('Intentando usar traducción online');
    } else {
      // Cambiar a modo offline
      this.translationService.enableOfflineMode();
      this.isOfflineMode = true;
      this.toastr.info('Modo de traducción offline activado');
    }
    
    // Si no estamos en español, actualizar la traducción con el nuevo modo
    if (this.selectedLanguage.code !== 'es') {
      // Dar un pequeño tiempo para que se aplique el cambio de modo
      setTimeout(() => {
        this.applyTranslation();
      }, 200);
    }
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
} 