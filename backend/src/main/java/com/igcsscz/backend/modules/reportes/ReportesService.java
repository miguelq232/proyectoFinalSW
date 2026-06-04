package com.igcsscz.backend.modules.reportes;

import com.igcsscz.backend.modules.camion.CamionRepository;
import com.igcsscz.backend.modules.camion.EstadoCamionEnum;
import com.igcsscz.backend.modules.config.ConfigPuntos;
import com.igcsscz.backend.modules.config.ConfigPuntosRepository;
import com.igcsscz.backend.modules.operador.Operador;
import com.igcsscz.backend.modules.operador.OperadorRepository;
import com.igcsscz.backend.modules.puntos.PuntosRepository;
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
import com.igcsscz.backend.modules.reportes.dto.ReporteRoiCategoriaDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteRoiDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteTasaReciclajeZonaDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteTopVecinoDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteVecinoInactivoDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteVecinosPorZonaDTO;
import com.igcsscz.backend.modules.reportes.dto.ReporteZonaSinCamionDTO;
import com.igcsscz.backend.modules.usuario.RolEnum;
import com.igcsscz.backend.modules.usuario.UsuarioRepository;
import com.igcsscz.backend.modules.vecino.VecinoRepository;
import com.igcsscz.backend.modules.zona.Zona;
import com.igcsscz.backend.modules.zona.ZonaRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class ReportesService {

    private static final Map<String, Double> PESO_KG_POR_UNIDAD = Map.of(
            "GLASS", 0.3,
            "METAL", 0.1,
            "PAPER", 0.05,
            "PET", 0.025,
            "PLASTIC", 0.03);

    private static final Map<String, Double> CO2_KG_POR_KG_RECICLADO = Map.of(
            "GLASS", 0.3,
            "METAL", 1.8,
            "PAPER", 1.1,
            "PET", 1.5,
            "PLASTIC", 1.5);

    private static final String[] RANGOS_PUNTOS = {"0pts", "1-50", "51-100", "101-500", "501+"};

    private static final double VALOR_PUNTO_BS = 0.10;

    private final UsuarioRepository usuarioRepository;
    private final CamionRepository camionRepository;
    private final ZonaRepository zonaRepository;
    private final VecinoRepository vecinoRepository;
    private final PuntosRepository puntosRepository;
    private final OperadorRepository operadorRepository;
    private final ConfigPuntosRepository configPuntosRepository;

    public ReportesService(
            UsuarioRepository usuarioRepository,
            CamionRepository camionRepository,
            ZonaRepository zonaRepository,
            VecinoRepository vecinoRepository,
            PuntosRepository puntosRepository,
            OperadorRepository operadorRepository,
            ConfigPuntosRepository configPuntosRepository) {
        this.usuarioRepository = usuarioRepository;
        this.camionRepository = camionRepository;
        this.zonaRepository = zonaRepository;
        this.vecinoRepository = vecinoRepository;
        this.puntosRepository = puntosRepository;
        this.operadorRepository = operadorRepository;
        this.configPuntosRepository = configPuntosRepository;
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

    public List<ReporteMaterialRecicladoDTO> getMaterialReciclado() {
        return puntosRepository.sumMaterialGroupByTipoResiduo().stream()
                .map(row -> {
                    String categoria = normalizarCategoria((String) row[0]);
                    double totalUnidades = toDouble(row[1]);
                    double pesoPorUnidad = PESO_KG_POR_UNIDAD.getOrDefault(categoria, 0.0);
                    double co2PorKg = CO2_KG_POR_KG_RECICLADO.getOrDefault(categoria, 0.0);
                    double pesoEstimadoKg = totalUnidades * pesoPorUnidad;
                    double co2EvitadoKg = pesoEstimadoKg * co2PorKg;
                    return new ReporteMaterialRecicladoDTO(
                            categoria, totalUnidades, pesoEstimadoKg, co2EvitadoKg);
                })
                .toList();
    }

    public List<ReporteTasaReciclajeZonaDTO> getTasaReciclajeZona() {
        return vecinoRepository.findTasaReciclajePorZona().stream()
                .map(row -> {
                    long totalVecinos = toLong(row[1]);
                    long vecinosActivos = toLong(row[2]);
                    double tasa = totalVecinos > 0 ? (vecinosActivos * 100.0) / totalVecinos : 0.0;
                    return new ReporteTasaReciclajeZonaDTO(
                            (String) row[0], totalVecinos, vecinosActivos, redondearDosDecimales(tasa));
                })
                .toList();
    }

    public List<ReporteComparativaMensualDTO> getComparativaMensual() {
        return puntosRepository.sumComparativaMensual(inicioUltimosSeisMeses()).stream()
                .map(row -> new ReporteComparativaMensualDTO(
                        toInt(row[1]),
                        toInt(row[0]),
                        toDouble(row[2]),
                        toLong(row[3]),
                        toLong(row[4])))
                .toList();
    }

    public ReporteCoberturaServicioDTO getCoberturaServicio() {
        long total = vecinoRepository.count();
        long conZona = vecinoRepository.countByZonaIsNotNull();
        long conUbicacion = vecinoRepository.countConUbicacion();
        long sinZona = total - conZona;
        long sinUbicacion = total - conUbicacion;
        double porcentaje = total > 0 ? (conZona * 100.0) / total : 0.0;
        return new ReporteCoberturaServicioDTO(
                total,
                conZona,
                sinZona,
                conUbicacion,
                sinUbicacion,
                redondearDosDecimales(porcentaje));
    }

    public List<ReporteVecinoInactivoDTO> getVecinosInactivos() {
        LocalDateTime desde = LocalDateTime.now().minusDays(30);
        return vecinoRepository.findVecinosInactivos(desde).stream()
                .map(row -> new ReporteVecinoInactivoDTO(
                        (String) row[0],
                        (String) row[1],
                        (String) row[2],
                        toLocalDateTime(row[3])))
                .toList();
    }

    public List<ReporteNuevosRegistrosMesDTO> getNuevosRegistrosMes() {
        return vecinoRepository.countNuevosRegistrosPorMes(inicioUltimosSeisMeses()).stream()
                .map(row -> new ReporteNuevosRegistrosMesDTO(toInt(row[1]), toInt(row[0]), toLong(row[2])))
                .toList();
    }

    public List<ReporteDistribucionPuntosDTO> getDistribucionPuntos() {
        List<Object[]> rows = vecinoRepository.countDistribucionPuntos();
        if (rows.isEmpty()) {
            return Arrays.stream(RANGOS_PUNTOS)
                    .map(r -> new ReporteDistribucionPuntosDTO(r, 0L))
                    .toList();
        }
        Object[] counts = rows.get(0);
        List<ReporteDistribucionPuntosDTO> resultado = new java.util.ArrayList<>();
        for (int i = 0; i < RANGOS_PUNTOS.length; i++) {
            resultado.add(new ReporteDistribucionPuntosDTO(RANGOS_PUNTOS[i], toLong(counts[i])));
        }
        return resultado;
    }

    public List<ReporteZonaSinCamionDTO> getZonasSinCamion() {
        return zonaRepository.findZonasSinCamionActivo(EstadoCamionEnum.ACTIVO).stream()
                .map(this::toZonaSinCamionDTO)
                .toList();
    }

    public List<ReporteOperadorSinCamionDTO> getOperadoresSinCamion() {
        return operadorRepository.findOperadoresSinCamion().stream()
                .map(this::toOperadorSinCamionDTO)
                .toList();
    }

    public ReporteResumenIncentivosDTO getResumenIncentivos() {
        long totalOtorgados = toLong(puntosRepository.sumTotalPuntosOtorgados());
        long totalAcumulados = toLong(vecinoRepository.sumPuntosAcumulados());
        long totalVecinos = vecinoRepository.count();
        double promedio = totalVecinos > 0 ? (double) totalAcumulados / totalVecinos : 0.0;

        String topCategoria = puntosRepository.sumPuntosOtorgadosGroupByTipo().stream()
                .findFirst()
                .map(row -> normalizarCategoria((String) row[0]))
                .orElse("—");

        double estimadoBolivianos = totalAcumulados * VALOR_PUNTO_BS;

        return new ReporteResumenIncentivosDTO(
                totalOtorgados,
                totalAcumulados,
                redondearDosDecimales(promedio),
                topCategoria,
                redondearDosDecimales(estimadoBolivianos));
    }

    public ReporteRoiDTO getRoi() {
        Map<String, Double> unidadesPorCategoria = new HashMap<>();
        Map<String, Long> puntosOtorgadosPorCategoria = new HashMap<>();

        puntosRepository.sumMaterialGroupByTipoResiduo().forEach(row -> {
            String categoria = normalizarCategoria((String) row[0]);
            unidadesPorCategoria.put(categoria, toDouble(row[1]));
        });

        puntosRepository.sumPuntosGroupByTipoResiduo().forEach(row -> {
            String categoria = normalizarCategoria((String) row[0]);
            puntosOtorgadosPorCategoria.put(categoria, toLong(row[1]));
        });

        List<ReporteRoiCategoriaDTO> porCategoria = new ArrayList<>();
        double totalIngresoBs = 0;
        double totalCostoBs = 0;

        for (ConfigPuntos config : configPuntosRepository.findAll()) {
            String categoria = normalizarCategoria(config.getCategoria());
            double unidades = unidadesPorCategoria.getOrDefault(categoria, 0.0);
            double pesoPorUnidad = PESO_KG_POR_UNIDAD.getOrDefault(categoria, 0.0);
            double kgReciclados = unidades * pesoPorUnidad;
            long puntosOtorgados = puntosOtorgadosPorCategoria.getOrDefault(categoria, 0L);

            double precioBsKg = config.getPrecioBsKg() != null ? config.getPrecioBsKg() : 0.0;
            double metaMensualKg = config.getMetaMensualKg() != null ? config.getMetaMensualKg() : 0.0;

            double ingresoEstimadoBs = kgReciclados * precioBsKg;
            double costoIncentivos = puntosOtorgados * VALOR_PUNTO_BS;
            double roi = ingresoEstimadoBs - costoIncentivos;
            double cumplimiento =
                    metaMensualKg > 0 ? Math.min((kgReciclados / metaMensualKg) * 100.0, 100.0) : 0.0;

            porCategoria.add(new ReporteRoiCategoriaDTO(
                    categoria,
                    redondearDosDecimales(kgReciclados),
                    redondearDosDecimales(ingresoEstimadoBs),
                    redondearDosDecimales(costoIncentivos),
                    redondearDosDecimales(roi),
                    redondearDosDecimales(cumplimiento)));

            totalIngresoBs += ingresoEstimadoBs;
            totalCostoBs += costoIncentivos;
        }

        double roiTotal = totalIngresoBs - totalCostoBs;
        double roiPorcentaje = totalCostoBs > 0 ? (roiTotal / totalCostoBs) * 100.0 : 0.0;

        return new ReporteRoiDTO(
                porCategoria,
                redondearDosDecimales(totalIngresoBs),
                redondearDosDecimales(totalCostoBs),
                redondearDosDecimales(roiTotal),
                redondearDosDecimales(roiPorcentaje));
    }

    private ReporteZonaSinCamionDTO toZonaSinCamionDTO(Zona zona) {
        return new ReporteZonaSinCamionDTO(zona.getId(), zona.getNombre(), zona.getDescripcion());
    }

    private ReporteOperadorSinCamionDTO toOperadorSinCamionDTO(Operador operador) {
        return new ReporteOperadorSinCamionDTO(
                operador.getId(),
                operador.getNombre(),
                operador.getApellido(),
                operador.getEmail(),
                operador.getTelefono());
    }

    private LocalDateTime inicioUltimosSeisMeses() {
        return LocalDate.now().minusMonths(5).withDayOfMonth(1).atStartOfDay();
    }

    private String normalizarCategoria(String categoria) {
        return categoria == null ? "" : categoria.trim().toUpperCase();
    }

    private double redondearDosDecimales(double valor) {
        return Math.round(valor * 100.0) / 100.0;
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

    private double toDouble(Object value) {
        if (value == null) {
            return 0.0;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return Double.parseDouble(value.toString());
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

    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }
        if (value instanceof java.sql.Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        return LocalDateTime.parse(value.toString());
    }
}
