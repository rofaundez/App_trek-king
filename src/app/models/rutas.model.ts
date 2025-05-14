export interface Rutas {
    id: string;                    // Cambiado a requerido ya que se usa en la navegación
    nombre: string;
    foto?: string;
    imagen: string;                // Cambiado a requerido ya que se usa en la vista
    descripcion?: string;          // Cambiado a opcional ya que no siempre se usa
    ubicacion: string;             // Cambiado a requerido para la vista de lista
    dificultad: string;            // Simplificado para permitir el formato personalizado
    localidad?: string;            // Cambiado a opcional
    categorias: string[];          // Cambiado a requerido para el sistema de filtrado
    creador?: {                    // Cambiado a opcional ya que no siempre se necesita
        id: string;
        nombre: string;
        email: string;
    };
    puntosDescanso?: {             // Cambiado a opcional
        nombre: string;
        ubicacion: {
            lat: number;
            lng: number;
        };
        descripcion?: string;
    }[];
    puntoInicio?: {                // Cambiado a opcional
        lat: number;
        lng: number;
        direccion: string;
    };
    puntoTermino?: {               // Cambiado a opcional
        lat: number;
        lng: number;
        direccion: string;
    };
    fechaCreacion?: Date;
    ultimaModificacion?: Date;
}