import { Component, OnInit } from '@angular/core';
import { CategoriasService } from './service/categorias.service';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit {
  categorias: any[] = [];
  categoria: { id: number | null, nombre: string } = { id: null, nombre: '' }; // Almacena la categoría en edición
  isLoading: boolean = true;
  editing: boolean = false; // Indica si estamos editando una categoría

  constructor(private categoriasService: CategoriasService) {}

  ngOnInit(): void {
    this.loadCategorias();
  }

  // Cargar todas las categorías
  loadCategorias(): void {
    this.categoriasService.getCategorias().subscribe(
      (data) => {
        this.categorias = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al cargar las categorías:', error);
        this.isLoading = false;
      }
    );
  }

  // Crear o actualizar una categoría
  saveCategoria(): void {
    if (!this.categoria.nombre.trim()) return;

    if (this.editing) {
      // Actualizar categoría existente
      this.categoriasService.updateCategoria(this.categoria.id!, this.categoria).subscribe(
        () => {
          this.loadCategorias();
          this.cancelEdit();
        },
        (error) => {
          console.error('Error al actualizar la categoría:', error);
        }
      );
    } else {
      // Crear nueva categoría
      this.categoriasService.createCategoria({ nombre: this.categoria.nombre }).subscribe(
        (data) => {
          this.categorias.push(data);
          this.cancelEdit();
        },
        (error) => {
          console.error('Error al crear la categoría:', error);
        }
      );
    }
  }

  // Eliminar una categoría
  deleteCategoria(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      this.categoriasService.deleteCategoria(id).subscribe(
        () => {
          this.categorias = this.categorias.filter(c => c.id !== id);
        },
        (error) => {
          console.error('Error al eliminar la categoría:', error);
        }
      );
    }
  }

  // Editar una categoría
  editCategoria(cat: any): void {
    this.categoria = { ...cat };
    this.editing = true;
  }

  // Cancelar edición
  cancelEdit(): void {
    this.categoria = { id: null, nombre: '' };
    this.editing = false;
  }
}
