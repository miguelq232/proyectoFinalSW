package com.igcsscz.backend.modules.reportes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteTasaReciclajeZonaDTO {

    private String zonaNombre;
    private long totalVecinos;
    private long vecinosActivos;
    private double tasaPorcentaje;
}
