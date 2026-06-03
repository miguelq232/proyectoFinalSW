package com.igcsscz.backend.modules.reportes.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportePuntosDiaDTO {

    private LocalDate fecha;
    private long totalPuntos;
    private long totalDepositos;
}
