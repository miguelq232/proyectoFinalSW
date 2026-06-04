package com.igcsscz.backend.modules.reportes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteComparativaMensualDTO {

    private int mes;
    private int anio;
    private double totalUnidades;
    private long totalPuntos;
    private long totalVecinos;
}
