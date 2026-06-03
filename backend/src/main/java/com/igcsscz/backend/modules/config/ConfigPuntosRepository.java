package com.igcsscz.backend.modules.config;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfigPuntosRepository extends JpaRepository<ConfigPuntos, Long> {

    Optional<ConfigPuntos> findByCategoria(String categoria);

    List<ConfigPuntos> findByActivoTrue();
}
