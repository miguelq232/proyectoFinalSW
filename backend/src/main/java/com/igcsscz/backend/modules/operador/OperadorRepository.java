package com.igcsscz.backend.modules.operador;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OperadorRepository extends JpaRepository<Operador, Long> {

    @Query(
            """
            SELECT o FROM Operador o
            WHERE NOT EXISTS (SELECT 1 FROM Camion c WHERE c.operador = o)
            ORDER BY o.apellido, o.nombre
            """)
    List<Operador> findOperadoresSinCamion();
}
