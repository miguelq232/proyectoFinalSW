package com.igcsscz.backend.modules.camion;

import com.igcsscz.backend.modules.camion.dto.CamionRequestDTO;
import com.igcsscz.backend.modules.camion.dto.CamionResponseDTO;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/camiones")
public class CamionController {

    private final CamionService camionService;

    public CamionController(CamionService camionService) {
        this.camionService = camionService;
    }

    @GetMapping
    public ResponseEntity<List<CamionResponseDTO>> getAllCamiones() {
        return ResponseEntity.ok(camionService.getAllCamiones());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CamionResponseDTO> getCamionById(@PathVariable Long id) {
        return ResponseEntity.ok(camionService.getCamionById(id));
    }

    @PostMapping
    public ResponseEntity<CamionResponseDTO> createCamion(@Valid @RequestBody CamionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(camionService.createCamion(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CamionResponseDTO> updateCamion(
            @PathVariable Long id, @Valid @RequestBody CamionRequestDTO request) {
        return ResponseEntity.ok(camionService.updateCamion(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCamion(@PathVariable Long id) {
        camionService.deleteCamion(id);
        return ResponseEntity.noContent().build();
    }
}
