package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.constants.ApiRoutes;
import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.DashboardDTO;
import bo.edu.sos.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiRoutes.ADMIN_DASHBOARD)
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardDTO>> obtenerResumen() {
        return ResponseEntity.ok(
                ApiResponse.ok(dashboardService.obtenerResumen()));
    }
}