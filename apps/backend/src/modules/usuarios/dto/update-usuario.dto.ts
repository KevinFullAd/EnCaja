// src/modules/usuarios/dto/update-usuario.dto.ts
export class UpdateUsuarioDto {
    displayName?: string;
    pin?: string;
    role?: 'OPERARIO' | 'ADMIN';
    isActive?: boolean;
}
