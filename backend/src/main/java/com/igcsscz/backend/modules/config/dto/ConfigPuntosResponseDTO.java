package com.igcsscz.backend.modules.config.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfigPuntosResponseDTO {

    private Long id;
    private String categoria;
    private Integer puntosUnidad;
    private Double puntosKg;
    private String modoCalculo;
    private Boolean activo;
    private Double precioBsKg;
    private Double metaMensualKg;
}
