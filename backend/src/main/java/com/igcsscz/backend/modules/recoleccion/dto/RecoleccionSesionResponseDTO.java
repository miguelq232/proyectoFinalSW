package com.igcsscz.backend.modules.recoleccion.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecoleccionSesionResponseDTO {

    private String sessionToken;
    private Long camionId;
    private String placa;
    private Double distanciaMetros;
    private LocalDateTime expiresAt;
}
