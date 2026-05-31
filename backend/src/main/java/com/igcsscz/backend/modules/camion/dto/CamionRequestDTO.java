package com.igcsscz.backend.modules.camion.dto;

import com.igcsscz.backend.modules.camion.EstadoCamionEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CamionRequestDTO {

    @NotBlank(message = "La placa es obligatoria")
    private String placa;

    private String modelo;

    @NotNull(message = "El año es obligatorio")
    private Integer anio;

    private String color;

    @NotNull(message = "El estado es obligatorio")
    private EstadoCamionEnum estado;

    private Long zonaId;

    private Long operadorId;
}
