package com.igcsscz.backend.modules.reportes;

import com.igcsscz.backend.modules.camion.CamionRepository;
import com.igcsscz.backend.modules.camion.EstadoCamionEnum;
import com.igcsscz.backend.modules.reportes.dto.ReporteCantidadEstadoDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteCantidadRolDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteResumenDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteVecinosPorZonaDTO;
import com.igcsscz.backend.modules.usuario.RolEnum;
import com.igcsscz.backend.modules.usuario.UsuarioRepository;
import com.igcsscz.backend.modules.vecino.VecinoRepository;
import com.igcsscz.backend.modules.zona.ZonaRepository;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ReportesService {

    private final UsuarioRepository usuarioRepository;
    private final CamionRepository camionRepository;
    private final ZonaRepository zonaRepository;
    private final VecinoRepository vecinoRepository;

    public ReportesService(
            UsuarioRepository usuarioRepository,
            CamionRepository camionRepository,
            ZonaRepository zonaRepository,
            VecinoRepository vecinoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.camionRepository = camionRepository;
        this.zonaRepository = zonaRepository;
        this.vecinoRepository = vecinoRepository;
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
}
