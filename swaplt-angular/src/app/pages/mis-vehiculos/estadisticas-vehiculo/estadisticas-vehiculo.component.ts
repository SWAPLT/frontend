import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-estadisticas-vehiculo',
  templateUrl: './estadisticas-vehiculo.component.html',
  styleUrls: ['./estadisticas-vehiculo.component.css']
})
export class EstadisticasVehiculoComponent implements OnInit {
  @Input() vehiculoId!: number;
  @Input() propietarioId!: number;

  loading = false;
  error: string | null = null;
  estadisticas: any[] = [];
  totalVisitas = 0;
  promedioDiario = 0;
  dias = 30;
  diasOpciones = [7, 30, 90];

  // Chart.js
  lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Visitas por día' }
    }
  };
  lineChartType: 'line' = 'line';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    if (!this.vehiculoId) return;
    this.loading = true;
    this.error = null;
    const token = this.authService.getToken();
    this.http.get<any>(`${environment.apiUrl}/vehiculos/${this.vehiculoId}/estadisticas-visitas?dias=${this.dias}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.estadisticas = resp.data.estadisticas;
          this.totalVisitas = resp.data.total_visitas;
          this.promedioDiario = resp.data.promedio_diario;
          this.actualizarGrafica();
        } else {
          this.error = 'No se pudieron cargar las estadísticas.';
        }
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Error al cargar las estadísticas.';
        this.loading = false;
      }
    });
  }

  actualizarGrafica() {
    this.lineChartData = {
      labels: this.estadisticas.map(e => e.fecha),
      datasets: [
        {
          data: this.estadisticas.map(e => e.total_visitas),
          label: 'Visitas',
          fill: false,
          borderColor: '#1976d2',
          tension: 0.3
        }
      ]
    };
  }

  cambiarDias(nuevoRango: number) {
    this.dias = nuevoRango;
    this.cargarEstadisticas();
  }

  esPropietario(): boolean {
    const userId = this.authService.getUserId();
    return userId === this.propietarioId;
  }
}
