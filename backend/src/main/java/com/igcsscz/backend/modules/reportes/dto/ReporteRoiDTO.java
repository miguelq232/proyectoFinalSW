package com.igcsscz.backend.modules.reportes.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteRoiDTO {

    private List<ReporteRoiCategoriaDTO> porCategoria;
    private double totalIngresoBs;
    private double totalCostoBs;
    private double roiTotal;
    private double roiPorcentaje;
}
