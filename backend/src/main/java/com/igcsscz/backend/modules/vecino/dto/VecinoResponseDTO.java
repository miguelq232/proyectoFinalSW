package com.igcsscz.backend.modules.vecino.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VecinoResponseDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String direccion;
    private Double latitud;
    private Double longitud;
    private Long zonaId;
    private String zonaNombre;
    private String codigoQR;
    private Integer puntosAcumulados;
    private boolean activo;
}
