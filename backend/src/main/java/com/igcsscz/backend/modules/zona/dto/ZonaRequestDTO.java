package com.igcsscz.backend.modules.zona.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ZonaRequestDTO {

    @NotBlank(message = "El nombre de la zona es obligatorio")
    private String nombre;

    private String descripcion;

    private Double latitudCentro;

    private Double longitudCentro;

    private Double radioKm;

    private Boolean activa = true;
}
