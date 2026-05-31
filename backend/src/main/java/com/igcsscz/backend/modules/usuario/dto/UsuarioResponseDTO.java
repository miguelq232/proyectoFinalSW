package com.igcsscz.backend.modules.usuario.dto;

import com.igcsscz.backend.modules.usuario.RolEnum;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {
    private Long id;
    private String email;
    private String nombre;
    private String apellido;
    private String telefono;
    private RolEnum rol;
    private boolean activo;
    private LocalDateTime fechaCreacion;

    // Campos de Operador
    private String licencia;
    private String turno;

    // Campos de Vecino
    private String direccion;
    private Double latitud;
    private Double longitud;
    private String codigoQR;
    private Integer puntosAcumulados;
    private Long zonaId;
    private String zonaNombre;
}
