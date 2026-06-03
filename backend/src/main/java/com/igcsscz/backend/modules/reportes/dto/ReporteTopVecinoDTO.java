package com.igcsscz.backend.modules.reportes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteTopVecinoDTO {

    private String vecinoNombre;
    private String email;
    private int puntosAcumulados;
    private long totalDepositos;
}
