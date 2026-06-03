package com.igcsscz.backend.modules.puntos;

import com.igcsscz.backend.modules.puntos.dto.PuntosRequestDTO;
import com.igcsscz.backend.modules.puntos.dto.PuntosResponseDTO;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/puntos")
public class PuntosController {

    private final PuntosService puntosService;

    public PuntosController(PuntosService puntosService) {
        this.puntosService = puntosService;
    }

    @PostMapping("/deposito")
    public ResponseEntity<PuntosResponseDTO> registrarDeposito(@RequestBody PuntosRequestDTO request) {
        return ResponseEntity.ok(puntosService.registrarDeposito(request));
    }

    @GetMapping("/historial")
    public ResponseEntity<List<PuntosResponseDTO>> getHistorial(Principal principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(puntosService.getHistorialVecino(principal.getName()));
    }

    @GetMapping("/total")
    public ResponseEntity<Integer> getTotal(Principal principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(puntosService.getPuntosVecino(principal.getName()));
    }
}
