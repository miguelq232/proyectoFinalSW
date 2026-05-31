package com.igcsscz.backend.modules.zona;

import com.igcsscz.backend.modules.zona.dto.ZonaRequestDTO;
import com.igcsscz.backend.modules.zona.dto.ZonaResponseDTO;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/zonas")
public class ZonaController {

    private final ZonaService zonaService;

    public ZonaController(ZonaService zonaService) {
        this.zonaService = zonaService;
    }

    @GetMapping
    public ResponseEntity<List<ZonaResponseDTO>> getAllZonas() {
        return ResponseEntity.ok(zonaService.getAllZonas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ZonaResponseDTO> getZonaById(@PathVariable Long id) {
        return ResponseEntity.ok(zonaService.getZonaById(id));
    }

    @PostMapping
    public ResponseEntity<ZonaResponseDTO> createZona(@Valid @RequestBody ZonaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(zonaService.createZona(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ZonaResponseDTO> updateZona(
            @PathVariable Long id, @Valid @RequestBody ZonaRequestDTO request) {
        return ResponseEntity.ok(zonaService.updateZona(id, request));
    }

    @PatchMapping("/{id}/activo")
    public ResponseEntity<ZonaResponseDTO> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(zonaService.toggleActive(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteZona(@PathVariable Long id) {
        zonaService.deleteZona(id);
        return ResponseEntity.noContent().build();
    }
}
