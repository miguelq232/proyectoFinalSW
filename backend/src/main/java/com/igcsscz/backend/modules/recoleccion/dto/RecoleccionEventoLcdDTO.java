package com.igcsscz.backend.modules.recoleccion.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecoleccionEventoLcdDTO {

    private Long id;
    private Long camionId;
    private String placa;
    private String tipoResiduo;
    private Integer puntos;
    private LocalDateTime fecha;
}
