package com.igcsscz.backend.modules.reportes.dto;

import com.igcsscz.backend.modules.usuario.RolEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteCantidadRolDTO {

    private RolEnum rol;
    private long cantidad;
}
