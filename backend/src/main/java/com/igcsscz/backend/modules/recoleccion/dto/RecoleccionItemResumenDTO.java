package com.igcsscz.backend.modules.recoleccion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecoleccionItemResumenDTO {

    private String tipoResiduo;
    private Double cantidad;
    private Integer puntos;
}
