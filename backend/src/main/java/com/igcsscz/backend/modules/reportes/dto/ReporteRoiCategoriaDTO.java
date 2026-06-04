package com.igcsscz.backend.modules.reportes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteRoiCategoriaDTO {

    private String categoria;
    private double kgReciclados;
    private double ingresoEstimadoBs;
    private double costoIncentivos;
    private double roi;
    private double cumplimientoMetaPorcentaje;
}
