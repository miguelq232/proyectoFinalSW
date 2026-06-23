package com.igcsscz.backend.modules.recoleccion;

import com.igcsscz.backend.modules.recoleccion.dto.CamionQrResponseDTO;
import com.igcsscz.backend.modules.recoleccion.dto.IniciarRecoleccionRequestDTO;
import com.igcsscz.backend.modules.recoleccion.dto.RecoleccionEventoLcdDTO;
import com.igcsscz.backend.modules.recoleccion.dto.RecoleccionResumenDTO;
import com.igcsscz.backend.modules.recoleccion.dto.RecoleccionSesionResponseDTO;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recoleccion")
public class RecoleccionController {

    private final RecoleccionService recoleccionService;

    public RecoleccionController(RecoleccionService recoleccionService) {
        this.recoleccionService = recoleccionService;
    }

    @PostMapping("/camiones/{camionId}/qr")
    public ResponseEntity<CamionQrResponseDTO> generarQrCamion(@PathVariable Long camionId) {
        return ResponseEntity.ok(recoleccionService.generarQrCamion(camionId));
    }

    @GetMapping("/eventos-lcd")
    public ResponseEntity<List<RecoleccionEventoLcdDTO>> obtenerEventosLcd(
            @RequestParam(required = false) Long camionId,
            @RequestParam(required = false) Long afterId) {
        return ResponseEntity.ok(recoleccionService.obtenerEventosLcd(camionId, afterId));
    }

    @PostMapping("/sesiones")
    public ResponseEntity<RecoleccionSesionResponseDTO> iniciarSesion(
            Principal principal,
            @RequestBody IniciarRecoleccionRequestDTO request) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(recoleccionService.iniciarSesionVecino(principal.getName(), request.getQrPayload()));
    }

    @DeleteMapping("/sesiones/{sessionToken}")
    public ResponseEntity<RecoleccionResumenDTO> finalizarSesion(Principal principal, @PathVariable String sessionToken) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(recoleccionService.finalizarSesion(principal.getName(), sessionToken));
    }
}
