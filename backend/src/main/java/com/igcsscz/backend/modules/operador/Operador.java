package com.igcsscz.backend.modules.operador;

import com.igcsscz.backend.modules.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("OPERADOR")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Operador extends Usuario {

    @Column(length = 64)
    private String licencia;

    @Column(length = 64)
    private String turno;
}
