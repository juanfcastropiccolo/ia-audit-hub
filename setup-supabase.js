// Este script configura las tablas necesarias en Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Configurar __dirname equivalente para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Verificar variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: VITE_SUPABASE_URL y VITE_SUPABASE_SERVICE_KEY deben estar definidos en el archivo .env');
  process.exit(1);
}

// Crear cliente de Supabase con clave de servicio para tener privilegios de administrador
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Leer archivo SQL
const sqlPath = path.join(__dirname, 'supabase_setup.sql');
const sqlScript = fs.readFileSync(sqlPath, 'utf8');

// Dividir el script en sentencias individuales
const statements = sqlScript
  .split(';')
  .map(statement => statement.trim())
  .filter(statement => statement.length > 0);

// Ejecutar cada sentencia SQL
async function executeStatements() {
  console.log('Iniciando configuración de Supabase...');
  
  try {
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Ejecutando sentencia ${i + 1}/${statements.length}...`);
      
      // Si es una sentencia que contiene CREATE TRIGGER o CREATE POLICY, ejecutarla directamente
      const { error } = await supabase.rpc('pgexec', { query: statement + ';' });
      
      if (error) {
        console.error(`Error en la sentencia ${i + 1}:`, error);
        console.log('Sentencia SQL:', statement);
      } else {
        console.log(`Sentencia ${i + 1} ejecutada correctamente`);
      }
    }
    
    console.log('¡Configuración completada con éxito!');
  } catch (error) {
    console.error('Error al ejecutar las sentencias SQL:', error);
  }
}

executeStatements(); 