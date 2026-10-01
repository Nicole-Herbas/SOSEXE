package bo.edu.sos.backend.exception;

import bo.edu.sos.backend.dto.ApiResponse;

import org.springframework.dao.DataIntegrityViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;


@RestControllerAdvice
public class GlobalExceptionHandler {


        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(
                ResourceNotFoundException ex) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                ApiResponse.error(
                                        ex.getMessage()
                                )
                        );
        }


        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ApiResponse<Void>> handleBadRequest(
                BadRequestException ex) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                ApiResponse.error(
                                        ex.getMessage()
                                )
                        );
        }


        @ExceptionHandler(DuplicateResourceException.class)
        public ResponseEntity<ApiResponse<Void>> handleDuplicateResource(
                DuplicateResourceException ex) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(
                                ApiResponse.error(
                                        ex.getMessage()
                                )
                        );
        }


        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
                MethodArgumentNotValidException ex) {

                Map<String, String> errores =
                        new HashMap<>();


                ex.getBindingResult()
                        .getFieldErrors()
                        .forEach(error ->
                                errores.put(
                                        error.getField(),
                                        error.getDefaultMessage()
                                )
                        );


                ApiResponse<Map<String, String>> response =
                        ApiResponse.error(
                                "Error de validación"
                        );

                response.setData(
                        errores
                );


                return ResponseEntity
                        .status(
                                HttpStatus.UNPROCESSABLE_CONTENT
                        )
                        .body(
                                response
                        );
        }

        
        // SOS-41: un archivo supera el límite de 10 MB
        @ExceptionHandler(MaxUploadSizeExceededException.class)
        public ResponseEntity<ApiResponse<Void>> handleMaxUploadSize(
                MaxUploadSizeExceededException ex) {

                return ResponseEntity
                        .status(HttpStatus.CONTENT_TOO_LARGE)
                        .body(ApiResponse.error(
                                "Los archivos superan el tamaño máximo permitido (10 MB por archivo)"));
        }

        // SOS-41: falta una parte del multipart (por ejemplo, un documento)
        @ExceptionHandler(MissingServletRequestPartException.class)
        public ResponseEntity<ApiResponse<Void>> handleMissingPart(
                MissingServletRequestPartException ex) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error(
                                "Falta la parte requerida: " + ex.getRequestPartName()));
        }

        // SOS-41: se envió un Content-Type que el endpoint no acepta
        @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
        public ResponseEntity<ApiResponse<Void>> handleMediaTypeNotSupported(
                HttpMediaTypeNotSupportedException ex) {

                return ResponseEntity
                        .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                        .body(ApiResponse.error(
                                "Tipo de contenido no soportado por este endpoint"));
        }


        @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
        public ResponseEntity<ApiResponse<Void>> handleMethodNotSupported(
                HttpRequestMethodNotSupportedException ex) {

                return ResponseEntity
                        .status(
                                HttpStatus.METHOD_NOT_ALLOWED
                        )
                        .body(
                                ApiResponse.error(
                                        "Método HTTP no permitido para este endpoint"
                                )
                        );
        }


        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ApiResponse<Void>> handleInvalidJson(
                HttpMessageNotReadableException ex) {

                return ResponseEntity
                        .status(
                                HttpStatus.BAD_REQUEST
                        )
                        .body(
                                ApiResponse.error(
                                        "El cuerpo de la solicitud contiene un JSON inválido"
                                )
                        );
        }


        @ExceptionHandler(MissingServletRequestParameterException.class)
        public ResponseEntity<ApiResponse<Void>> handleMissingParameter(
                MissingServletRequestParameterException ex) {

                return ResponseEntity
                        .status(
                                HttpStatus.BAD_REQUEST
                        )
                        .body(
                                ApiResponse.error(
                                        "Falta el parámetro requerido: "
                                                + ex.getParameterName()
                                )
                        );
        }


        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(
                MethodArgumentTypeMismatchException ex) {

                return ResponseEntity
                        .status(
                                HttpStatus.BAD_REQUEST
                        )
                        .body(
                                ApiResponse.error(
                                        "Valor inválido para el parámetro: "
                                                + ex.getName()
                                )
                        );
        }


        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(
                DataIntegrityViolationException ex) {

                return ResponseEntity
                        .status(
                                HttpStatus.CONFLICT
                        )
                        .body(
                                ApiResponse.error(
                                        "Conflicto de integridad de datos"
                                )
                        );
        }


        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<Void>> handleGenericException(
                Exception ex) {

                return ResponseEntity
                        .status(
                                HttpStatus.INTERNAL_SERVER_ERROR
                        )
                        .body(
                                ApiResponse.error(
                                        "Error interno del servidor"
                                )
                        );
        }
        @ExceptionHandler(ForbiddenException.class)
        public ResponseEntity<ApiResponse<Void>> handleForbidden(
                ForbiddenException ex) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                ApiResponse.error(
                                        ex.getMessage()
                                )
                        );
        }
}