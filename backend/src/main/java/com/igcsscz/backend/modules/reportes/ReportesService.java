package com.igcsscz.backend.modules.reportes;

import com.igcsscz.backend.modules.camion.CamionRepository;
import com.igcsscz.backend.modules.camion.EstadoCamionEnum;
import com.igcsscz.backend.modules.puntos.PuntosRepository;
import com.igcsscz.backend.modules.reportes.dto.ReporteCantidadEstadoDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteCantidadRolDTO;
import com.igcsscz.backend.modules.reportes.dto.ReportePuntosCategoriaDTO;
import com.igcsscz.backend.modules.reportes.dto.ReportePuntosDiaDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteResumenDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteTopVecinoDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteVecinosPorZonaDTO;
import com.igcsscz.backend.modules.usuario.RolEnum;
import com.igcsscz.backend.modules.usuario.UsuarioRepository;
import com.igcsscz.backend.modules.vecino.VecinoRepository;
import com.igcsscz.backend.modules.zona.ZonaRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class ReportesService {

    private final UsuarioRepository usuarioRepository;
    private final CamionRepository camionRepository;
    private final ZonaRepository zonaRepository;
    private final VecinoRepository vecinoRepository;
    private final PuntosRepository puntosRepository;

    public ReportesService(
            UsuarioRepository usuarioRepository,
            CamionRepository camionRepository,
            ZonaRepository zonaRepository,
            VecinoRepository vecinoRepository,
            PuntosRepository puntosRepository) {
        this.usuarioRepository = usuarioRepository;
        this.camionRepository = camionRepository;
        this.zonaRepository = zonaRepository;
        this.vecinoRepository = vecinoRepository;
        this.puntosRepository = puntosRepository;
    }

    public ReporteResumenDTO getResumen() {
        return new ReporteResumenDTO(
                usuarioRepository.count(),
                usuarioRepository.countByRol(RolEnum.VECINO),
                usuarioRepository.countByRol(RolEnum.OPERADOR),
                camionRepository.count(),
                camionRepository.countByEstado(EstadoCamionEnum.ACTIVO),
                zonaRepository.count(),
                zonaRepository.countByActivaTrue());
    }

    public List<ReporteCantidadRolDTO> getUsuariosPorRol() {
        return Arrays.stream(RolEnum.values())
                .map(rol -> new ReporteCantidadRolDTO(rol, usuarioRepository.countByRol(rol)))
                .toList();
    }

    public List<ReporteCantidadEstadoDTO> getCamionesPorEstado() {
        return Arrays.stream(EstadoCamionEnum.values())
                .map(estado -> new ReporteCantidadEstadoDTO(estado, camionRepository.countByEstado(estado)))
                .toList();
    }

    public List<ReporteVecinosPorZonaDTO> getVecinosPorZona() {
        return vecinoRepository.countVecinosGroupByZona().stream()
                .map(row -> new ReporteVecinosPorZonaDTO((String) row[0], (Long) row[1]))
                .toList();
    }

    public List<ReportePuntosCategoriaDTO> getPuntosPorCategoria() {
        return puntosRepository.sumPuntosGroupByTipoResiduo().stream()
                .map(row -> new ReportePuntosCategoriaDTO(
                        (String) row[0],
                        toLong(row[1]),
                        toLong(row[2])))
                .toList();
    }

    public List<ReporteTopVecinoDTO> getTopVecinos() {
        return vecinoRepository.findTopVecinosPorPuntos(PageRequest.of(0, 10)).stream()
                .map(row -> new ReporteTopVecinoDTO(
                        (String) row[0],
                        (String) row[1],
                        toInt(row[2]),
                        toLong(row[3])))
                .toList();
    }

    public List<ReportePuntosDiaDTO> getPuntosPorDia() {
        LocalDateTime desde = LocalDateTime.now().minusDays(30);
        return puntosRepository.sumPuntosGroupByDia(desde).stream()
                .map(row -> new ReportePuntosDiaDTO(toLocalDate(row[0]), toLong(row[1]), toLong(row[2])))
                .toList();
    }

    private long toLong(Object value) {
        if (value == null) {
            return 0L;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(value.toString());
    }

    private int toInt(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.parseInt(value.toString());
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        if (value instanceof java.sql.Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        return LocalDate.parse(value.toString());
    }
}
