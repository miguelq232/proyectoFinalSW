package com.igcsscz.backend.modules.reportes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteCoberturaServicioDTO {

    private long totalVecinos;
    private long conZona;
    private long sinZona;
    private long conUbicacion;
    private long sinUbicacion;
    private double porcentajeCobertura;
}
