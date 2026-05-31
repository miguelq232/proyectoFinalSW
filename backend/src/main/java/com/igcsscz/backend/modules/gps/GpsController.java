package com.igcsscz.backend.modules.gps;

import com.igcsscz.backend.modules.gps.dto.CamionUbicacionDTO;
import com.igcsscz.backend.modules.gps.dto.CercaniaResponseDTO;
import com.igcsscz.backend.modules.gps.dto.UbicacionRequestDTO;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/gps")
public class GpsController {

    private final GpsService gpsService;

    public GpsController(GpsService gpsService) {
        this.gpsService = gpsService;
    }

    @PostMapping("/actualizar")
    public ResponseEntity<Void> actualizarUbicacion(@Valid @RequestBody UbicacionRequestDTO request) {
        gpsService.actualizarUbicacion(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/camiones/vivo")
    public ResponseEntity<List<CamionUbicacionDTO>> obtenerUbicacionesVivas() {
        return ResponseEntity.ok(gpsService.obtenerUbicacionesVivas());
    }

    @GetMapping("/zona/{zonaId}/vivo")
    public ResponseEntity<List<CamionUbicacionDTO>> obtenerUbicacionesPorZona(@PathVariable Long zonaId) {
        return ResponseEntity.ok(gpsService.obtenerUbicacionesPorZona(zonaId));
    }

    @GetMapping("/cercano")
    public ResponseEntity<CercaniaResponseDTO> checkCercania(Principal principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(gpsService.calcularCercaniaVecino(principal.getName()));
    }
}
