export interface Usuario {
  id?: number;
  username: string;
  activo: boolean;
  rolId: number;
  rolNombre?: string;
  rol?: Rol;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface Rol {
  id: number;
  nombre: string;
}