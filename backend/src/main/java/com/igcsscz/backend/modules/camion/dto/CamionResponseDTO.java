package com.igcsscz.backend.modules.camion.dto;

import com.igcsscz.backend.modules.camion.EstadoCamionEnum;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CamionResponseDTO {
    private Long id;
    private String placa;
    private String modelo;
    private Integer anio;
    private String color;
    private EstadoCamionEnum estado;
    private LocalDateTime fechaRegistro;
    
    private Long zonaId;
    private String zonaNombre;
    
    private Long operadorId;
    private String operadorNombre;
}
