package com.igcsscz.backend.modules.usuario;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("ADMINISTRADOR")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class Administrador extends Usuario {}
