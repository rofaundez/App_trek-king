export interface User {
  id?: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;  // Changed from apellido to userLastName
  photo?: string;  // Agregamos el campo photo
}
