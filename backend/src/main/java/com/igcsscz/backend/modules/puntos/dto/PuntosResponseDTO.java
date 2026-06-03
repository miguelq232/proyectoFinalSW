package com.igcsscz.backend.modules.puntos.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PuntosResponseDTO {

    private Long id;
    private Long vecinoId;
    private String vecinoNombre;
    private String tipoResiduo;
    private Double cantidad;
    private Integer puntosOtorgados;
    private LocalDateTime fecha;
    private String descripcion;
}
