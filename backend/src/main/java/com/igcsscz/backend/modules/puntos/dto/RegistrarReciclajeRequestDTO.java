package com.igcsscz.backend.modules.puntos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarReciclajeRequestDTO {

    private String codigoCliente;
    private Integer puntos;
    private String clasificacion;
    private String sessionToken;
}
