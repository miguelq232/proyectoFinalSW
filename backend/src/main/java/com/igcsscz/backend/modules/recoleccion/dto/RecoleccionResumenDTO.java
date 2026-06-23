package com.igcsscz.backend.modules.recoleccion.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecoleccionResumenDTO {

    private String sessionToken;
    private Long camionId;
    private String placa;
    private Integer totalItems;
    private Double totalCantidad;
    private Integer totalPuntos;
    private Double descuentoEstimadoBs;
    private List<RecoleccionItemResumenDTO> items;
}
