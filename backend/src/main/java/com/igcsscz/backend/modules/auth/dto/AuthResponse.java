package com.igcsscz.backend.modules.auth.dto;

import com.igcsscz.backend.modules.usuario.RolEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String email;
    private RolEnum rol;
    private String nombre;
}
