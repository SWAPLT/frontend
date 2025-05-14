import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Definir interfaces para los objetos de solicitud
interface TranslateTextRequest {
  q: string;
  target: string;
  format: string;
  source?: string;
}

interface TranslateTextsRequest {
  q: string[];
  target: string;
  format: string;
  source?: string;
}

// Interfaces para los diccionarios de traducción
interface TranslationDict {
  [key: string]: string;
}

interface TranslationLanguages {
  [languageCode: string]: TranslationDict;
}

// Traducciones básicas offline para cuando la API no está disponible
const BASIC_TRANSLATIONS: TranslationLanguages = {
  en: {
    // Menú principal
    'Catálogo': 'Catalog',
    'Favoritos': 'Favorites',
    'Mensajes': 'Messages',
    'Vender': 'Sell',
    'Ver Perfil': 'View Profile',
    'LogOut': 'Log Out',
    // Generales
    'Contactar': 'Contact',
    'Ver detalles': 'See details',
    'Términos de uso': 'Terms of use',
    'Política de privacidad': 'Privacy policy',
    'Ayuda': 'Help',
    'Contacto': 'Contact',
    'Todos los derechos reservados': 'All rights reserved',
    // Añadidos
    'Iniciar sesión': 'Log in',
    'Registrarse': 'Sign up',
    'Cerrar sesión': 'Log out',
    'Buscar': 'Search',
    'Filtrar': 'Filter',
    'Ordenar por': 'Sort by',
    'Precio': 'Price',
    'Fecha': 'Date',
    'Guardar': 'Save',
    'Cancelar': 'Cancel',
    'Aceptar': 'Accept',
    'Rechazar': 'Reject',
    'Enviar': 'Send',
    'Recibir': 'Receive',
    'Comprar': 'Buy',
    'Siguiente': 'Next',
    'Anterior': 'Previous',
    'Bienvenido': 'Welcome',
    'Eliminar': 'Delete',
    'Editar': 'Edit',
    'Compartir': 'Share'
  },
  fr: {
    // Menú principal
    'Catálogo': 'Catalogue',
    'Favoritos': 'Favoris',
    'Mensajes': 'Messages',
    'Vender': 'Vendre',
    'Ver Perfil': 'Voir Profil',
    'LogOut': 'Déconnexion',
    // Generales
    'Contactar': 'Contacter',
    'Ver detalles': 'Voir détails',
    'Términos de uso': "Conditions d'utilisation",
    'Política de privacidad': 'Politique de confidentialité',
    'Ayuda': 'Aide',
    'Contacto': 'Contact',
    'Todos los derechos reservados': 'Tous droits réservés',
    // Añadidos
    'Iniciar sesión': 'Se connecter',
    'Registrarse': "S'inscrire",
    'Cerrar sesión': 'Déconnexion',
    'Buscar': 'Rechercher',
    'Filtrar': 'Filtrer',
    'Ordenar por': 'Trier par',
    'Precio': 'Prix',
    'Fecha': 'Date',
    'Guardar': 'Enregistrer',
    'Cancelar': 'Annuler',
    'Aceptar': 'Accepter',
    'Rechazar': 'Refuser',
    'Enviar': 'Envoyer',
    'Recibir': 'Recevoir',
    'Comprar': 'Acheter',
    'Siguiente': 'Suivant',
    'Anterior': 'Précédent',
    'Bienvenido': 'Bienvenue',
    'Eliminar': 'Supprimer',
    'Editar': 'Modifier',
    'Compartir': 'Partager'
  },
  de: {
    // Menú principal
    'Catálogo': 'Katalog',
    'Favoritos': 'Favoriten',
    'Mensajes': 'Nachrichten',
    'Vender': 'Verkaufen',
    'Ver Perfil': 'Profil anzeigen',
    'LogOut': 'Abmelden',
    // Generales
    'Contactar': 'Kontakt',
    'Ver detalles': 'Details anzeigen',
    'Términos de uso': 'Nutzungsbedingungen',
    'Política de privacidad': 'Datenschutzrichtlinie',
    'Ayuda': 'Hilfe',
    'Contacto': 'Kontakt',
    'Todos los derechos reservados': 'Alle Rechte vorbehalten',
    // Añadidos
    'Iniciar sesión': 'Anmelden',
    'Registrarse': 'Registrieren',
    'Cerrar sesión': 'Abmelden',
    'Buscar': 'Suchen',
    'Filtrar': 'Filtern',
    'Ordenar por': 'Sortieren nach',
    'Precio': 'Preis',
    'Fecha': 'Datum',
    'Guardar': 'Speichern',
    'Cancelar': 'Abbrechen',
    'Aceptar': 'Akzeptieren',
    'Rechazar': 'Ablehnen',
    'Enviar': 'Senden',
    'Recibir': 'Empfangen',
    'Comprar': 'Kaufen',
    'Siguiente': 'Weiter',
    'Anterior': 'Zurück',
    'Bienvenido': 'Willkommen',
    'Eliminar': 'Löschen',
    'Editar': 'Bearbeiten',
    'Compartir': 'Teilen'
  },
  it: {
    // Menú principal
    'Catálogo': 'Catalogo',
    'Favoritos': 'Preferiti',
    'Mensajes': 'Messaggi',
    'Vender': 'Vendere',
    'Ver Perfil': 'Visualizza Profilo',
    'LogOut': 'Disconnettersi',
    // Generales
    'Contactar': 'Contattare',
    'Ver detalles': 'Vedi dettagli',
    'Términos de uso': 'Termini di utilizzo',
    'Política de privacidad': 'Politica sulla privacy',
    'Ayuda': 'Aiuto',
    'Contacto': 'Contatto',
    'Todos los derechos reservados': 'Tutti i diritti riservati',
    // Añadidos
    'Iniciar sesión': 'Accedi',
    'Registrarse': 'Registrati',
    'Cerrar sesión': 'Disconnettersi',
    'Buscar': 'Cerca',
    'Filtrar': 'Filtra',
    'Ordenar por': 'Ordina per',
    'Precio': 'Prezzo',
    'Fecha': 'Data',
    'Guardar': 'Salva',
    'Cancelar': 'Annulla',
    'Aceptar': 'Accetta',
    'Rechazar': 'Rifiuta',
    'Enviar': 'Invia',
    'Recibir': 'Ricevi',
    'Comprar': 'Compra',
    'Siguiente': 'Successivo',
    'Anterior': 'Precedente',
    'Bienvenido': 'Benvenuto',
    'Eliminar': 'Elimina',
    'Editar': 'Modifica',
    'Compartir': 'Condividi'
  },
  pt: {
    // Menú principal
    'Catálogo': 'Catálogo',
    'Favoritos': 'Favoritos',
    'Mensajes': 'Mensagens',
    'Vender': 'Vender',
    'Ver Perfil': 'Ver Perfil',
    'LogOut': 'Sair',
    // Generales
    'Contactar': 'Contatar',
    'Ver detalles': 'Ver detalhes',
    'Términos de uso': 'Termos de uso',
    'Política de privacidad': 'Política de privacidade',
    'Ayuda': 'Ajuda',
    'Contacto': 'Contato',
    'Todos los derechos reservados': 'Todos os direitos reservados',
    // Añadidos
    'Iniciar sesión': 'Iniciar sessão',
    'Registrarse': 'Registrar-se',
    'Cerrar sesión': 'Encerrar sessão',
    'Buscar': 'Buscar',
    'Filtrar': 'Filtrar',
    'Ordenar por': 'Ordenar por',
    'Precio': 'Preço',
    'Fecha': 'Data',
    'Guardar': 'Salvar',
    'Cancelar': 'Cancelar',
    'Aceptar': 'Aceitar',
    'Rechazar': 'Rejeitar',
    'Enviar': 'Enviar',
    'Recibir': 'Receber',
    'Comprar': 'Comprar',
    'Siguiente': 'Próximo',
    'Anterior': 'Anterior',
    'Bienvenido': 'Bem-vindo',
    'Eliminar': 'Excluir',
    'Editar': 'Editar',
    'Compartir': 'Compartilhar'
  }
};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  // Esta URL debe apuntar al endpoint de la API de Google Translate
  private apiUrl = 'https://translation.googleapis.com/language/translate/v2';
  private apiKey: string = environment.googleTranslateApiKey; 
  private useOfflineMode: boolean = false;
  private apiFailedCount: number = 0;
  private readonly MAX_API_FAILURES = 3;

  constructor(private http: HttpClient) {
    // Verificar si hay una clave API válida y registrada
    if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
      console.warn('No se ha configurado la clave API de Google Translate. Iniciando en modo offline.');
      this.useOfflineMode = true;
    } else {
      console.log('TranslationService inicializado con API Key configurada. Modo online disponible.');
      // Por defecto empezar en modo offline, pero permitir cambiar a online
      this.useOfflineMode = true;
    }
  }

  /**
   * Traduce un texto al idioma especificado
   * @param text Texto a traducir
   * @param targetLang Idioma destino (código ISO)
   * @param sourceLang Idioma origen (opcional, si no se especifica lo detecta automáticamente)
   * @returns Observable con el texto traducido
   */
  translateText(text: string, targetLang: string, sourceLang?: string): Observable<string> {
    // Si no hay texto o es idioma español, no hacer nada
    if (!text || text.trim() === '' || targetLang === 'es') {
      return of(text);
    }

    // Si estamos en modo offline o la API ha fallado varias veces, usar traducciones offline
    if (this.useOfflineMode || this.apiFailedCount >= this.MAX_API_FAILURES) {
      return of(this.getOfflineTranslation(text, targetLang));
    }

    // Verificar que tengamos una clave API
    if (!this.apiKey) {
      console.error('Error: No se ha configurado una API key para Google Translate');
      this.useOfflineMode = true;
      return of(this.getOfflineTranslation(text, targetLang));
    }

    // Preparamos los datos para enviar en formato que espera Google Translate
    const body: TranslateTextRequest = {
      q: text,
      target: targetLang,
      format: 'html'
    };

    if (sourceLang) {
      body.source = sourceLang;
    }

    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const params = new HttpParams().set('key', this.apiKey);

    return this.http.post<any>(this.apiUrl, body, { headers, params })
      .pipe(
        retry(1),
        map(response => {
          // Resetear contador de fallos si hay éxito
          this.apiFailedCount = 0;
          
          console.log('Respuesta de traducción:', response);
          if (response && response.data && response.data.translations && response.data.translations.length > 0) {
            return response.data.translations[0].translatedText;
          }
          return text; // Devolver el texto original si hay algún problema
        }),
        catchError(error => {
          console.error('Error al traducir texto:', error);
          if (error.status === 401 || error.status === 403) {
            console.error('Error de autenticación: Verifica tu API key de Google Translate');
            this.apiFailedCount++;
            
            if (this.apiFailedCount >= this.MAX_API_FAILURES) {
              console.warn('Demasiados errores de API, cambiando a modo offline');
              this.useOfflineMode = true;
            }
          }
          return of(this.getOfflineTranslation(text, targetLang));
        })
      );
  }

  /**
   * Traduce un array de textos al idioma especificado con fragmentación para textos grandes
   * @param texts Array de textos a traducir
   * @param targetLang Idioma destino (código ISO)
   * @param sourceLang Idioma origen (opcional)
   * @returns Observable con array de textos traducidos
   */
  translateTexts(texts: string[], targetLang: string, sourceLang?: string): Observable<string[]> {
    if (!texts || texts.length === 0 || targetLang === 'es') {
      return of(texts);
    }

    // Si estamos en modo offline o la API ha fallado varias veces, usar traducciones offline
    if (this.useOfflineMode || this.apiFailedCount >= this.MAX_API_FAILURES) {
      return of(texts.map(text => this.getOfflineTranslation(text, targetLang)));
    }

    // Verificar que tengamos una clave API
    if (!this.apiKey) {
      console.error('Error: No se ha configurado una API key para Google Translate');
      this.useOfflineMode = true;
      return of(texts.map(text => this.getOfflineTranslation(text, targetLang)));
    }

    // Filtrar textos vacíos
    const filteredTexts = texts.filter(text => text && text.trim() !== '');
    if (filteredTexts.length === 0) {
      return of(texts);
    }

    // Preparamos los datos para enviar en formato que espera Google Translate
    const body: TranslateTextsRequest = {
      q: filteredTexts,
      target: targetLang,
      format: 'html'
    };

    if (sourceLang) {
      body.source = sourceLang;
    }

    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const params = new HttpParams().set('key', this.apiKey);

    return this.http.post<any>(this.apiUrl, body, { headers, params })
      .pipe(
        retry(1),
        map(response => {
          // Resetear contador de fallos si hay éxito
          this.apiFailedCount = 0;
          
          console.log('Respuesta de traducción múltiple:', response);
          if (response && response.data && response.data.translations) {
            // Crear un mapa de los resultados traducidos
            const translatedMap = new Map<number, string>();
            
            filteredTexts.forEach((text, index) => {
              if (response.data.translations[index]) {
                translatedMap.set(
                  texts.findIndex(t => t === text),
                  response.data.translations[index].translatedText
                );
              }
            });
            
            // Crear un nuevo array con los textos traducidos
            return texts.map((text, index) => 
              translatedMap.has(index) ? translatedMap.get(index) || text : text
            );
          }
          return texts; // Devolver los textos originales si hay algún problema
        }),
        catchError(error => {
          console.error('Error al traducir textos:', error);
          if (error.status === 401 || error.status === 403) {
            console.error('Error de autenticación: Verifica tu API key de Google Translate');
            this.apiFailedCount++;
            
            if (this.apiFailedCount >= this.MAX_API_FAILURES) {
              console.warn('Demasiados errores de API, cambiando a modo offline');
              this.useOfflineMode = true;
            }
          }
          return of(texts.map(text => this.getOfflineTranslation(text, targetLang)));
        })
      );
  }

  /**
   * Obtiene una traducción del diccionario offline
   * @param text Texto a traducir
   * @param targetLang Idioma destino
   * @returns Texto traducido o el original si no hay traducción offline
   */
  private getOfflineTranslation(text: string, targetLang: string): string {
    if (!text || targetLang === 'es') return text;
    
    const translations = BASIC_TRANSLATIONS[targetLang];
    if (!translations) return text;
    
    // 1. Buscar coincidencia exacta
    if (translations[text]) {
      return translations[text];
    }
    
    // 2. Buscar ignorando mayúsculas/minúsculas
    const lowerText = text.trim().toLowerCase();
    for (const key in translations) {
      if (key.toLowerCase() === lowerText) {
        return translations[key];
      }
    }
    
    // 3. Buscar si es parte de otra cadena (para botones/etiquetas)
    // Por ejemplo, "Iniciar" podría hacer match con "Iniciar sesión"
    for (const key in translations) {
      if (lowerText.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerText)) {
        if (key.length > 3 && lowerText.length > 3) { // evitar coincidencias en palabras muy cortas
          console.log(`Coincidencia parcial encontrada: "${text}" ~ "${key}"`);
          return translations[key];
        }
      }
    }
    
    // 4. Si es una frase, intentar traducir palabras individuales
    if (text.includes(' ')) {
      const words = text.split(' ');
      let hasTranslation = false;
      const translatedWords = words.map(word => {
        const translatedWord = this.getOfflineTranslation(word, targetLang);
        if (translatedWord !== word) hasTranslation = true;
        return translatedWord;
      });
      
      if (hasTranslation) {
        return translatedWords.join(' ');
      }
    }
    
    return text;
  }

  /**
   * Detecta el idioma de un texto
   * @param text Texto a analizar
   * @returns Observable con el código de idioma detectado
   */
  detectLanguage(text: string): Observable<string> {
    if (!text || text.trim() === '') {
      return of('');
    }

    // Si estamos en modo offline, devolver idioma por defecto (es)
    if (this.useOfflineMode || this.apiFailedCount >= this.MAX_API_FAILURES) {
      return of('es');
    }

    // Verifica que tengamos una clave API
    if (!this.apiKey) {
      console.error('Error: No se ha configurado una API key para Google Translate');
      this.useOfflineMode = true;
      return of('es');
    }

    const body = { q: text };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const params = new HttpParams().set('key', this.apiKey);

    return this.http.post<any>(`${this.apiUrl}/detect`, body, { headers, params })
      .pipe(
        retry(1),
        map(response => {
          if (response && response.data && response.data.detections && response.data.detections.length > 0) {
            return response.data.detections[0][0].language;
          }
          return 'es'; // Devolver español por defecto
        }),
        catchError(error => {
          console.error('Error al detectar idioma:', error);
          if (error.status === 401 || error.status === 403) {
            this.apiFailedCount++;
          }
          return of('es');
        })
      );
  }

  /**
   * Obtiene los idiomas soportados por la API
   * @param targetLang Idioma en el que mostrar los nombres de los idiomas
   * @returns Observable con la lista de idiomas disponibles
   */
  getSupportedLanguages(targetLang?: string): Observable<any[]> {
    // En modo offline, devolver solo los idiomas que tenemos traducciones
    if (this.useOfflineMode || this.apiFailedCount >= this.MAX_API_FAILURES) {
      const offlineLanguages = Object.keys(BASIC_TRANSLATIONS).map(code => ({
        language: code,
        name: this.getLanguageName(code)
      }));
      return of(offlineLanguages);
    }
    
    // Verifica que tengamos una clave API
    if (!this.apiKey) {
      console.error('Error: No se ha configurado una API key para Google Translate');
      this.useOfflineMode = true;
      
      const offlineLanguages = Object.keys(BASIC_TRANSLATIONS).map(code => ({
        language: code,
        name: this.getLanguageName(code)
      }));
      return of(offlineLanguages);
    }

    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    let params = new HttpParams().set('key', this.apiKey);
      
    if (targetLang) {
      params = params.set('target', targetLang);
    }

    return this.http.get<any>(`${this.apiUrl}/languages`, { headers, params })
      .pipe(
        retry(1),
        map(response => {
          if (response && response.data && response.data.languages) {
            return response.data.languages;
          }
          
          // Si no hay respuesta, devolver idiomas offline
          const offlineLanguages = Object.keys(BASIC_TRANSLATIONS).map(code => ({
            language: code,
            name: this.getLanguageName(code)
          }));
          return offlineLanguages;
        }),
        catchError(error => {
          console.error('Error al obtener idiomas soportados:', error);
          if (error.status === 401 || error.status === 403) {
            this.apiFailedCount++;
          }
          
          // En caso de error, devolver idiomas offline
          const offlineLanguages = Object.keys(BASIC_TRANSLATIONS).map(code => ({
            language: code,
            name: this.getLanguageName(code)
          }));
          return of(offlineLanguages);
        })
      );
  }
  
  /**
   * Obtiene el nombre de un idioma según su código
   */
  private getLanguageName(code: string): string {
    const languageNames: { [key: string]: string } = {
      'es': 'Español',
      'en': 'English',
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano',
      'pt': 'Português'
    };
    
    return languageNames[code] || code;
  }
  
  /**
   * Verificar si el modo offline está habilitado
   * @returns true si está en modo offline, false si está en modo online
   */
  isOfflineModeEnabled(): boolean {
    return this.useOfflineMode;
  }
  
  /**
   * Forzar el uso del modo offline
   */
  enableOfflineMode(): void {
    this.useOfflineMode = true;
    console.log('Modo offline activado');
  }
  
  /**
   * Intentar usar la API de nuevo
   */
  tryOnlineMode(): void {
    if (this.apiKey && this.apiKey !== 'YOUR_API_KEY_HERE') {
      this.useOfflineMode = false;
      this.apiFailedCount = 0;
      console.log('Intentando usar API de Google Translate');
    } else {
      console.warn('No se puede activar el modo online sin una clave API válida');
    }
  }
} 