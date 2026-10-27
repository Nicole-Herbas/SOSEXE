-- SOS-78: mantener las alertas existentes sin inventar una fuente histórica.
ALTER TABLE alerta ADD COLUMN fuente VARCHAR(250) NULL;
