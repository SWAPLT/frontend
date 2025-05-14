import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface LanguageChangeEvent {
  language: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationEventsService {
  private languageChangeSubject = new Subject<LanguageChangeEvent>();
  
  constructor() { }
  
  /**
   * Emite un evento cuando el idioma cambia
   * @param language Código del nuevo idioma
   */
  emitLanguageChange(language: string): void {
    this.languageChangeSubject.next({ language });
  }
  
  /**
   * Observable que se puede usar para suscribirse a cambios de idioma
   */
  onLanguageChange(): Observable<LanguageChangeEvent> {
    return this.languageChangeSubject.asObservable();
  }
}