CREATE DATABASE IF NOT EXISTS asistencia_ml
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE asistencia_ml;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_codigo (codigo)
);

CREATE TABLE IF NOT EXISTS usuario_fotos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  url TEXT NOT NULL,
  public_id VARCHAR(255) NOT NULL,
  local_path TEXT NULL,
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_usuario_fotos_usuario_id (usuario_id),
  CONSTRAINT fk_usuario_fotos_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS registros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  codigo VARCHAR(50) NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  INDEX idx_registros_fecha_hora (fecha, hora),
  INDEX idx_registros_codigo_fecha (codigo, fecha)
);
