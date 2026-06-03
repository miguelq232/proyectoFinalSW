package com.igcsscz.backend.modules.reportes;

import com.igcsscz.backend.modules.reportes.dto.ReporteCantidadEstadoDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteCantidadRolDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteResumenDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteVecinosPorZonaDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reportes")
public class ReportesController {

    private final ReportesService reportesService;

    public ReportesController(ReportesService reportesService) {
        this.reportesService = reportesService;
    }

    @GetMapping("/resumen")
    public ResponseEntity<ReporteResumenDTO> getResumen() {
        return ResponseEntity.ok(reportesService.getResumen());
    }

    @GetMapping("/usuarios-por-rol")
    public ResponseEntity<List<ReporteCantidadRolDTO>> getUsuariosPorRol() {
        return ResponseEntity.ok(reportesService.getUsuariosPorRol());
    }

    @GetMapping("/camiones-por-estado")
    public ResponseEntity<List<ReporteCantidadEstadoDTO>> getCamionesPorEstado() {
        return ResponseEntity.ok(reportesService.getCamionesPorEstado());
    }

    @GetMapping("/vecinos-por-zona")
    public ResponseEntity<List<ReporteVecinosPorZonaDTO>> getVecinosPorZona() {
        return ResponseEntity.ok(reportesService.getVecinosPorZona());
    }
}
