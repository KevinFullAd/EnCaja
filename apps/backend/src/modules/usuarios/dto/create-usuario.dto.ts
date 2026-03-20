// src/modules/usuarios/dto/create-usuario.dto.ts
export class CreateUsuarioDto {
    displayName: string;
    pin: string;
    role?: 'OPERARIO' | 'ADMIN';
}