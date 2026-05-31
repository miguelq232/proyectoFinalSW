package com.igcsscz.backend.modules.gps.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CamionUbicacionDTO {
    private Long camionId;
    private String placa;
    private String modelo;
    private String estado;
    private String operadorNombre;
    private Long zonaId;
    private String zonaNombre;
    private Double latitud;
    private Double longitud;
    private LocalDateTime ultimaActualizacion;
}
