import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() currentPage: number = 1;
  @Input() maxVisiblePages: number = 5;
  
  @Output() pageChange = new EventEmitter<number>();
  
  pages: number[] = [];
  totalPages: number = 1;

  constructor() { }

  ngOnInit(): void {
    this.calculatePages();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.calculatePages();
  }
  
  calculatePages(): void {
    // Calcular el número total de páginas
    this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
    
    // Limitar la página actual al rango válido
    if (this.currentPage < 1) {
      this.currentPage = 1;
    } else if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    
    // Generar arreglo de páginas visibles
    this.pages = this.getVisiblePageNumbers();
  }
  
  getVisiblePageNumbers(): number[] {
    if (this.totalPages <= this.maxVisiblePages) {
      // Si el total de páginas es menor que el máximo de páginas visibles, mostrar todas
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
    
    // Obtener páginas visibles centrando la página actual
    let startPage = Math.max(1, this.currentPage - Math.floor(this.maxVisiblePages / 2));
    let endPage = startPage + this.maxVisiblePages - 1;
    
    // Ajustar si endPage sobrepasa el total de páginas
    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - this.maxVisiblePages + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }
  
  goToPage(page: number): void {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChange.emit(page);
      this.calculatePages();
    }
  }
  
  prevPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }
  
  firstPage(): void {
    this.goToPage(1);
  }
  
  lastPage(): void {
    this.goToPage(this.totalPages);
  }
}
