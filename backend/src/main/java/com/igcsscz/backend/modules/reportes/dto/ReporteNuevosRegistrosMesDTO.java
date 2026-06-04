package com.igcsscz.backend.modules.reportes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteNuevosRegistrosMesDTO {

    private int mes;
    private int anio;
    private long cantidad;
}
