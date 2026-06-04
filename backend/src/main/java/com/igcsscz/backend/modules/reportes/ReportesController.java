package com.igcsscz.backend.modules.reportes;

import com.igcsscz.backend.modules.reportes.dto.ReporteCantidadEstadoDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteCantidadRolDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteCoberturaServicioDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteComparativaMensualDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteDistribucionPuntosDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteMaterialRecicladoDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteNuevosRegistrosMesDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteOperadorSinCamionDTO;
import com.igcsscz.backend.modules.reportes.dto.ReportePuntosCategoriaDTO;
import com.igcsscz.backend.modules.reportes.dto.ReportePuntosDiaDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteResumenDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteResumenIncentivosDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteRoiDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteTasaReciclajeZonaDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteTopVecinoDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteVecinoInactivoDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteVecinosPorZonaDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteZonaSinCamionDTO;
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

    @GetMapping("/puntos-por-categoria")
    public ResponseEntity<List<ReportePuntosCategoriaDTO>> getPuntosPorCategoria() {
        return ResponseEntity.ok(reportesService.getPuntosPorCategoria());
    }

    @GetMapping("/top-vecinos")
    public ResponseEntity<List<ReporteTopVecinoDTO>> getTopVecinos() {
        return ResponseEntity.ok(reportesService.getTopVecinos());
    }

    @GetMapping("/puntos-por-dia")
    public ResponseEntity<List<ReportePuntosDiaDTO>> getPuntosPorDia() {
        return ResponseEntity.ok(reportesService.getPuntosPorDia());
    }

    @GetMapping("/material-reciclado")
    public ResponseEntity<List<ReporteMaterialRecicladoDTO>> getMaterialReciclado() {
        return ResponseEntity.ok(reportesService.getMaterialReciclado());
    }

    @GetMapping("/tasa-reciclaje-zona")
    public ResponseEntity<List<ReporteTasaReciclajeZonaDTO>> getTasaReciclajeZona() {
        return ResponseEntity.ok(reportesService.getTasaReciclajeZona());
    }

    @GetMapping("/comparativa-mensual")
    public ResponseEntity<List<ReporteComparativaMensualDTO>> getComparativaMensual() {
        return ResponseEntity.ok(reportesService.getComparativaMensual());
    }

    @GetMapping("/cobertura-servicio")
    public ResponseEntity<ReporteCoberturaServicioDTO> getCoberturaServicio() {
        return ResponseEntity.ok(reportesService.getCoberturaServicio());
    }

    @GetMapping("/vecinos-inactivos")
    public ResponseEntity<List<ReporteVecinoInactivoDTO>> getVecinosInactivos() {
        return ResponseEntity.ok(reportesService.getVecinosInactivos());
    }

    @GetMapping("/nuevos-registros-mes")
    public ResponseEntity<List<ReporteNuevosRegistrosMesDTO>> getNuevosRegistrosMes() {
        return ResponseEntity.ok(reportesService.getNuevosRegistrosMes());
    }

    @GetMapping("/distribucion-puntos")
    public ResponseEntity<List<ReporteDistribucionPuntosDTO>> getDistribucionPuntos() {
        return ResponseEntity.ok(reportesService.getDistribucionPuntos());
    }

    @GetMapping("/zonas-sin-camion")
    public ResponseEntity<List<ReporteZonaSinCamionDTO>> getZonasSinCamion() {
        return ResponseEntity.ok(reportesService.getZonasSinCamion());
    }

    @GetMapping("/operadores-sin-camion")
    public ResponseEntity<List<ReporteOperadorSinCamionDTO>> getOperadoresSinCamion() {
        return ResponseEntity.ok(reportesService.getOperadoresSinCamion());
    }

    @GetMapping("/resumen-incentivos")
    public ResponseEntity<ReporteResumenIncentivosDTO> getResumenIncentivos() {
        return ResponseEntity.ok(reportesService.getResumenIncentivos());
    }

    @GetMapping("/roi")
    public ResponseEntity<ReporteRoiDTO> getRoi() {
        return ResponseEntity.ok(reportesService.getRoi());
    }
}
