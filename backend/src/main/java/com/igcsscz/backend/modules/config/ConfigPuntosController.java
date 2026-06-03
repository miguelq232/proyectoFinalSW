package com.igcsscz.backend.modules.config;

import com.igcsscz.backend.modules.config.dto.ConfigPuntosRequestDTO;
import com.igcsscz.backend.modules.config.dto.ConfigPuntosResponseDTO;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/config-puntos")
public class ConfigPuntosController {

    private final ConfigPuntosService configPuntosService;

    public ConfigPuntosController(ConfigPuntosService configPuntosService) {
        this.configPuntosService = configPuntosService;
    }

    @GetMapping
    public ResponseEntity<List<ConfigPuntosResponseDTO>> getAll() {
        return ResponseEntity.ok(configPuntosService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConfigPuntosResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody ConfigPuntosRequestDTO request,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(configPuntosService.update(id, request, principal.getName()));
    }
}
