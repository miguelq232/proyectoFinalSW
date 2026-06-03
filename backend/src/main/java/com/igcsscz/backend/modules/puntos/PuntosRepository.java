package com.igcsscz.backend.modules.puntos;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PuntosRepository extends JpaRepository<Puntos, Long> {

    List<Puntos> findByVecinoIdOrderByFechaDesc(Long vecinoId);

    @Query("SELECT COALESCE(SUM(p.puntosOtorgados), 0) FROM Puntos p WHERE p.vecino.id = :vecinoId")
    Integer sumPuntosOtorgadosByVecinoId(@Param("vecinoId") Long vecinoId);
}
