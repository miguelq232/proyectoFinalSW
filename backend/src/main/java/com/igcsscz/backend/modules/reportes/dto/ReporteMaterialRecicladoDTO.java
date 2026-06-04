package com.igcsscz.backend.modules.reportes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteMaterialRecicladoDTO {

    private String categoria;
    private double totalUnidades;
    private double pesoEstimadoKg;
    private double co2EvitadoKg;
}
