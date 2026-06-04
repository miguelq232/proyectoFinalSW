package com.igcsscz.backend.modules.puntos;

import java.time.LocalDateTime;
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

    @Query(
            "SELECT p.tipoResiduo, SUM(p.puntosOtorgados), COUNT(p) FROM Puntos p WHERE p.tipoResiduo IS NOT NULL GROUP BY p.tipoResiduo ORDER BY SUM(p.puntosOtorgados) DESC")
    List<Object[]> sumPuntosGroupByTipoResiduo();

    @Query(
            """
            SELECT CAST(p.fecha AS localdate), SUM(p.puntosOtorgados), COUNT(p)
            FROM Puntos p
            WHERE p.fecha >= :desde
            GROUP BY CAST(p.fecha AS localdate)
            ORDER BY CAST(p.fecha AS localdate)
            """)
    List<Object[]> sumPuntosGroupByDia(@Param("desde") LocalDateTime desde);

    @Query(
            """
            SELECT p.tipoResiduo, COALESCE(SUM(p.cantidad), 0), COUNT(p.id)
            FROM Puntos p
            WHERE p.tipoResiduo IS NOT NULL
            GROUP BY p.tipoResiduo
            ORDER BY p.tipoResiduo
            """)
    List<Object[]> sumMaterialGroupByTipoResiduo();

    @Query(
            value =
                    """
                    SELECT CAST(EXTRACT(YEAR FROM p.fecha) AS int),
                           CAST(EXTRACT(MONTH FROM p.fecha) AS int),
                           COALESCE(SUM(p.cantidad), 0),
                           COALESCE(SUM(p.puntos_otorgados), 0),
                           COUNT(DISTINCT p.vecino_id)
                    FROM puntos p
                    WHERE p.fecha >= :desde
                    GROUP BY EXTRACT(YEAR FROM p.fecha), EXTRACT(MONTH FROM p.fecha)
                    ORDER BY 1, 2
                    """,
            nativeQuery = true)
    List<Object[]> sumComparativaMensual(@Param("desde") LocalDateTime desde);

    @Query("SELECT COALESCE(SUM(p.puntosOtorgados), 0) FROM Puntos p")
    Long sumTotalPuntosOtorgados();

    @Query(
            """
            SELECT p.tipoResiduo, COALESCE(SUM(p.puntosOtorgados), 0)
            FROM Puntos p
            WHERE p.tipoResiduo IS NOT NULL
            GROUP BY p.tipoResiduo
            ORDER BY SUM(p.puntosOtorgados) DESC
            """)
    List<Object[]> sumPuntosOtorgadosGroupByTipo();
}
