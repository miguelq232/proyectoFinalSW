package com.igcsscz.backend.modules.vecino;

import com.igcsscz.backend.modules.vecino.dto.VecinoResponseDTO;
import java.security.Principal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vecinos")
public class VecinoController {

    private final VecinoService vecinoService;

    public VecinoController(VecinoService vecinoService) {
        this.vecinoService = vecinoService;
    }

    @GetMapping("/me")
    public ResponseEntity<VecinoResponseDTO> getMyProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(vecinoService.getMyProfile(principal.getName()));
    }
}
