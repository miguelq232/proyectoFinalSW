package com.igcsscz.backend.modules.reportes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportePuntosCategoriaDTO {

    private String categoria;
    private long totalPuntos;
    private long totalDepositos;
}
