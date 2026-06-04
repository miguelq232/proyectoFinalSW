package com.igcsscz.backend.modules.reportes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteResumenIncentivosDTO {

    private long totalPuntosOtorgados;
    private long totalPuntosAcumulados;
    private double promedioVecino;
    private String topCategoria;
    private double estimadoBolivianos;
}
