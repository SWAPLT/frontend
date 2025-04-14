export interface Favorito {
  id: number;
  user_id: number;
  vehiculo_id: number;
  vehiculo: {
    id: number;
    marca: string;
    modelo: string;
    anio: number;
    precio: number;
    kilometraje: number;
    transmision: string;
    tipo_combustible: string;
    imagen_url: string;
    estado: string;
    color: string;
    fuerza: number;
    capacidad_motor: number;
    numero_puertas: number;
    plazas: number;
    descripcion: string;
    user_id: number;
  };
} 