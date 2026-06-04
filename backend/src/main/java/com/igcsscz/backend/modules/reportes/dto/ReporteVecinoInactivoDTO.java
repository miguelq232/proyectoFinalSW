package com.igcsscz.backend.modules.reportes.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteVecinoInactivoDTO {

    private String nombre;
    private String email;
    private String zonaNombre;
    private LocalDateTime ultimoDeposito;
}
