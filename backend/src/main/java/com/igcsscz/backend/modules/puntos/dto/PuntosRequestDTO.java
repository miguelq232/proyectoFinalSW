package com.igcsscz.backend.modules.puntos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PuntosRequestDTO {

    private String codigoQR;
    private String tipoResiduo;
    private Double cantidad;
    private Double pesoKg;
    private String descripcion;
}
