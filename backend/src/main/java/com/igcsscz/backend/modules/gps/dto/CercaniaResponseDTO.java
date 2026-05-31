package com.igcsscz.backend.modules.gps.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CercaniaResponseDTO {
    private boolean cerca;
    private Double distanciaMetros;
    private String placa;
    private Long camionId;
    private String operadorNombre;
}
