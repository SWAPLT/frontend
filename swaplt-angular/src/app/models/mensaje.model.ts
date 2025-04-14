export interface Mensaje {
  id: number;
  emisor_id: number;
  receptor_id: number;
  contenido: string;
  leido: boolean;
  created_at: string;
  updated_at: string;
}

export interface MensajeCreate {
  emisor_id: number;
  receptor_id: number;
  contenido: string;
} 