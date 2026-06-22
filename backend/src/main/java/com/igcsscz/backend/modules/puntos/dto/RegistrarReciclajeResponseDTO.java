package com.igcsscz.backend.modules.puntos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarReciclajeResponseDTO {

    private Integer puntosAcumulados;
    private String nombreVecino;
}
