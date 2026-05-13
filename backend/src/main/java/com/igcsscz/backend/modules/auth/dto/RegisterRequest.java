package com.igcsscz.backend.modules.auth.dto;

import com.igcsscz.backend.modules.usuario.RolEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 120)
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 120)
    private String apellido;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Email no válido")
    @Size(max = 180)
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 255, message = "La contraseña debe tener entre 6 y 255 caracteres")
    private String password;

    @Size(max = 40)
    private String telefono;

    @NotNull(message = "El rol es obligatorio")
    private RolEnum rol;
}
