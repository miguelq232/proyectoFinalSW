package com.igcsscz.backend.modules.config.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfigPuntosRequestDTO {

    @NotNull(message = "Los puntos por unidad son obligatorios")
    private Integer puntosUnidad;

    @NotNull(message = "Los puntos por kg son obligatorios")
    private Double puntosKg;

    @NotBlank(message = "El modo de cálculo es obligatorio")
    private String modoCalculo;

    @NotNull(message = "El estado activo es obligatorio")
    private Boolean activo;

    @NotNull(message = "El precio por kg es obligatorio")
    private Double precioBsKg;

    @NotNull(message = "La meta mensual en kg es obligatoria")
    private Double metaMensualKg;
}
