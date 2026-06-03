package com.igcsscz.backend.modules.reportes.dto;

import com.igcsscz.backend.modules.camion.EstadoCamionEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteCantidadEstadoDTO {

    private EstadoCamionEnum estado;
    private long cantidad;
}
