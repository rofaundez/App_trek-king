export interface Rutas {
    id?: string;
    nombre: string;
    foto: string;
    descripcion: string;
    dificultad: 'Fácil' | 'Moderada' | 'Difícil' | 'Muy Difícil';
    creador: {
        id: string;
        nombre: string;
        email: string;
    };
    puntosDescanso: {
        nombre: string;
        ubicacion: {
            lat: number;
            lng: number;
        };
        descripcion?: string;
    }[];
    puntoInicio: {
        lat: number;
        lng: number;
        direccion: string;
    };
    puntoTermino: {
        lat: number;
        lng: number;
        direccion: string;
    };
    localidad: string;
    fechaCreacion?: Date;
    ultimaModificacion?: Date;
}