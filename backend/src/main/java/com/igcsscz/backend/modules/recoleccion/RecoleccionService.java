package com.igcsscz.backend.modules.recoleccion;

import com.igcsscz.backend.modules.camion.Camion;
import com.igcsscz.backend.modules.camion.CamionRepository;
import com.igcsscz.backend.modules.gps.GpsService;
import com.igcsscz.backend.modules.recoleccion.dto.CamionQrResponseDTO;
import com.igcsscz.backend.modules.recoleccion.dto.RecoleccionEventoLcdDTO;
import com.igcsscz.backend.modules.recoleccion.dto.RecoleccionItemResumenDTO;
import com.igcsscz.backend.modules.recoleccion.dto.RecoleccionResumenDTO;
import com.igcsscz.backend.modules.recoleccion.dto.RecoleccionSesionResponseDTO;
import com.igcsscz.backend.modules.vecino.Vecino;
import com.igcsscz.backend.modules.vecino.VecinoRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RecoleccionService {

    private static final String QR_PREFIX = "IGCS-CAMION";
    private static final double VALOR_PUNTO_BS = 0.10;
    private static final int MAX_EVENTOS_LCD = 100;

    private record QrToken(Long camionId, LocalDateTime expiresAt) {}

    private record SesionRecoleccion(Long vecinoId, Long camionId, LocalDateTime expiresAt) {}

    private static class RecoleccionItem {
        private final String tipoResiduo;
        private double cantidad;
        private int puntos;

        private RecoleccionItem(String tipoResiduo) {
            this.tipoResiduo = tipoResiduo;
        }
    }

    private final CamionRepository camionRepository;
    private final VecinoRepository vecinoRepository;
    private final GpsService gpsService;
    private final ConcurrentHashMap<String, QrToken> qrTokens = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, SesionRecoleccion> sesiones = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Map<String, RecoleccionItem>> resumenes = new ConcurrentHashMap<>();
    private final List<RecoleccionEventoLcdDTO> eventosLcd = new ArrayList<>();
    private long siguienteEventoLcdId = 1L;

    public RecoleccionService(
            CamionRepository camionRepository,
            VecinoRepository vecinoRepository,
            GpsService gpsService) {
        this.camionRepository = camionRepository;
        this.vecinoRepository = vecinoRepository;
        this.gpsService = gpsService;
    }

    public CamionQrResponseDTO generarQrCamion(Long camionId) {
        Camion camion = camionRepository.findById(camionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Camion no encontrado"));

        limpiarExpirados();

        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(2);
        qrTokens.put(token, new QrToken(camionId, expiresAt));

        String payload = QR_PREFIX + "|" + camionId + "|" + token;
        return new CamionQrResponseDTO(camionId, camion.getPlaca(), payload, expiresAt);
    }

    public RecoleccionSesionResponseDTO iniciarSesionVecino(String email, String qrPayload) {
        if (qrPayload == null || qrPayload.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El QR del camion es obligatorio");
        }

        limpiarExpirados();

        ParsedQr parsed = parseQr(qrPayload.trim());
        QrToken qrToken = qrTokens.get(parsed.token());
        if (qrToken == null || qrToken.expiresAt().isBefore(LocalDateTime.now()) ||
                !qrToken.camionId().equals(parsed.camionId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El QR del camion expiro. Solicita un nuevo QR");
        }

        Vecino vecino = buscarVecinoPorEmail(email);
        Double distancia = gpsService.calcularDistanciaCamionVecino(parsed.camionId(), email);
        if (distancia == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El camion aun no transmite GPS en vivo");
        }

        Camion camion = camionRepository.findById(parsed.camionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Camion no encontrado"));

        String sessionToken = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(20);
        sesiones.put(sessionToken, new SesionRecoleccion(vecino.getId(), parsed.camionId(), expiresAt));
        resumenes.put(sessionToken, new LinkedHashMap<>());

        return new RecoleccionSesionResponseDTO(
                sessionToken,
                parsed.camionId(),
                camion.getPlaca(),
                distancia,
                expiresAt);
    }

    public void validarSesion(String codigoCliente, String sessionToken) {
        if (sessionToken == null || sessionToken.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Escanea primero el QR dinamico del camion para activar la camara");
        }

        Long vecinoId = resolverVecinoId(codigoCliente)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vecino no encontrado"));

        SesionRecoleccion sesion = sesiones.get(sessionToken.trim());
        if (sesion == null || sesion.expiresAt().isBefore(LocalDateTime.now()) || !sesion.vecinoId().equals(vecinoId)) {
            sesiones.remove(sessionToken.trim());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La sesion de recoleccion expiro o no corresponde al vecino");
        }
    }

    public void registrarItemSesion(String sessionToken, String tipoResiduo, Double cantidad, Integer puntos) {
        if (sessionToken == null || sessionToken.isBlank()) {
            return;
        }

        SesionRecoleccion sesion = sesiones.get(sessionToken.trim());
        if (sesion == null || sesion.expiresAt().isBefore(LocalDateTime.now())) {
            return;
        }

        Map<String, RecoleccionItem> resumen = resumenes.computeIfAbsent(sessionToken.trim(), ignored -> new LinkedHashMap<>());
        String tipo = tipoResiduo != null && !tipoResiduo.isBlank() ? tipoResiduo.trim().toUpperCase() : "NADA";
        RecoleccionItem item = resumen.computeIfAbsent(tipo, RecoleccionItem::new);
        item.cantidad += cantidad != null && cantidad > 0 ? cantidad : 1.0;
        item.puntos += puntos != null ? puntos : 0;

        registrarEventoLcd(sesion.camionId(), tipo, puntos != null ? puntos : 0);
    }

    public synchronized List<RecoleccionEventoLcdDTO> obtenerEventosLcd(Long camionId, Long afterId) {
        long desde = afterId != null ? afterId : 0L;
        return eventosLcd.stream()
                .filter(evento -> evento.getId() > desde)
                .filter(evento -> camionId == null || camionId.equals(evento.getCamionId()))
                .toList();
    }

    public RecoleccionResumenDTO finalizarSesion(String email, String sessionToken) {
        if (sessionToken == null || sessionToken.isBlank()) {
            return resumenVacio(null, null);
        }

        Vecino vecino = buscarVecinoPorEmail(email);
        String token = sessionToken.trim();
        SesionRecoleccion sesion = sesiones.get(token);
        if (sesion != null && sesion.vecinoId().equals(vecino.getId())) {
            sesiones.remove(token);
            return construirResumen(token, sesion);
        }

        return resumenVacio(token, null);
    }

    private RecoleccionResumenDTO construirResumen(String sessionToken, SesionRecoleccion sesion) {
        Map<String, RecoleccionItem> resumen = resumenes.remove(sessionToken);
        List<RecoleccionItemResumenDTO> items = new ArrayList<>();
        int totalItems = 0;
        double totalCantidad = 0.0;
        int totalPuntos = 0;

        if (resumen != null) {
            for (RecoleccionItem item : resumen.values()) {
                totalItems += 1;
                totalCantidad += item.cantidad;
                totalPuntos += item.puntos;
                items.add(new RecoleccionItemResumenDTO(item.tipoResiduo, item.cantidad, item.puntos));
            }
        }

        Camion camion = camionRepository.findById(sesion.camionId()).orElse(null);
        return new RecoleccionResumenDTO(
                sessionToken,
                sesion.camionId(),
                camion != null ? camion.getPlaca() : null,
                totalItems,
                totalCantidad,
                totalPuntos,
                redondearDosDecimales(totalPuntos * VALOR_PUNTO_BS),
                items);
    }

    private RecoleccionResumenDTO resumenVacio(String sessionToken, Long camionId) {
        return new RecoleccionResumenDTO(sessionToken, camionId, null, 0, 0.0, 0, 0.0, List.of());
    }

    private double redondearDosDecimales(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }

    private synchronized void registrarEventoLcd(Long camionId, String tipoResiduo, Integer puntos) {
        Camion camion = camionRepository.findById(camionId).orElse(null);
        eventosLcd.add(new RecoleccionEventoLcdDTO(
                siguienteEventoLcdId++,
                camionId,
                camion != null ? camion.getPlaca() : null,
                tipoResiduo,
                puntos != null ? puntos : 0,
                LocalDateTime.now()));

        if (eventosLcd.size() > MAX_EVENTOS_LCD) {
            eventosLcd.subList(0, eventosLcd.size() - MAX_EVENTOS_LCD).clear();
        }
    }

    private Vecino buscarVecinoPorEmail(String email) {
        return vecinoRepository.findByEmailIgnoreCase(email == null ? "" : email.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vecino no encontrado"));
    }

    private Optional<Long> resolverVecinoId(String codigoCliente) {
        if (codigoCliente == null || codigoCliente.isBlank()) {
            return Optional.empty();
        }

        String codigo = codigoCliente.trim();
        Optional<Vecino> porQr = vecinoRepository.findByCodigoQR(codigo);
        if (porQr.isPresent()) {
            return porQr.map(Vecino::getId);
        }

        if (codigo.startsWith("VEC-") && codigo.endsWith("-IGCS")) {
            try {
                return Optional.of(Long.parseLong(codigo.substring(4, codigo.length() - 5)));
            } catch (NumberFormatException ignored) {
                return Optional.empty();
            }
        }

        try {
            return Optional.of(Long.parseLong(codigo));
        } catch (NumberFormatException ignored) {
            return Optional.empty();
        }
    }

    private ParsedQr parseQr(String qrPayload) {
        String[] parts = qrPayload.split("\\|");
        if (parts.length != 3 || !QR_PREFIX.equals(parts[0])) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR de camion invalido");
        }

        try {
            return new ParsedQr(Long.parseLong(parts[1]), parts[2]);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR de camion invalido");
        }
    }

    private void limpiarExpirados() {
        LocalDateTime now = LocalDateTime.now();
        qrTokens.entrySet().removeIf(entry -> entry.getValue().expiresAt().isBefore(now));
        sesiones.entrySet().removeIf(entry -> {
            boolean expirada = entry.getValue().expiresAt().isBefore(now);
            if (expirada) {
                resumenes.remove(entry.getKey());
            }
            return expirada;
        });
    }

    private record ParsedQr(Long camionId, String token) {}
}
