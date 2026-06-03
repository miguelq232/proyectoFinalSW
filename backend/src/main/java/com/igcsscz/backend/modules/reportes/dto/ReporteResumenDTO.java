package com.igcsscz.backend.modules.reportes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteResumenDTO {

    private long totalUsuarios;
    private long totalVecinos;
    private long totalOperadores;
    private long totalCamiones;
    private long camionesActivos;
    private long totalZonas;
    private long zonasActivas;
}
