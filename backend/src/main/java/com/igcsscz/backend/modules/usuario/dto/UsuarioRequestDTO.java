package com.igcsscz.backend.modules.usuario.dto;

import com.igcsscz.backend.modules.usuario.RolEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioRequestDTO {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email no es válido")
    private String email;

    private String password;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    private String telefono;

    @NotNull(message = "El rol es obligatorio")
    private RolEnum rol;

    private Boolean activo = true;

    // Campos específicos para OPERADOR
    private String licencia;
    private String turno;

    // Campos específicos para VECINO
    private String direccion;
    private Double latitud;
    private Double longitud;
    private Long zonaId;
}
