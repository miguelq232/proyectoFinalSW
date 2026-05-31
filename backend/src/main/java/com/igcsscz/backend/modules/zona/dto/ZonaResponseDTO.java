package com.igcsscz.backend.modules.zona.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ZonaResponseDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private Double latitudCentro;
    private Double longitudCentro;
    private Double radioKm;
    private boolean activa;
    private int cantidadVecinos;
    private int cantidadCamiones;
}
