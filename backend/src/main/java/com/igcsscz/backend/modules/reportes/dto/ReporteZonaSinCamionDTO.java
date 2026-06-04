package com.igcsscz.backend.modules.reportes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteZonaSinCamionDTO {

    private Long id;
    private String nombre;
    private String descripcion;
}
